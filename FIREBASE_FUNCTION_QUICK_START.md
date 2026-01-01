# Firebase Function Quick Start Guide

## Quick Deployment Steps

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Set Secrets
```bash
firebase functions:secrets:set OPENAI_KEY
```

### 3. Build
```bash
npm run build
```

### 4. Deploy
```bash
firebase deploy --only functions:generateAssignment
```

## Local Development

### Option 1: Firebase Emulator
```bash
cd functions
npm run serve
```

Then use `httpsCallable` with emulator:
```typescript
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

const functions = getFunctions();
connectFunctionsEmulator(functions, 'localhost', 5001);
const generateAssignment = httpsCallable(functions, 'generateAssignment');
```

### Option 2: Express Backend (Development)
```bash
cd server
npm start
```

Frontend will automatically use Express backend in development mode.

## Function Details

- **Function Name:** `generateAssignment`
- **Type:** Callable Function (`onCall`)
- **Timeout:** 60 seconds
- **Memory:** 512MiB
- **Secrets:** `OPENAI_KEY` (required)

## Frontend Usage

The frontend already supports this function. No changes needed!

```typescript
// Already implemented in src/helpers/secureApiClient.ts
import { generateAssignment } from './helpers/secureApiClient';

const result = await generateAssignment({
  courseName: "My Course",
  selectedMethods: [...],
  preferredProvider: "openai"
});
```

## Troubleshooting

### Secret Not Found
```bash
# Verify secret is set
firebase functions:secrets:access OPENAI_KEY

# Redeploy after setting
firebase deploy --only functions:generateAssignment
```

### View Logs
```bash
firebase functions:log --only generateAssignment
```

### Check Function Status
Visit: https://console.firebase.google.com/project/<project-id>/functions

## Key Files

- **Function Code:** `functions/src/index.ts`
- **Deployment Guide:** `FIREBASE_FUNCTION_DEPLOYMENT.md`
- **Summary:** `FIREBASE_FUNCTION_SUMMARY.md`

