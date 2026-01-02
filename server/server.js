const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

// Import shared modules
const {
  assessMaterialQuality,
  validateAssignmentSpecificity,
} = require("../shared/lib/materialQuality");

const {
  searchScholarlySources,
  formatAPA7References,
} = require("../shared/lib/scholarlySearch");

// Import tip implementation (will be available after build)
let tipImplementation;
try {
  tipImplementation = require("../shared/lib/tipImplementation");
} catch (e) {
  console.warn("Tip implementation module not yet built, will use fallback");
  tipImplementation = null;
}

const app = express();
const PORT = process.env.PORT || 3001;

// 🔒 Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// 🚦 Rate Limiting - הגנה מפני התקפות
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דקות
  max: 100, // מקסימום 100 בקשות לכל IP
  message: {
    error: 'יותר מדי בקשות מכתובת IP זו, נסה שוב מאוחר יותר.',
    retryAfter: '15 דקות'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// 🌐 CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// 📝 Logging
app.use(morgan('combined'));

// 📦 Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Pedagogical Lego Backend Proxy'
  });
});

// 🤖 OpenAI Proxy Endpoint
app.post('/api/openai/generate', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        code: 'MISSING_API_KEY'
      });
    }

    const { messages, model = 'gpt-4o', max_tokens = 4000, ...otherParams } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required',
        code: 'INVALID_INPUT'
      });
    }

    console.log('🚀 Sending request to OpenAI API...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages,
          max_tokens,
          temperature: 0.7,
          ...otherParams
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal,
          timeout: 25000
        }
      );

      clearTimeout(timeoutId);
      console.log('✅ OpenAI response received successfully');
      
      res.json({
        success: true,
        data: response.data,
        provider: 'OpenAI GPT-4'
      });

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }

  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    
    if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
      return res.status(408).json({ 
        error: 'Request timeout - OpenAI API took too long to respond',
        code: 'TIMEOUT'
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API key',
        code: 'INVALID_API_KEY'
      });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'OpenAI API rate limit exceeded',
        code: 'RATE_LIMIT'
      });
    }
    
    res.status(500).json({ 
      error: 'OpenAI API request failed',
      details: error.response?.data?.error?.message || error.message,
      code: 'API_ERROR'
    });
  }
});

