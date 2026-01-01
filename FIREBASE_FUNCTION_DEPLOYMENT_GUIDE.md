# Firebase Function Deployment Guide - `generateAssignment`

Complete deployment instructions for the Firebase AI bot function `generateAssignment` in the Lego-Tips project.

## Prerequisites

- Node.js 22.x installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project initialized (`firebase login`)
- OpenAI API key (required)

---

## 1. Install Dependencies

Navigate to the functions directory and install all required packages:

```bash
cd functions
npm install
```

**Expected output:**
- Installs: `firebase-functions`, `firebase-admin`, `openai`, and dev dependencies

**Verify installation:**
```bash
npm list --depth=0
```

---

## 2. Configure Firebase Secrets

Firebase Functions v2 uses Secret Manager for API keys. Configure the OpenAI secret:

### 2.1 Set OPENAI_KEY Secret

```bash
firebase functions:secrets:set OPENAI_KEY
```

When prompted, paste your OpenAI API key (starts with `sk-...`).

**Alternative (non-interactive):**
```bash
echo "your-openai-api-key-here" | firebase functions:secrets:set OPENAI_KEY
```

### 2.2 Verify Secret Is Set

```bash
firebase functions:secrets:access OPENAI_KEY
```

**Note:** Secrets are automatically granted to the function during deployment (configured in `functions/src/index.ts`).

---

## 3. Build the Function

Compile TypeScript to JavaScript:

```bash
cd functions
npm run build
```

**Expected output:**
- Creates `functions/lib/index.js` and `functions/lib/index.js.map`
- Should complete without errors

**If build fails:**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Clean and rebuild
rm -rf lib
npm run build
```

---

## 4. Deploy Only the `generateAssignment` Function

Deploy the specific function (not all functions):

```bash
# From project root
firebase deploy --only functions:generateAssignment
```

**Expected output:**
```
✔  functions[generateAssignment(us-central1)] Successful create operation.
Function URL: https://us-central1-lego-tips.cloudfunctions.net/generateAssignment
```

**Note:** The function is a **callable function** (not HTTP), so it's invoked via the Firebase SDK, not via direct HTTP URL.

---

## 5. Sanity Check & Testing

### 5.1 Test Script (Node.js)

Create a test file `test-function.js` in the project root:

```javascript
const admin = require('firebase-admin');
const { getFunctions } = require('firebase-functions');

// Initialize Firebase Admin (you'll need a service account key)
// Or use Application Default Credentials
admin.initializeApp({
  projectId: 'lego-tips'
});

const functions = getFunctions();
const { httpsCallable } = require('firebase-functions/v2/https');

// Import the function reference
const generateAssignment = httpsCallable(functions, 'generateAssignment');

// Test request
async function testFunction() {
  try {
    console.log('Testing generateAssignment function...');
    
    const testData = {
      courseName: 'מבוא לפסיכולוגיה',
      faculty: 'מדעי החברה',
      department: 'פסיכולוגיה',
      courseDescription: 'קורס בסיסי בפסיכולוגיה המכסה תיאוריות למידה וקוגניציה',
      selectedMethods: [
        {
          title: 'עבודה בקבוצות',
          description: 'עבודה משותפת בקבוצות של 3-4 סטודנטים'
        },
        {
          title: 'רפלקציה',
          description: 'כתיבת רפלקציה אישית על תהליך הלמידה'
        }
      ],
      preferredProvider: 'openai'
    };

    console.log('Sending request...');
    const result = await generateAssignment(testData);
    
    console.log('✅ Success!');
    console.log('Provider:', result.data.provider);
    console.log('Title:', result.data.data.title);
    console.log('Model Used:', result.data.data.modelUsed);
    console.log('Generated At:', result.data.data.generatedAt);
    
  } catch (error) {
    console.error('❌ Error:', error.code, error.message);
    console.error('Details:', error.details);
  }
}

testFunction();
```

**Run the test:**
```bash
node test-function.js
```

### 5.2 Test Script (Browser/Client-side)

If you have Firebase initialized in your frontend, use this snippet in the browser console:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const generateAssignment = httpsCallable(functions, 'generateAssignment');

const testData = {
  courseName: 'מבוא לפסיכולוגיה',
  faculty: 'מדעי החברה',
  department: 'פסיכולוגיה',
  courseDescription: 'קורס בסיסי בפסיכולוגיה',
  selectedMethods: [
    { title: 'עבודה בקבוצות', description: 'עבודה משותפת' }
  ],
  preferredProvider: 'openai'
};

generateAssignment(testData)
  .then((result) => {
    console.log('✅ Success:', result.data);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
  });
```

### 5.3 cURL Test (Direct HTTP - Limited)

**Note:** Callable functions require authentication. For direct HTTP testing, you need an ID token. This is more complex and typically not recommended.

