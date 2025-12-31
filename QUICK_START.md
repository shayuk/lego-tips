# 🚀 Quick Start Guide - AI Bot Integration

## ⚡ Quick Setup (3 Steps)

### Step 1: Start Backend Server
```bash
cd server
npm install  # Only needed first time
npm start    # Or: npm run dev (for auto-restart)
```

**✅ Success Indicator:**
```
🚀 Server running on port 3001
🔑 OpenAI API: ✅ Configured
🧠 Claude API: ✅ Configured
```

### Step 2: Start Frontend
```bash
# In a new terminal, from project root
npm run dev
```

### Step 3: Test
1. Open browser: `http://localhost:3000`
2. Navigate to Assessment Builder
3. Create an assessment
4. Check browser console for: `✅ Server health check passed`

---

## 🔍 Troubleshooting

### Backend won't start?
```bash
# Check if port 3001 is available
netstat -an | grep 3001

# Check if .env file exists
ls server/.env

# Check API keys are set
cat server/.env | grep API_KEY
```

### Frontend can't connect?
1. Verify backend is running: `curl http://localhost:3001/health`
2. Check CORS settings in `server/.env`: `FRONTEND_URL=http://localhost:3000`
3. Restart backend after changing `.env`

### API errors?
1. Check API keys are valid
2. Verify keys have credits/quota
3. Check server logs for detailed errors

---

## 📋 Pre-Flight Checklist

- [ ] Backend server running on port 3001
- [ ] `server/.env` file exists with API keys
- [ ] Frontend running on port 3000
- [ ] Browser console shows no errors
- [ ] Health check endpoint responds: `curl http://localhost:3001/health`

---

## 🆘 Need Help?

See `AI_BOT_FIX_SUMMARY.md` for detailed documentation.

