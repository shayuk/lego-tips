import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { defineSecret } from "firebase-functions/params";
import { assessMaterialQuality, validateAssignmentSpecificity, MaterialQualityReport } from "../../shared/materialQuality";
import { searchScholarlySources, formatAPA7References, ScholarlySource } from "../../shared/scholarlySearch";
import { buildTipEnforcementPrompt, validateTipCompliance, normalizeRubricHtmlToPointRanges } from "../../shared/tipImplementation";

// Initialize Firebase Admin
admin.initializeApp();

// Define secrets for API keys
const openAIKeySecret = defineSecret("OPENAI_KEY");
const claudeKeySecret = defineSecret("CLAUDE_API_KEY");

// Cached AI clients (lazy initialization - only accessed inside handlers)
let openai: OpenAI | null = null;
let claude: Anthropic | null = null;

// Lazy initialization functions - ONLY called inside handler bodies after request received
// This ensures secret.value() is never accessed during module load/deployment analysis
function initializeOpenAIClient(): OpenAI | null {
  // Return cached client if already initialized
  if (openai !== null) {
    return openai;
  }

  // Initialize only when actually needed (inside handler execution)
  try {
    const openaiKey = openAIKeySecret.value();
    if (!openaiKey || openaiKey.trim().length === 0) {
      logger.warn("OpenAI key is missing or empty");
      return null;
    }
    openai = new OpenAI({
      apiKey: openaiKey,
    });
    logger.info("OpenAI client initialized");
    return openai;
  } catch (error) {
    logger.warn("OpenAI key not available:", error);
    return null;
  }
}

function initializeClaudeClient(): Anthropic | null {
  // Return cached client if already initialized
  if (claude !== null) {
    return claude;
  }

  // Initialize only when actually needed (inside handler execution)
  try {
    const claudeKey = claudeKeySecret.value();
    if (!claudeKey || claudeKey.trim().length === 0) {
      logger.warn("Claude key is missing or empty");
      return null;
    }
    claude = new Anthropic({
      apiKey: claudeKey,
    });
    logger.info("Claude client initialized");
    return claude;
  } catch (error) {
    logger.warn("Claude key not available:", error);
    return null;
  }
}

// Interface for assignment parameters
interface AssignmentParams {
  courseName: string;
  faculty?: string;
  department?: string;
  courseDescription?: string;
  selectedMethods?: Array<{
    title: string;
    description: string;
  }>;
  uploadedFiles?: any[];
  preferredProvider?: 'openai';
}

// Interfaces imported from shared modules:
// - ScholarlySource from shared/scholarlySearch.ts
// - MaterialQualityReport from shared/materialQuality.ts

// Interface for structured assignment response
interface StructuredAssignment {
  title: string;
  description: string;
  instructions: string[];
  requirements: string[];
  studentInstructionsHtml?: string; // Full HTML for student instructions (including tasks and tip implementations)
  tasks?: string[]; // List of specific tasks/deliverables
  rubricCriteria?: Array<{
    name: string;
    description: string;
    levels: string[];
  }>;
  rubricHtml?: string; // Rubric table HTML only (with point ranges)
  fullAssignmentHtml?: string; // Complete assignment HTML built from structured fields
  modelUsed: string;
  generatedAt: string;
  estimatedHours?: number;
  difficulty?: string;
  groundingMode?: "uploaded" | "web" | "hybrid";
  sourcesUsed?: ScholarlySource[];
  apa7References?: string[];
  materialQualityReport?: MaterialQualityReport;
  debug?: {
    generatorVersion?: string;
    usedTipEnforcer?: boolean;
    selectedTipsCount?: number;
    rubricPointRanges?: boolean;
    usedWebFallback?: boolean;
    renderedFrom?: "structuredAssignment" | "legacy";
  };
}

/**
 * Build full assignment HTML from structured fields
 */
