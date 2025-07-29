const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

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
  allowedHeaders: ['Content-Type', 'Authorization']
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

    const { messages, model = 'gpt-4', max_tokens = 4000, ...otherParams } = req.body;

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

// 🧠 Claude Proxy Endpoint
app.post('/api/claude/generate', async (req, res) => {
  try {
    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({ 
        error: 'Claude API key not configured',
        code: 'MISSING_API_KEY'
      });
    }

    const { messages, model = 'claude-3-sonnet-20240229', max_tokens = 4000 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required',
        code: 'INVALID_INPUT'
      });
    }

    console.log('🚀 Sending request to Claude API...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model,
          max_tokens,
          messages: messages.filter(msg => msg.role !== 'system'),
          system: messages.find(msg => msg.role === 'system')?.content || undefined
        },
        {
          headers: {
            'x-api-key': process.env.CLAUDE_API_KEY,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          signal: controller.signal,
          timeout: 25000
        }
      );

      clearTimeout(timeoutId);
      console.log('✅ Claude response received successfully');
      
      res.json({
        success: true,
        data: response.data,
        provider: 'Claude 3 Sonnet'
      });

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }

  } catch (error) {
    console.error('❌ Claude API error:', error.message);
    
    if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
      return res.status(408).json({ 
        error: 'Request timeout - Claude API took too long to respond',
        code: 'TIMEOUT'
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid Claude API key',
        code: 'INVALID_API_KEY'
      });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Claude API rate limit exceeded',
        code: 'RATE_LIMIT'
      });
    }
    
    res.status(500).json({ 
      error: 'Claude API request failed',
      details: error.response?.data?.error?.message || error.message,
      code: 'API_ERROR'
    });
  }
});

// 🎯 Assignment Generation Endpoint - מאגד את שני השירותים
app.post('/api/generate-assignment', async (req, res) => {
  try {
    const { 
      courseName, 
      faculty, 
      department, 
      courseDescription, 
      selectedMethods = [], 
      uploadedFiles = [],
      preferredProvider = 'openai'
    } = req.body;

    // Input validation
    if (!courseName) {
      return res.status(400).json({ 
        error: 'Course name is required',
        code: 'MISSING_COURSE_NAME'
      });
    }

    console.log(`📊 Assignment generation request - Course: ${courseName}, Provider: ${preferredProvider}`);

    // Build comprehensive prompt
    const methodsText = selectedMethods.length > 0 
      ? selectedMethods.map(m => `- ${m.title}: ${m.description}`).join('\n')
      : 'שיטות הוראה מגוונות';

    const systemPrompt = `אתה מומחה בפדגוגיה אקדמית. תפקידך ליצור מטלות אקדמיות מפורטות ואיכותיות.

חשוב מאוד: החזר את התשובה כ-JSON תקין בפורמט הבא:
{
  "title": "כותרת המטלה",
  "description": "תיאור מפורט של המטלה",
  "instructions": ["הוראה 1", "הוראה 2", "..."],
  "requirements": ["דרישה 1", "דרישה 2", "..."],
  "estimatedHours": מספר שעות משוער,
  "difficulty": "קל/בינוני/קשה"
}

יש להתמקד בשיטות הפדגוגיות הנבחרות ולשלב אותן במטלה.`;

    const userPrompt = `צור מטלה אקדמית מתקדמת עבור:

📚 **פרטי הקורס:**
- שם הקורס: ${courseName}
- פקולטה: ${faculty || 'לא צוין'}
- מחלקה: ${department || 'לא צוין'}
- תיאור: ${courseDescription || 'תיאור כללי'}

🎯 **שיטות פדגוגיות לשילוב:**
${methodsText}

📋 **דרישות:**
1. המטלה צריכה להיות ספציפית לנושא הקורס
2. שילוב השיטות הפדגוגיות שנבחרו
3. הוראות ברורות ומפורטות לסטודנטים
4. דרישות אקדמיות מובנות
5. רמת קושי מתאימה לרמת הקורס

אנא צור מטלה איכותית ומקצועית שתאפשר הערכה מקיפה של הסטודנטים.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    let result;
    let provider;

    // Try preferred provider first
    if (preferredProvider === 'openai' && process.env.OPENAI_API_KEY) {
      try {
        const openaiResponse = await axios.post(`${req.protocol}://${req.get('host')}/api/openai/generate`, {
          messages,
          model: 'gpt-4',
          max_tokens: 4000,
          temperature: 0.7
        });
        result = openaiResponse.data;
        provider = 'OpenAI GPT-4';
      } catch (error) {
        console.warn('OpenAI failed, trying Claude...');
      }
    }

    // Fallback to Claude if OpenAI failed or Claude was preferred
    if (!result && process.env.CLAUDE_API_KEY) {
      try {
        const claudeResponse = await axios.post(`${req.protocol}://${req.get('host')}/api/claude/generate`, {
          messages,
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000
        });
        result = claudeResponse.data;
        provider = 'Claude 3 Sonnet';
      } catch (error) {
        console.warn('Claude also failed, using local fallback...');
      }
    }

    // Extract content from AI response
    let generatedContent = '';
    if (result?.data?.choices?.[0]?.message?.content) {
      // OpenAI format
      generatedContent = result.data.choices[0].message.content;
    } else if (result?.data?.content?.[0]?.text) {
      // Claude format  
      generatedContent = result.data.content[0].text;
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

    console.log(`✅ Assignment generated successfully using ${provider}`);

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
  const hasClaude = !!process.env.CLAUDE_API_KEY;
  
  res.json({
    server: 'Pedagogical Lego Backend Proxy',
    version: '1.0.0',
    status: 'running',
    providers: {
      openai: hasOpenAI ? 'configured' : 'missing_key',
      claude: hasClaude ? 'configured' : 'missing_key'
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
🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}
🧠 Claude API: ${process.env.CLAUDE_API_KEY ? '✅ Configured' : '❌ Missing'}
🛡️  Security: Helmet + CORS + Rate Limiting enabled
📊 Health Check: http://localhost:${PORT}/health
📈 Status: http://localhost:${PORT}/api/status
  `);
});

module.exports = app; 

// Helper function to parse AI response into structured format
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
      'הגישו את העבודה במועד הנקוב'
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
      'הגשה עד לתאריך הנקוב'
    ];
  }
  
  // Generate rubric HTML
  const rubricCriteria = [
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