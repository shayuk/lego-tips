# 🔒 Pedagogical Lego Backend Proxy Server

## מטרה
שרת מאובטח שמשמש כ-Proxy בין הקלינט לשירותי AI, כדי להגן על מפתחות API מפני חשיפה בדפדפן.

## ✨ תכונות אבטחה

- 🔐 **מפתחות API מוגנים** - נשמרים בצד השרת בלבד
- 🛡️ **Rate Limiting** - הגנה מפני התקפות DoS  
- 🌐 **CORS Protection** - אבטחת cross-origin requests
- 🔒 **Helmet Security** - Headers מאובטחים
- 📊 **Logging & Monitoring** - מעקב אחר בקשות
- ⏱️ **Timeouts** - מניעת hanging requests

## 🚀 התקנה והפעלה

### 1. התקנת חבילות
```bash
cd server
npm install
```

### 2. הגדרת משתני סביבה
צור קובץ `.env` עם המפתחות שלך:
```bash
# 🤖 OpenAI API Key (מומלץ - ראשי)
OPENAI_API_KEY=sk-your-openai-api-key-here

# 🧠 Claude API Key (גיבוי)  
CLAUDE_API_KEY=sk-your-claude-api-key-here

# 🌐 Server Config
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 3. הפעלת השרת
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 📊 API Endpoints

### Health Check
```
GET /health
```
Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-27T...",
  "service": "Pedagogical Lego Backend Proxy"
}
```

### Server Status
```
GET /api/status
```
Response:
```json
{
  "server": "Pedagogical Lego Backend Proxy",
  "providers": {
    "openai": "configured",
    "claude": "configured" 
  },
  "security": {
    "cors": "enabled",
    "helmet": "enabled",
    "rateLimiting": "enabled"
  }
}
```

### OpenAI Proxy
```
POST /api/openai/generate
```
Body:
```json
{
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "model": "gpt-4",
  "max_tokens": 4000
}
```

### Claude Proxy  
```
POST /api/claude/generate
```
Body:
```json
{
  "messages": [...],
  "model": "claude-3-sonnet-20240229", 
  "max_tokens": 4000
}
```

### Assignment Generation (מומלץ)
```
POST /api/generate-assignment
```
Body:
```json
{
  "courseName": "פסיכולוגיה חברתית",
  "faculty": "מדעי החברה",
  "department": "פסיכולוגיה", 
  "courseDescription": "...",
  "selectedMethods": [...],
  "preferredProvider": "openai"
}
```

## 🔧 תצורה מתקדמת

### Rate Limiting
- **Window**: 15 דקות
- **Max Requests**: 100 לכל IP
- **Scope**: `/api/*` endpoints only

### CORS
- **Origin**: `process.env.FRONTEND_URL`
- **Credentials**: Enabled
- **Methods**: GET, POST only

### Security Headers
- Content Security Policy
- XSS Protection  
- HSTS Headers
- Referrer Policy

## 🔍 Monitoring & Debugging

### Logs
השרת מתעד את כל הבקשות עם:
- Timestamp
- IP Address
- Request Method & URL
- Response Status
- Response Time

### Error Handling
- API timeouts (30 שניות)
- Network errors
- Invalid input validation
- Missing API keys
- Rate limit exceeded

## 🚨 אבטחה והגנות

### מה מוגן:
✅ מפתחות API לא נחשפים בדפדפן  
✅ Rate limiting מונע spam attacks  
✅ CORS מגביל access לדומיינים מאושרים  
✅ Input validation מונע injection attacks  
✅ Timeouts מונעים resource exhaustion  

### מה לא לעשות:
❌ לא לשים מפתחות ב-client code  
❌ לא לחשוף את השרת לאינטרנט ללא firewall  
❌ לא להריץ בגרסת development בפרודקשן  
❌ לא לשתף את קובץ ה-.env  

## 🔄 Failover Strategy

1. **Primary**: OpenAI API
2. **Secondary**: Claude API  
3. **Fallback**: Local high-quality template

## 📈 Performance

- **Response Time**: < 10 שניות ממוצע
- **Throughput**: 100 requests/15min per IP
- **Memory Usage**: < 100MB
- **CPU Usage**: Low (I/O bound)

## 🐛 Common Issues

### "Connection Refused"
```bash
# Check if server is running
curl http://localhost:3001/health
```

### "API Key Missing"  
```bash
# Check .env file exists and has keys
cat .env | grep API_KEY
```

### "CORS Error"
```bash
# Check FRONTEND_URL matches your client
echo $FRONTEND_URL
```

## 🔧 Development

### Code Structure
```
server/
├── server.js          # Main server file
├── package.json       # Dependencies  
├── .env               # Environment variables
├── .gitignore         # Security exclusions
└── README.md          # This file
```

### Adding New Endpoints
1. Add route handler in `server.js`
2. Add input validation
3. Add error handling  
4. Add logging
5. Test thoroughly

---

## ⚠️ **SECURITY NOTICE**

**זהירות**: שרת זה מכיל מפתחות API רגישים.  
- 🔒 וודא שקובץ `.env` לא מופיע ב-Git
- 🛡️ הרץ רק ברשתות מאובטחות  
- 🔄 החלף מפתחות במקרה של חשיפה
- 📊 עקוב אחר שימוש ב-API keys

---

*שרת זה הוא חלק ממערכת Pedagogical Lego ומספק שכבת אבטחה קריטית למפתחות AI.* 