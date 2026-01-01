import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { defineSecret } from "firebase-functions/params";

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

// Interface for structured assignment response
interface StructuredAssignment {
  title: string;
  description: string;
  instructions: string[];
  requirements: string[];
  rubricCriteria?: Array<{
    name: string;
    description: string;
    levels: string[];
  }>;
  rubricHtml?: string;
  modelUsed: string;
  generatedAt: string;
  estimatedHours?: number;
  difficulty?: string;
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
      'הגישו את העבודה במועד הנקוב'
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
      'הגשה עד לתאריך הנקוב'
    ];
  }
  
  // Generate rubric HTML
  const rubricCriteria: Array<{ name: string; description: string; levels: string[] }> = [
    {
      name: 'איכות תוכן',
      description: 'עומק הניתוח ורמת ההבנה',
      levels: ['מעולה (90-100)', 'טוב מאוד (80-89)', 'טוב (70-79)', 'מספק (60-69)']
    },
    {
      name: 'מקורות ומחקר',
      description: 'איכות המקורות ושימוש נכון בהם',
      levels: ['מעולה (90-100)', 'טוב מאוד (80-89)', 'טוב (70-79)', 'מספק (60-69)']
    },
    {
      name: 'כתיבה אקדמית',
      description: 'רמת הכתיבה והביטוי האקדמי',
      levels: ['מעולה (90-100)', 'טוב מאוד (80-89)', 'טוב (70-79)', 'מספק (60-69)']
    }
  ];
  
  // Add method-specific criteria
  selectedMethods.forEach(method => {
    if (method.title && method.title.includes('AI רפלקציה')) {
      rubricCriteria.push({
        name: 'רפלקציה על AI',
        description: 'איכות הניתוח הביקורתי של תגובות ה-AI',
        levels: ['מעולה (90-100)', 'טוב מאוד (80-89)', 'טוב (70-79)', 'מספק (60-69)']
      });
    }
    if (method.title && method.title.includes('עבודה קבוצתית')) {
      rubricCriteria.push({
        name: 'שיתוף פעולה',
        description: 'יעילות העבודה הקבוצתית והחלוקה ההוגנת',
        levels: ['מעולה (90-100)', 'טוב מאוד (80-89)', 'טוב (70-79)', 'מספק (60-69)']
      });
    }
  });
  
  const rubricHtml = `
    <div style="margin-top: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <h3 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 5px; margin-bottom: 15px;">
        מחוון הערכה (רובריקה)
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">קריטריון</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">תיאור</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">רמות הערכה</th>
          </tr>
        </thead>
        <tbody>
          ${rubricCriteria.map((criterion, index) => `
            <tr style="background: ${index % 2 === 0 ? '#fafafa' : '#ffffff'};">
              <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #333;">${criterion.name}</td>
              <td style="border: 1px solid #ddd; padding: 12px; color: #666;">${criterion.description}</td>
              <td style="border: 1px solid #ddd; padding: 12px;">
                ${criterion.levels.map(level => `<div style="margin: 5px 0; padding: 3px 8px; background: #f0f7ff; border-radius: 4px; color: #1976d2;">${level}</div>`).join('')}
              </td>
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

      const userPrompt = `
  ${courseContext}
  ${courseDescription ? `תכני הקורס המפורטים:\n"${courseDescription}"` : ''}
  
  **הרכיבים הפדגוגיים שנבחרו:** [${selectedComponents.join(', ')}]
  
  **הוראות חובה:**
  
  1. **נתח בקפידה את כל תכני הקורס** שסופקו לעיל.
     ${hasMinimalContent || hasPlaceholderContent
        ? `**הוראות מיוחדות - תוכן הקורס חסר או מינימלי:**
  מכיוון שהמרצה לא סיפק תוכן מפורט, תפקידך כעת הוא לפעול כחוקר פדגוגי ובונה תכניות לימודים.
  - חפש (בידע הפנימי שלך) סילבוס של קורס דומה באוניברסיטה ישראלית
  - בחר נושא ספציפי וממוקד אחד מתוך הסילבוס שמצאת
  - הוסף למטלה בסיס תיאורטי עשיר`
        : `2. **בחר נושא ספציפי אחד וממוקד** מתוך תכני הקורס שסופקו.`}
  
  3. **שלב את כל הרכיבים הפדגוגיים שנבחרו באופן ספציפי ומשמעותי:**
  
  **חובה לשלב כל אחד מהרכיבים הבאים במטלה:** ${selectedComponents.join(", ")}
  
  **הנחיות מפורטות לשילוב רכיבים פדגוגיים:**
  ${methodsText}
  
  **אסור לך:**
  - להשתמש בדוגמאות דמיוניות או כלליות - תמיד התבסס על תכנים ספציפיים
  - ליצור משימות שאינן מתאימות לרמת הקורס או לתחום הלימוד
  - להתעלם מהתכנים הספציפיים שסופקו
  - לכתוב הוראות כלליות ולא ספציפיות
  - לשכוח רכיבים פדגוגיים שנבחרו
  - ליצור מחוון חלקי או לא מפורט
  
  **הפלט בעברית בפורמט HTML נקי וארגון מסודר** ללא תגי HTML מיותרים בתחילה או בסוף.`;

      let generatedContent = '';

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

      // Parse the AI response into structured format
      const structuredAssignment = parseAIResponseToStructuredFormat(
        generatedContent,
        courseName,
        selectedMethods,
        providerUsed
      );

      // Use the raw HTML content as the main rubricHtml (full assignment HTML)
      structuredAssignment.rubricHtml = generatedContent || structuredAssignment.rubricHtml;

      logger.info(`[${requestId}] Assignment generated successfully using ${providerUsed}`);

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