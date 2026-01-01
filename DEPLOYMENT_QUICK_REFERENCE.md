# Firebase Function Deployment - Quick Reference

## 🚀 Quick Deploy Commands

```bash
# 1. Install dependencies
cd functions && npm install

# 2. Set secrets (one-time setup)
firebase functions:secrets:set OPENAI_KEY

# 3. Build
cd functions && npm run build

# 4. Deploy
firebase deploy --only functions:generateAssignment

# 5. Check logs
firebase functions:log --only generateAssignment
```

## 🔑 Secret Management

```bash
# Set secret
firebase functions:secrets:set SECRET_NAME

# Access secret (for verification)
firebase functions:secrets:access SECRET_NAME

# List all secrets
firebase functions:secrets:list
```

## 📊 Testing

### Browser Console Test
```javascript
// Copy from test-generateAssignment-browser.js
// Paste in browser console (F12)
```

### Node.js Test
```bash
node test-generateAssignment.js
```

## 🐛 Common Issues

| Error | Solution |
|-------|----------|
| `Secret not found` | Set secrets before deployment |
| `Function not found` | Deploy: `firebase deploy --only functions:generateAssignment` |
| `Permission denied` | Check Firebase login: `firebase login` |
| `Timeout` | Increase `timeoutSeconds` in function config |
| `Build failed` | Run `npm run build` in functions directory |

## 📝 Function Details

- **Name:** `generateAssignment`
- **Type:** Callable Function (v2)
- **Timeout:** 60 seconds
- **Memory:** 512 MiB
- **Secrets:** `OPENAI_KEY` (required)
- **Node:** 22

## 🔍 Monitoring

```bash
# View logs
firebase functions:log --only generateAssignment

# View in console
# https://console.firebase.google.com/project/lego-tips/functions
```