function buildFullAssignmentHtml(
  structuredAssignment: StructuredAssignment,
  courseName: string,
  faculty?: string,
  department?: string
): string {
  const { title, description, instructions, requirements, studentInstructionsHtml, rubricHtml } = structuredAssignment;
  
  // Use studentInstructionsHtml if available, otherwise build from structured fields
  let instructionsSection = '';
  if (studentInstructionsHtml) {
    instructionsSection = studentInstructionsHtml;
  } else {
    // Build instructions section from structured fields
    instructionsSection = `
      <div style="margin-top: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <h2 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 5px; margin-bottom: 15px;">
          הוראות למטלה
        </h2>
        <ol style="padding-right: 20px; line-height: 1.8;">
          ${instructions.map(inst => `<li style="margin-bottom: 10px;">${inst}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  // Build requirements section
  const requirementsSection = requirements && requirements.length > 0 ? `
    <div style="margin-top: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <h2 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 5px; margin-bottom: 15px;">
        דרישות הגשה
      </h2>
      <ul style="padding-right: 20px; line-height: 1.8;">
        ${requirements.map(req => {
          // Remove past due dates - replace with placeholder
          const cleanedReq = req.replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, 'תאריך שיקבע ע״י המרצה')
                                 .replace(/15\/05\/2022/g, 'תאריך שיקבע ע״י המרצה')
                                 .replace(/תאריך הגשה[:\s]*\d{1,2}\/\d{1,2}\/\d{4}/gi, 'תאריך הגשה: ייקבע ע״י המרצה');
          return `<li style="margin-bottom: 10px;">${cleanedReq}</li>`;
        }).join('')}
      </ul>
    </div>
  ` : '';

  // Build full HTML
  const fullHtml = `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; max-width: 900px; margin: 0 auto;">
      <h1 style="color: #1976d2; text-align: center; margin-bottom: 20px; border-bottom: 3px solid #1976d2; padding-bottom: 10px;">
        ${title}
      </h1>
      
      ${courseName || faculty || department ? `
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: right;">
          ${courseName ? `<p style="margin: 5px 0;"><strong>קורס:</strong> ${courseName}</p>` : ''}
          ${faculty ? `<p style="margin: 5px 0;"><strong>פקולטה:</strong> ${faculty}</p>` : ''}
          ${department ? `<p style="margin: 5px 0;"><strong>מחלקה:</strong> ${department}</p>` : ''}
        </div>
      ` : ''}
      
      <div style="margin-top: 20px; line-height: 1.8;">
        <h2 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 5px; margin-bottom: 15px;">
          תיאור המטלה
        </h2>
        <p style="text-align: right; line-height: 1.8;">${description}</p>
      </div>
      
      ${instructionsSection}
      
      ${requirementsSection}
      
      ${rubricHtml || ''}
    </div>
  `;
  
  return fullHtml;
}

// Helper function to parse AI response into structured format
function parseAIResponseToStructuredFormat(
  content: string,
  courseName: string,
  selectedMethods: Array<{ title: string; description?: string }>,
  provider: string
): StructuredAssignment {
  try {
    // Try to parse if it's already JSON
    const parsed = JSON.parse(content);
    if (parsed.title && parsed.description) {
      return {
        ...parsed,
        modelUsed: provider,
        generatedAt: new Date().toISOString()
      };
    }
  } catch (e) {
    // Not JSON, continue with text parsing
  }

  // Parse text content into structured format
  
  // Extract title
  const titleMatch = content.match(/(?:מטלה|כותרת|נושא)[:\s]*([^\n]+)/i);
  const title = titleMatch ? titleMatch[1].trim() : `מטלה אינטגרטיבית בקורס ${courseName}`;
  
  // Extract description
  const descMatch = content.match(/(?:תיאור|מבוא|רקע)[:\s]*([^\n]+(?:\n[^\n]+)*?)(?:\n\n|\nהוראות|\nדרישות|$)/i);
  const description = descMatch ? 
    descMatch[1].trim() : 
    `מטלה זו משלבת מספר שיטות פדגוגיות מתקדמות: ${selectedMethods.map(m => m.title).join(', ')}`;
  
  // Extract instructions
  const instructionsMatch = content.match(/(?:הוראות|הנחיות|שלבים)[:\s]*\n((?:\d+\.\s*[^\n]+\n?)+)/i);
  let instructions: string[] = [];
  if (instructionsMatch) {
    instructions = instructionsMatch[1]
      .split('\n')
      .filter(line => line.trim() && /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
  } else {
    instructions = [
      'קראו בעיון את כל החומרים הנדרשים',
      'נתחו את הנושא בצורה ביקורתית ועמוקה',
      'השתמשו במקורות אקדמיים מהימנים בלבד',
      'כתבו את העבודה במבנה אקדמי ברור',
      'הגישו את העבודה במועד שיקבע ע״י המרצה'
    ];
  }
  
  // Extract requirements
  const reqMatch = content.match(/(?:דרישות|תנאים|קריטריונים)[:\s]*\n((?:[-•]\s*[^\n]+\n?)+)/i);
  let requirements: string[] = [];
  if (reqMatch) {
    requirements = reqMatch[1]
      .split('\n')
      .filter(line => line.trim() && /^[-•]/.test(line.trim()))
      .map(line => line.replace(/^[-•]\s*/, '').trim());
  } else {
    requirements = [
      'אורך: 8-12 עמודים',
      'גופן: David או Arial, גודל 12',
      'לפחות 8 מקורות אקדמיים',
      'ציטוט לפי תקן APA',
      'תאריך הגשה: ייקבע ע״י המרצה'
    ];
  }
  
  // Generate rubric HTML with point ranges (0-7, 8-15, 16-20)
  const rubricCriteria: Array<{ name: string; description: string; levels: string[] }> = [
    {
      name: 'איכות תוכן',
      description: 'עומק הניתוח ורמת ההבנה',
      levels: ['ביצוע בסיסי (0–7 נקודות)', 'ביצוע מתקדם (8–15 נקודות)', 'ביצוע מיטבי (16–20 נקודות)']
    },
    {
      name: 'מקורות ומחקר',
      description: 'איכות המקורות ושימוש נכון בהם',
      levels: ['ביצוע בסיסי (0–7 נקודות)', 'ביצוע מתקדם (8–15 נקודות)', 'ביצוע מיטבי (16–20 נקודות)']
    },
    {
      name: 'כתיבה אקדמית',
      description: 'רמת הכתיבה והביטוי האקדמי',
      levels: ['ביצוע בסיסי (0–7 נקודות)', 'ביצוע מתקדם (8–15 נקודות)', 'ביצוע מיטבי (16–20 נקודות)']
    }
  ];
  
  // Add method-specific criteria
  selectedMethods.forEach(method => {
    if (method.title && method.title.includes('AI רפלקציה')) {
      rubricCriteria.push({
        name: 'רפלקציה על AI',
        description: 'איכות הניתוח הביקורתי של תגובות ה-AI',
        levels: ['ביצוע בסיסי (0–7 נקודות)', 'ביצוע מתקדם (8–15 נקודות)', 'ביצוע מיטבי (16–20 נקודות)']
      });
    }
    if (method.title && method.title.includes('עבודה קבוצתית')) {
      rubricCriteria.push({
        name: 'שיתוף פעולה',
        description: 'יעילות העבודה הקבוצתית והחלוקה ההוגנת',
        levels: ['ביצוע בסיסי (0–7 נקודות)', 'ביצוע מתקדם (8–15 נקודות)', 'ביצוע מיטבי (16–20 נקודות)']
      });
    }
  });
  
  const rubricHtml = `
    <div style="margin-top: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <h3 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 5px; margin-bottom: 15px;">
        מחוון הערכה (רובריקה)
      </h3>
      <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">קריטריון</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">ביצוע בסיסי (0–7 נקודות)</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">ביצוע מתקדם (8–15 נקודות)</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">ביצוע מיטבי (16–20 נקודות)</th>
          </tr>
        </thead>
        <tbody>
          ${rubricCriteria.map((criterion, index) => `
            <tr style="background: ${index % 2 === 0 ? '#fafafa' : '#ffffff'};">
              <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #333;">${criterion.name}</td>
              <td style="border: 1px solid #ddd; padding: 12px; color: #666;">ביצוע חלקי או לא מספק של הדרישות</td>
              <td style="border: 1px solid #ddd; padding: 12px; color: #666;">ביצוע טוב של רוב הדרישות</td>
              <td style="border: 1px solid #ddd; padding: 12px; color: #666;">ביצוע מעולה ומקיף של כל הדרישות</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="margin-top: 15px; padding: 10px; background: #e8f5e8; border-radius: 6px; color: #2e7d32;">
        <small><strong>נוצר באמצעות:</strong> ${provider} | <strong>תאריך:</strong> ${new Date().toLocaleDateString('he-IL')}</small>
      </div>
    </div>
  `;
  
  return {
    title: title,
    description: description,
    instructions: instructions,
    requirements: requirements,
    rubricCriteria: rubricCriteria,
    rubricHtml: rubricHtml,
    modelUsed: provider,
    generatedAt: new Date().toISOString()
  };
}

// Interface for provider attempt tracking
interface ProviderAttempt {
  provider: 'openai' | 'claude';
  ok: boolean;
  errorCode?: string;
  errorMessage?: string;
}

// Helper functions imported from shared modules:
// - assessMaterialQuality, validateAssignmentSpecificity from shared/materialQuality.ts
// - searchScholarlySources, formatAPA7References from shared/scholarlySearch.ts

// Main assignment generation function with provider fallback
export const generateAssignment = onCall(
  {
    secrets: [openAIKeySecret, claudeKeySecret],
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (request) => {
    const requestId = Math.random().toString(36).substring(7);
    const attempts: ProviderAttempt[] = [];
    let providerUsed: string = 'none';
    
    try {

      const params: AssignmentParams = request.data;
      const {
        courseName,
        faculty,
        department,
        courseDescription,
        selectedMethods = []
      } = params;

      // Input validation
      if (!courseName) {
        logger.error(`[${requestId}] Missing course name in request`);
        throw new HttpsError(
          'invalid-argument',
          'Course name is required',
          { code: 'MISSING_COURSE_NAME' }
        );
      }

      logger.info(`[${requestId}] Assignment generation request - Course: ${courseName}`);

      // Build comprehensive prompt
      const selectedComponents = selectedMethods.map(m => m.title || 'שיטה פדגוגית');
      const methodsText = selectedMethods.length > 0
        ? selectedMethods.map(m => `- ${m.title}: ${m.description || ''}`).join('\n')
        : 'שיטות הוראה מגוונות';

      // STEP 1: Assess material quality
      const userRequestText = `${courseName} ${faculty || ''} ${department || ''} ${courseDescription || ''}`.trim();
      const materialText = courseDescription || '';
      const qualityReport = assessMaterialQuality(userRequestText, materialText);
      logger.info(`[${requestId}] Material quality: ${qualityReport.quality}, coverage: ${qualityReport.coverageScore.toFixed(2)}`);

      // STEP 2: Scholarly Web Fallback if needed
      let scholarlySources: ScholarlySource[] = [];
      let groundingMode: "uploaded" | "web" | "hybrid" = "uploaded";

      if (qualityReport.quality !== "good") {
        logger.info(`[${requestId}] Material quality insufficient, searching scholarly sources...`);
        const searchQuery = `${courseName} ${courseDescription || ''}`.trim();
        scholarlySources = await searchScholarlySources(searchQuery, 8);
        
        if (scholarlySources.length > 0) {
          groundingMode = qualityReport.quality === "mismatched" ? "web" : "hybrid";
          logger.info(`[${requestId}] Found ${scholarlySources.length} scholarly sources, using ${groundingMode} mode`);
        } else {
          logger.warn(`[${requestId}] No scholarly sources found, proceeding with uploaded material`);
        }
      }

      // Check if content is minimal
      const hasMinimalContent = !courseDescription || courseDescription.trim().length < 5;
      const hasPlaceholderContent = courseDescription?.includes('לא הועלה תוכן קורס ספציפי');

      // Build course context
      const courseContext = courseName && faculty && department
        ? `שם הקורס: "${courseName}"
     פקולטה: "${faculty}"
     מחלקה: "${department}"`
        : '';

      const systemPrompt = `אתה מומחה פדגוגי ובונה תכניות לימודים באקדמיה הישראלית. אתה מיומן ביצירת מטלות ספציפיות, ממוקדות ומעוררות מחשבה.

המשימה המרכזית שלך: ליצור מטלה אקדמית מלאה בפורמט HTML, כולל הוראות מפורטות, בסיס תיאורטי עשיר, ומחוון הערכה מקצועי.

**חשוב מאוד:** החזר את התשובה בפורמט HTML נקי ומסודר בעברית, ללא תגי HTML מיותרים בתחילה או בסוף. התחל ישירות עם תוכן המשימה והסתיים עם סיום המחוון.

**מבנה הפלט הנדרש:**
- כותרת המסמך (<h1>)
- פרטי הקורס (<div class="course-info">)
- מטרת המשימה (<h2>)
- תיאור המשימה והוראות (<h2>)
- דרישות הגשה (<h2>)
- מחוון הערכה (<h2> עם טבלה)

כלול בהכרח בהוראות המשימה:
- דרישות אורך: מינימום 800 מילים
- פורמט הגשה: קובץ Word (.docx) או מצגת PowerPoint
- תאריך הגשה ודרישות טכניות נוספות

כתוב מחוון הערכה מתקדם ומפורט (טבלה) שכולל קריטריונים ספציפיים לכל אחד מהרכיבים הפדגוגיים שנבחרו.`;

      // Build user prompt based on grounding mode
      let materialSection = '';
      if (groundingMode === "uploaded" && courseDescription) {
        materialSection = `תכני הקורס המפורטים:\n"${courseDescription}"`;
      } else if (groundingMode === "web" && scholarlySources.length > 0) {
        const sourcesText = scholarlySources.map((src, idx) => 
          `${idx + 1}. ${src.title} (${src.authors.slice(0, 2).join(', ')}${src.year ? `, ${src.year}` : ''})${src.abstractText ? `\n   תקציר: ${src.abstractText.substring(0, 300)}...` : ''}`
        ).join('\n\n');
        materialSection = `**מקורות אקדמיים שנמצאו (התבסס רק עליהם):**\n\n${sourcesText}\n\n**חשוב:** בנה מטלה ספציפית לפי הבקשה. אל תכתוב גנרי. התבסס רק על המקורות המצורפים.`;
      } else if (groundingMode === "hybrid") {
        const sourcesText = scholarlySources.map((src, idx) => 
          `${idx + 1}. ${src.title} (${src.authors.slice(0, 2).join(', ')}${src.year ? `, ${src.year}` : ''})${src.abstractText ? `\n   תקציר: ${src.abstractText.substring(0, 200)}...` : ''}`
        ).join('\n\n');
        materialSection = `תכני הקורס שהועלו:\n"${courseDescription || ''}"\n\n**מקורות אקדמיים נוספים:**\n\n${sourcesText}`;
      }

      // Build tip enforcement prompt
      const tipEnforcementPrompt = buildTipEnforcementPrompt(selectedMethods, courseDescription || courseName);

      const userPrompt = `
  ${courseContext}
  ${materialSection}
  
  **הרכיבים הפדגוגיים שנבחרו:** [${selectedComponents.join(', ')}]
  
  **הוראות חובה:**
  
  1. **נתח בקפידה את כל התכנים** שסופקו לעיל.
     ${hasMinimalContent || hasPlaceholderContent || groundingMode === "web"
        ? `**הוראות מיוחדות - תוכן הקורס חסר או מינימלי:**
  ${groundingMode === "web" ? 'התבסס על המקורות האקדמיים שנמצאו לעיל.' : 'מכיוון שהמרצה לא סיפק תוכן מפורט, תפקידך כעת הוא לפעול כחוקר פדגוגי ובונה תכניות לימודים.'}
  - בחר נושא ספציפי וממוקד אחד
  - הוסף למטלה בסיס תיאורטי עשיר
  ${groundingMode === "web" ? '- הוסף בסוף המטלה סעיף "מקורות ששימשו" עם רשימת המקורות בפורמט APA 7' : ''}`
        : `2. **בחר נושא ספציפי אחד וממוקד** מתוך תכני הקורס שסופקו.`}
  
  3. **שלב את כל הרכיבים הפדגוגיים שנבחרו באופן ספציפי ומשמעותי:**
  
  **חובה לשלב כל אחד מהרכיבים הבאים במטלה:** ${selectedComponents.join(", ")}
  
  **הנחיות מפורטות לשילוב רכיבים פדגוגיים:**
  ${methodsText}
  
  ${tipEnforcementPrompt}
  
  **אסור לך:**
  - להשתמש בדוגמאות דמיוניות או כלליות - תמיד התבסס על תכנים ספציפיים
  - ליצור משימות שאינן מתאימות לרמת הקורס או לתחום הלימוד
  - להתעלם מהתכנים הספציפיים שסופקו
  - לכתוב הוראות כלליות ולא ספציפיות
  - לשכוח רכיבים פדגוגיים שנבחרו
  - ליצור מחוון חלקי או לא מפורט
  ${groundingMode === "web" ? '- להמציא מקורות שלא סופקו' : ''}
  
  **מחוון הערכה - דרישות חובה:**
  - המחוון חייב להיות טבלה HTML עם העמודות הבאות (בסדר RTL):
    1. קריטריון
    2. ביצוע בסיסי (0–7 נקודות)
    3. ביצוע מתקדם (8–15 נקודות)
    4. ביצוע מיטבי (16–20 נקודות)
  - אסור להשתמש באחוזים (%)
  - כל קריטריון חייב לכלול תיאור לכל אחת משלוש רמות הביצוע
  
  **הפלט בעברית בפורמט HTML נקי וארגון מסודר** ללא תגי HTML מיותרים בתחילה או בסוף.`;

      let generatedContent = '';
      let activeClient: OpenAI | Anthropic | null = null;
      let activeProviderType: 'openai' | 'claude' | null = null;

      // Attempt 1: Try OpenAI
      const openaiClient = initializeOpenAIClient();
      if (openaiClient) {
        try {
          logger.info(`[${requestId}] Attempting OpenAI generation`);
          const completion = await openaiClient.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 4000,
            temperature: 0.7
          });

          if (completion.choices?.[0]?.message?.content) {
            generatedContent = completion.choices[0].message.content;
            providerUsed = 'OpenAI GPT-4';
            activeClient = openaiClient;
            activeProviderType = 'openai';
            attempts.push({ provider: 'openai', ok: true });
            logger.info(`[${requestId}] OpenAI generation successful`);
          } else {
            throw new Error('OpenAI returned empty response');
          }
        } catch (error: any) {
          const errorCode = error?.status === 429 ? 'RATE_LIMIT' : 
                           error?.status >= 500 ? 'SERVER_ERROR' :
                           error?.status === 401 ? 'AUTH_ERROR' : 'UNKNOWN_ERROR';
          attempts.push({
            provider: 'openai',
            ok: false,
            errorCode,
            errorMessage: error?.message || 'Unknown error'
          });
          logger.warn(`[${requestId}] OpenAI generation failed: ${error.message}`);
        }
      } else {
        attempts.push({
          provider: 'openai',
          ok: false,
          errorCode: 'NOT_CONFIGURED',
          errorMessage: 'OpenAI key not configured'
        });
        logger.warn(`[${requestId}] OpenAI not configured, skipping`);
      }

      // Attempt 2: Try Claude if OpenAI failed
      if (!generatedContent) {
        const claudeClient = initializeClaudeClient();
        if (claudeClient) {
          try {
            logger.info(`[${requestId}] Attempting Claude generation`);
            const message = await claudeClient.messages.create({
              model: 'claude-3-sonnet-20240229',
              max_tokens: 4000,
              messages: [
                { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
              ]
            });

            if (message.content?.[0]?.type === 'text') {
              generatedContent = message.content[0].text;
              providerUsed = 'Claude 3 Sonnet';
              activeClient = claudeClient;
              activeProviderType = 'claude';
              attempts.push({ provider: 'claude', ok: true });
              logger.info(`[${requestId}] Claude generation successful`);
            } else {
              throw new Error('Claude returned empty response');
            }
          } catch (error: any) {
            const errorCode = error?.status === 429 ? 'RATE_LIMIT' : 
                             error?.status >= 500 ? 'SERVER_ERROR' :
                             error?.status === 401 ? 'AUTH_ERROR' : 'UNKNOWN_ERROR';
            attempts.push({
              provider: 'claude',
              ok: false,
            errorCode,
            errorMessage: error?.message || 'Unknown error'
          });
          logger.warn(`[${requestId}] Claude generation failed: ${error.message}`);
          }
        } else {
          attempts.push({
            provider: 'claude',
            ok: false,
            errorCode: 'NOT_CONFIGURED',
            errorMessage: 'Claude key not configured'
          });
          logger.warn(`[${requestId}] Claude not configured, skipping`);
        }
      }

      // If all providers failed, return structured failure
      if (!generatedContent) {
        logger.error(`[${requestId}] All providers failed. Attempts:`, attempts);
        throw new HttpsError(
          'internal',
          'All AI providers failed. Please try again later.',
          {
            code: 'ALL_PROVIDERS_FAILED',
            attempts,
            requestId
          }
        );
      }

      // STEP 3: Validate assignment specificity
      const isSpecific = validateAssignmentSpecificity(generatedContent, userRequestText);
      if (!isSpecific && groundingMode !== "web") {
        logger.warn(`[${requestId}] Assignment may be too generic, but proceeding (one-time only)`);
      }

      // Parse the AI response into structured format
      const structuredAssignment = parseAIResponseToStructuredFormat(
        generatedContent,
        courseName,
        selectedMethods,
        providerUsed
      );

      // Validate tip compliance
      const compliance = validateTipCompliance(structuredAssignment, selectedMethods);
      if (!compliance.ok && selectedMethods.length > 0) {
        logger.warn(`[${requestId}] Tip compliance check failed:`, compliance.missing);
        // If critical tips are missing, regenerate once with stricter prompt
        const criticalMissing = compliance.missing.filter(m => 
          m.includes('Prompt A') || m.includes('Prompt B') || m.includes('יישום הטיפ')
        );
        if (criticalMissing.length > 0 && activeClient && activeProviderType) {
          logger.info(`[${requestId}] Regenerating with stricter tip enforcement`);
          const stricterPrompt = `${userPrompt}\n\n**תיקון חובה:** התשובה הקודמת שלך חסרה את הדברים הבאים:\n${criticalMissing.map(m => `- ${m}`).join('\n')}\n\nאנא צור מטלה חדשה שמכילה את כל הדרישות הנ"ל.`;
          
          try {
            let retryContent = '';
            if (activeProviderType === 'openai') {
              const retryCompletion = await (activeClient as OpenAI).chat.completions.create({
                model: 'gpt-4o',
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: stricterPrompt }
                ],
                max_tokens: 4000,
                temperature: 0.7
              });
              retryContent = retryCompletion.choices?.[0]?.message?.content || '';
            } else if (activeProviderType === 'claude') {
              const retryMessage = await (activeClient as Anthropic).messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 4000,
                messages: [
                  { role: 'user', content: `${systemPrompt}\n\n${stricterPrompt}` }
                ]
              });
              retryContent = retryMessage.content?.[0]?.type === 'text' ? retryMessage.content[0].text : '';
            }

            if (retryContent) {
              generatedContent = retryContent;
              const retryStructured = parseAIResponseToStructuredFormat(
                generatedContent,
                courseName,
                selectedMethods,
                providerUsed
              );
              Object.assign(structuredAssignment, retryStructured);
            }
          } catch (retryError: any) {
            logger.warn(`[${requestId}] Retry generation failed: ${retryError.message}, proceeding with original`);
          }
        }
      }

      // Extract studentInstructionsHtml and rubricHtml from generatedContent
      const trimmed = (generatedContent || "").trimStart();
      const looksLikeHtml =
        trimmed.startsWith("<") &&
        /<(table|tbody|thead|tr|td|th|div|p|ul|ol|h\d)\b/i.test(trimmed);

      if (looksLikeHtml) {
        // Remove past due dates from content
        let cleanedContent = generatedContent
          .replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, (match) => {
            // Check if date is in the past (before today)
            const dateParts = match.split('/');
            if (dateParts.length === 3) {
              const day = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
              const year = parseInt(dateParts[2]);
              const date = new Date(year, month, day);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (date < today) {
                return 'תאריך שיקבע ע״י המרצה';
              }
            }
            return match;
          })
          .replace(/15\/05\/2022/g, 'תאריך שיקבע ע״י המרצה')
          .replace(/תאריך הגשה[:\s]*\d{1,2}\/\d{1,2}\/\d{4}/gi, 'תאריך הגשה: ייקבע ע״י המרצה');

        // Try to separate rubric from instructions
        // Look for rubric markers: "מחוון", "רובריקה", "rubric", table with "קריטריון"
        const rubricMarkers = [
          /<h[23][^>]*>.*?מחוון.*?<\/h[23]>/i,
          /<h[23][^>]*>.*?רובריקה.*?<\/h[23]>/i,
          /<table[^>]*>[\s\S]*?קריטריון[\s\S]*?<\/table>/i
        ];
        
        let rubricStartIndex = -1;
        for (const marker of rubricMarkers) {
          const match = cleanedContent.search(marker);
          if (match !== -1) {
            rubricStartIndex = match;
            break;
          }
        }

        if (rubricStartIndex !== -1) {
          // Extract studentInstructionsHtml (everything before rubric)
          structuredAssignment.studentInstructionsHtml = cleanedContent.substring(0, rubricStartIndex).trim();
          
          // Extract rubricHtml (from rubric marker to end, or just the table)
          const rubricMatch = cleanedContent.match(/<table[^>]*>[\s\S]*?<\/table>/i);
          if (rubricMatch) {
            structuredAssignment.rubricHtml = rubricMatch[0];
          } else {
            structuredAssignment.rubricHtml = cleanedContent.substring(rubricStartIndex).trim();
          }
        } else {
          // No clear separation - use full content as studentInstructionsHtml
          // Try to extract rubric table if it exists
          const rubricTableMatch = cleanedContent.match(/<table[^>]*>[\s\S]*?<\/table>/i);
          if (rubricTableMatch) {
            structuredAssignment.studentInstructionsHtml = cleanedContent.replace(rubricTableMatch[0], '').trim();
            structuredAssignment.rubricHtml = rubricTableMatch[0];
          } else {
            structuredAssignment.studentInstructionsHtml = cleanedContent;
            // rubricHtml will be built from rubricCriteria below
          }
        }
      }

      // Normalize rubric HTML to use point ranges (0-7, 8-15, 16-20)
      if (structuredAssignment.rubricHtml) {
        structuredAssignment.rubricHtml = normalizeRubricHtmlToPointRanges(structuredAssignment.rubricHtml);
      } else if (structuredAssignment.rubricCriteria && structuredAssignment.rubricCriteria.length > 0) {
        // Build rubricHtml from rubricCriteria if not extracted
        const rubricHtml = `
          <div style="margin-top: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 5px; margin-bottom: 15px;">
              מחוון הערכה (רובריקה)
            </h3>
            <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">קריטריון</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">ביצוע בסיסי (0–7 נקודות)</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">ביצוע מתקדם (8–15 נקודות)</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">ביצוע מיטבי (16–20 נקודות)</th>
                </tr>
              </thead>
              <tbody>
                ${structuredAssignment.rubricCriteria.map((criterion, index) => `
                  <tr style="background: ${index % 2 === 0 ? '#fafafa' : '#ffffff'};">
                    <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #333;">${criterion.name}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; color: #666;">ביצוע חלקי או לא מספק של הדרישות</td>
                    <td style="border: 1px solid #ddd; padding: 12px; color: #666;">ביצוע טוב של רוב הדרישות</td>
                    <td style="border: 1px solid #ddd; padding: 12px; color: #666;">ביצוע מעולה ומקיף של כל הדרישות</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
        structuredAssignment.rubricHtml = rubricHtml;
      }

      // Build full assignment HTML from structured fields
      structuredAssignment.fullAssignmentHtml = buildFullAssignmentHtml(
        structuredAssignment,
        courseName,
        faculty,
        department
      );

      // STEP 4: Add grounding metadata
      structuredAssignment.groundingMode = groundingMode;
      structuredAssignment.materialQualityReport = qualityReport;
      if (scholarlySources.length > 0) {
        structuredAssignment.sourcesUsed = scholarlySources;
        structuredAssignment.apa7References = formatAPA7References(scholarlySources);
      }

      // STEP 5: Add debug fields
      const hasPointRanges = structuredAssignment.rubricHtml?.includes('(0–7 נקודות)') || 
                              structuredAssignment.rubricHtml?.includes('(0-7 נקודות)') ||
                              structuredAssignment.rubricHtml?.includes('(8–15 נקודות)') ||
                              structuredAssignment.rubricHtml?.includes('(8-15 נקודות)');
      
      structuredAssignment.debug = {
        generatorVersion: process.env.GIT_SHA || 'dev',
        usedTipEnforcer: selectedMethods.length > 0,
        selectedTipsCount: selectedMethods.length,
        rubricPointRanges: hasPointRanges || false,
        usedWebFallback: groundingMode === "web",
        renderedFrom: structuredAssignment.fullAssignmentHtml ? "structuredAssignment" : "legacy"
      };

      logger.info(`[${requestId}] Assignment generated successfully using ${providerUsed}, mode: ${groundingMode}`);
      logger.info(`[${requestId}] Debug: ${JSON.stringify(structuredAssignment.debug)}`);

      return {
        success: true,
        data: structuredAssignment,
        providerUsed,
        attempts,
        requestId,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error(`[${requestId}] Assignment generation failed:`, error);
      
      // If it's already an HttpsError with attempts, preserve them
      const attempts = (error as any)?.details?.attempts;
      if (error instanceof HttpsError && attempts) {
        throw error;
      }
      
      // Otherwise, wrap in HttpsError with attempts if available
      throw new HttpsError(
        'internal',
        error.message || 'Assignment generation failed',
        {
          details: error.details || error.message,
          code: error.code || 'GENERATION_ERROR',
          attempts: attempts.length > 0 ? attempts : undefined,
          requestId
        }
      );
    }
  }
);