If you have an ID token, you can test via HTTP:

```bash
curl -X POST \
  https://us-central1-lego-tips.cloudfunctions.net/generateAssignment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -d '{
    "data": {
      "courseName": "מבוא לפסיכולוגיה",
      "faculty": "מדעי החברה",
      "department": "פסיכולוגיה",
      "preferredProvider": "openai"
    }
  }'
```

**Getting an ID token:**
- Use Firebase Auth in your app to get the current user's ID token
- Or use Firebase Admin SDK to create a custom token

---

## 6. Troubleshooting

### 6.1 Timeout Errors

**Symptom:** Function times out after 60 seconds

**Solutions:**
- Increase timeout in `functions/src/index.ts`:
  ```typescript
  export const generateAssignment = onCall(
    {
      secrets: [openAIKeySecret],
      timeoutSeconds: 120, // Increase from 60 to 120
      memory: "512MiB",
    },
    // ...
  );
  ```
- Check AI provider response times
- Optimize prompt length if too long

### 6.2 Missing Secrets Error

**Symptom:** `Secret not found` or `OPENAI_KEY not available`

**Solutions:**
```bash
# Verify secret is set
firebase functions:secrets:access OPENAI_KEY

# Re-deploy after setting secrets
firebase deploy --only functions:generateAssignment

# Check function configuration
firebase functions:config:get
```

**Important:** Secrets must be set **before** deployment. If you set them after, redeploy the function.

### 6.3 Permission Errors

**Symptom:** `Permission denied` or `Insufficient permissions`

**Solutions:**
```bash
# Check Firebase login
firebase login:list

# Re-authenticate if needed
firebase login

# Verify project selection
firebase use default
# or
firebase use production

# Check IAM permissions in Google Cloud Console
# Ensure your account has "Cloud Functions Admin" role
```

### 6.4 Build Errors

**Symptom:** TypeScript compilation fails

**Solutions:**
```bash
cd functions

# Check TypeScript version compatibility
npm list typescript

# Clean and rebuild
rm -rf lib node_modules
npm install
npm run build

# Check for type errors
npx tsc --noEmit
```

### 6.5 Function Not Found

**Symptom:** `Function generateAssignment not found` when calling

**Solutions:**
```bash
# List deployed functions
firebase functions:list

# Verify function name matches exactly (case-sensitive)
# Check functions/src/index.ts exports

# Redeploy if missing
firebase deploy --only functions:generateAssignment
```

### 6.6 AI Provider Errors

**Symptom:** OpenAI API errors

**Solutions:**
- Verify API keys are valid and have credits
- Check API rate limits
- Verify network connectivity from Firebase Functions
- Check function logs:
  ```bash
  firebase functions:log --only generateAssignment
  ```

### 6.7 Memory Errors

**Symptom:** `Memory limit exceeded` or function crashes

**Solutions:**
- Increase memory allocation in `functions/src/index.ts`:
  ```typescript
  {
    secrets: [openAIKeySecret, claudeApiKeySecret],
    timeoutSeconds: 60,
    memory: "1GiB", // Increase from 512MiB
  }
  ```
- Optimize prompt size
- Check response size limits

---

## 7. Monitoring & Logs

### View Function Logs

```bash
# Real-time logs
firebase functions:log --only generateAssignment

# Last 50 log entries
firebase functions:log --only generateAssignment --limit 50

# Filter by severity
firebase functions:log --only generateAssignment --severity error
```

### View in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `lego-tips`
3. Navigate to: **Functions** → **generateAssignment**
4. View logs, metrics, and execution history

### View in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `lego-tips`
3. Navigate to: **Cloud Functions** → **generateAssignment**
4. View detailed logs, metrics, and performance data

---

## 8. Redeployment

To update the function after code changes:

```bash
# 1. Build
cd functions
npm run build

# 2. Deploy
cd ..
firebase deploy --only functions:generateAssignment

# 3. Verify
firebase functions:log --only generateAssignment --limit 10
```

---

## 9. Function Configuration Summary

**Function Name:** `generateAssignment`  
**Type:** Callable Function (v2)  
**Region:** `us-central1` (default)  
**Timeout:** 60 seconds  
**Memory:** 512 MiB  
**Secrets:** `OPENAI_KEY` (required)  
**Node Version:** 22  
**Entry Point:** `functions/src/index.ts` → `functions/lib/index.js`

---

## 10. Quick Reference Commands

```bash
# Install dependencies
cd functions && npm install

# Set secret
firebase functions:secrets:set OPENAI_KEY

# Build
cd functions && npm run build

# Deploy
firebase deploy --only functions:generateAssignment

# View logs
firebase functions:log --only generateAssignment

# List functions
firebase functions:list

# Check secret
firebase functions:secrets:access OPENAI_KEY
```

---

## Support

For additional help:
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env#secret-manager)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