// 🎯 Assignment Generation Endpoint - OpenAI only
app.post('/api/generate-assignment', async (req, res) => {
  try {
    const { 
      courseName, 
      faculty, 
      department, 
      courseDescription, 
      selectedMethods = [], 
      uploadedFiles = [],
      preferredProvider = 'openai' // Only OpenAI is supported
    } = req.body;

    // Input validation
    if (!courseName) {
      return res.status(400).json({ 
        error: 'Course name is required',
        code: 'MISSING_COURSE_NAME'
      });
    }

    // Validate OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key is required but not configured',
        code: 'MISSING_OPENAI_KEY'
      });
    }

    console.log(`📊 Assignment generation request - Course: ${courseName}, Provider: OpenAI`);

    // Build comprehensive prompt
    const selectedComponents = selectedMethods.map(m => m.title || 'שיטה פדגוגית');
    const methodsText = selectedMethods.length > 0 
      ? selectedMethods.map(m => `- ${m.title}: ${m.description || ''}`).join('\n')
      : 'שיטות הוראה מגוונות';

    // STEP 1: Assess material quality using shared module
    const userRequestText = `${courseName} ${faculty || ''} ${department || ''} ${courseDescription || ''}`.trim();
    const materialText = courseDescription || '';
    const qualityReport = assessMaterialQuality(userRequestText, materialText);
    console.log(`[QualityGate] Material quality: ${qualityReport.quality}, coverage: ${qualityReport.coverageScore.toFixed(2)}`);

    // STEP 2: Scholarly Web Fallback if needed
    let scholarlySources = [];
    let groundingMode = "uploaded";
    if (qualityReport.quality !== "good") {
      console.log(`[QualityGate] Material quality insufficient (${qualityReport.quality}), searching scholarly sources...`);
      try {
        const searchQuery = `${courseName} ${courseDescription || ''}`.trim();
        scholarlySources = await searchScholarlySources(searchQuery, 8);
        if (scholarlySources.length > 0) {
          groundingMode = qualityReport.quality === "mismatched" ? "web" : "hybrid";
          console.log(`[ScholarlySearch] Found ${scholarlySources.length} sources, using ${groundingMode} mode`);
        } else {
          console.warn(`[ScholarlySearch] No scholarly sources found`);
        }
      } catch (error) {
        console.warn(`[ScholarlySearch] Error: ${error.message}`);
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
    const tipEnforcementPrompt = tipImplementation?.buildTipEnforcementPrompt 
      ? tipImplementation.buildTipEnforcementPrompt(selectedMethods, courseDescription || courseName)
      : '';

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

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    let result;
    let provider;

    // Generate with OpenAI
    try {
      const openaiResponse = await axios.post(`${req.protocol}://${req.get('host')}/api/openai/generate`, {
        messages,
        model: 'gpt-4o',
        max_tokens: 4000,
        temperature: 0.7
      });
      result = openaiResponse.data;
      provider = 'OpenAI GPT-4';
    } catch (error) {
      console.error('OpenAI API request failed:', error.message);
      return res.status(500).json({ 
        error: 'OpenAI API request failed',
        details: error.response?.data?.error || error.message,
        code: 'OPENAI_API_ERROR'
      });
    }

    // Extract content from AI response
    let generatedContent = '';
    let rawContent = '';
    
    if (result?.data?.choices?.[0]?.message?.content) {
      // OpenAI format
      rawContent = result.data.choices[0].message.content;
      generatedContent = rawContent;
    } else {
      // Use local fallback
      console.log('Using high-quality local fallback');
      provider = 'Secure Local Fallback System';
      generatedContent = JSON.stringify({
        title: `מטלה אינטגרטיבית מתקדמת - ${courseName}`,
        description: `מטלה זו משלבת מספר גישות פדגוגיות כדי להעריך את הבנתכם בחומר הנלמד באופן מעמיק ומקיף. השיטות הנבחרות: ${selectedMethods.map(m => m.title || 'שיטה פדגוגית').join(', ')}`,
        instructions: [
          'קראו בעיון את כל החומרים הנדרשים לקורס',
          'נתחו את הנושא בצורה ביקורתית ועמוקה',
          'השתמשו במקורות אקדמיים מהימנים בלבד',
          'כתבו את העבודה במבנה אקדמי ברור עם מבוא, גוף ומסקנות',
          'הגישו את העבודה במועד שנקבע'
        ],
        requirements: [
          'אורך: 8-12 עמודים',
          'גופן: David או Arial, גודל 12',
          'לפחות 8 מקורות אקדמיים',
          'ציטוט לפי תקן APA',
          'הגשה עד לתאריך הנקוב'
        ],
        estimatedHours: 25,
        difficulty: 'בינוני'
      });
    }

    // Parse the AI response into structured format
    const structuredAssignment = parseAIResponseToStructuredFormat(
      generatedContent, 
      courseName, 
      selectedMethods, 
      provider
    );

    // Validate tip compliance
    if (tipImplementation?.validateTipCompliance && selectedMethods.length > 0) {
      const compliance = tipImplementation.validateTipCompliance(structuredAssignment, selectedMethods);
      if (!compliance.ok) {
        console.warn(`Tip compliance check failed:`, compliance.missing);
        // Log but don't fail - we'll normalize rubric anyway
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

    // STEP: Validate section depth and AI prompts AFTER HTML extraction
    let sectionDepthOkBeforeRetry = false;
    let sectionDepthOkAfterRetry = false;
    let sectionDepthFailures = [];
    let aiPromptsOk = false;
    let aiPromptsFailures = [];

    if (tipImplementation?.validateSectionDepth) {
      const depthValidation = tipImplementation.validateSectionDepth(structuredAssignment);
      sectionDepthOkBeforeRetry = depthValidation.ok;
      sectionDepthFailures = depthValidation.failures || [];
    } else {
      sectionDepthOkBeforeRetry = true; // Skip validation if module not available
    }

    if (tipImplementation?.validateAiPrompts && selectedMethods.length > 0) {
      const aiPromptsValidation = tipImplementation.validateAiPrompts(structuredAssignment, selectedMethods);
      aiPromptsOk = aiPromptsValidation.ok;
      aiPromptsFailures = aiPromptsValidation.missing || [];
    } else {
      aiPromptsOk = true; // No AI tips or module not available, validation passes
    }

    // Note: Retry logic would require OpenAI client access, which is handled via proxy
    // For server.js, we log validation failures but don't retry (retry happens in functions)
    if (!sectionDepthOkBeforeRetry || !aiPromptsOk) {
      console.warn(`[Validation] Section depth or AI prompts validation failed`);
      console.warn(`[Validation] Depth failures:`, sectionDepthFailures);
      console.warn(`[Validation] AI prompts failures:`, aiPromptsFailures);
    } else {
      sectionDepthOkAfterRetry = sectionDepthOkBeforeRetry;
    }

    // Normalize rubric HTML to use point ranges (0-7, 8-15, 16-20)
    if (structuredAssignment.rubricHtml && tipImplementation?.normalizeRubricHtmlToPointRanges) {
      structuredAssignment.rubricHtml = tipImplementation.normalizeRubricHtmlToPointRanges(structuredAssignment.rubricHtml);
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

    // Add grounding metadata
    structuredAssignment.groundingMode = groundingMode;
    structuredAssignment.materialQualityReport = qualityReport;
    if (scholarlySources.length > 0) {
      structuredAssignment.sourcesUsed = scholarlySources;
      structuredAssignment.apa7References = formatAPA7References(scholarlySources);
    }

    // Add debug fields
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
      renderedFrom: structuredAssignment.fullAssignmentHtml ? "structuredAssignment" : "legacy",
      sectionDepthOkBeforeRetry,
      sectionDepthOkAfterRetry,
      sectionDepthFailures,
      aiPromptsOk,
      aiPromptsFailures
    };

    console.log(`✅ Assignment generated successfully using ${provider}, mode: ${groundingMode}`);
    console.log(`🔍 Debug: ${JSON.stringify(structuredAssignment.debug)}`);

    res.json({
      success: true,
      data: structuredAssignment,
      provider: provider,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Assignment generation failed:', error.message);
    res.status(500).json({ 
      error: 'Assignment generation failed',
      details: error.message,
      code: 'GENERATION_ERROR'
    });
  }
});

// 📊 Server Status Endpoint
app.get('/api/status', (req, res) => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  
  res.json({
    server: 'Pedagogical Lego Backend Proxy',
    version: '1.0.0',
    status: 'running',
    providers: {
      openai: hasOpenAI ? 'configured' : 'missing_key'
    },
    security: {
      cors: 'enabled',
      helmet: 'enabled',
      rateLimiting: 'enabled'
    },
    timestamp: new Date().toISOString()
  });
});

// 🚫 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Route ${req.originalUrl} not found`,
    code: 'NOT_FOUND'
  });
});