// Legacy function for backward compatibility (if needed)
export const callChatGpt = onCall(
  {
    secrets: [openAIKeySecret],
  },
  async (request) => {
    try {
      logger.info("Function received a request.", { data: request.data });

      // Lazy initialization - only happens inside handler after request received
      const openaiClient = initializeOpenAIClient();

      const userPrompt = request.data?.prompt;

      if (!userPrompt) {
        logger.error("Request body is missing the 'prompt' field.");
        throw new HttpsError(
          'invalid-argument',
          "Missing prompt in request body."
        );
      }

      if (!openaiClient) {
        logger.error("OpenAI client is not configured.");
        throw new HttpsError(
          'failed-precondition',
          "OpenAI client is not configured."
        );
      }

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: userPrompt }],
      });

      const aiResponse = completion.choices[0].message.content;

      return { data: { result: aiResponse } };

    } catch (error: any) {
      logger.error("An unexpected error occurred:", error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError(
        'internal',
        "An internal error occurred.",
        { details: error.message }
      );
    }
  }
);

// Server status check function - callable (no CORS issues)
export const getServerStatus = onCall(
  {
    secrets: [openAIKeySecret, claudeKeySecret], // Include secrets to check if they're configured
  },
  async (request) => {
    try {
      // Check if OpenAI key is configured (without initializing the client)
      let openaiStatus: 'configured' | 'missing' = 'missing';
      try {
        const openaiKey = openAIKeySecret.value();
        openaiStatus = openaiKey && openaiKey.trim().length > 0 ? 'configured' : 'missing';
      } catch (error) {
        // Secret not available or not set
        logger.warn("OpenAI key secret not accessible:", error);
        openaiStatus = 'missing';
      }

      // Check if Claude key is configured (without initializing the client)
      let claudeStatus: 'configured' | 'missing' = 'missing';
      try {
        const claudeKey = claudeKeySecret.value();
        claudeStatus = claudeKey && claudeKey.trim().length > 0 ? 'configured' : 'missing';
      } catch (error) {
        // Secret not available or not set
        logger.warn("Claude key secret not accessible:", error);
        claudeStatus = 'missing';
      }

      return {
        server: 'Pedagogical Lego Backend Proxy',
        version: '1.0.0',
        status: 'running',
        providers: {
          openai: openaiStatus,
          claude: claudeStatus
        },
        security: {
          cors: 'enabled',
          helmet: 'enabled',
          rateLimiting: 'enabled'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      logger.error("Error checking server status:", error);
      throw new HttpsError(
        'internal',
        'Failed to check server status',
        { details: error.message }
      );
    }
  }
);