// 🔥 Global Error Handler
app.use((error, req, res, next) => {
  console.error('💥 Unhandled Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
    code: 'INTERNAL_ERROR'
  });
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`
🔒 Pedagogical Lego Backend Proxy Server
🚀 Server running on port ${PORT}
🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing (Required)'}
🛡️  Security: Helmet + CORS + Rate Limiting enabled
📊 Health Check: http://localhost:${PORT}/health
📈 Status: http://localhost:${PORT}/api/status
  `);
});

module.exports = app; 

// Helper function to parse AI response into structured format
/**
 * Build full assignment HTML from structured fields
 */
function buildFullAssignmentHtml(structuredAssignment, courseName, faculty, department) {
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

function parseAIResponseToStructuredFormat(content, courseName, selectedMethods, provider) {
  try {
    // Try to parse if it's already JSON
    const parsed = JSON.parse(content);
    if (parsed.title && parsed.description) {
      return {
        ...parsed,
        modelUsed: provider
      };
    }
  } catch (e) {
    // Not JSON, continue with text parsing
  }

  // Parse text content into structured format
  const lines = content.split('\n').filter(line => line.trim());
  
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
  let instructions = [];
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
  let requirements = [];
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
  const rubricCriteria = [
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
    if (method.title && tipImplementation?.tipInvolvesAI && tipImplementation.tipInvolvesAI({ title: method.title, id: method.id })) {
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