# Firebase Function Deployment Guide

This guide explains how to deploy the `generateAssignment` Firebase Function that replaces the Express backend for AI assignment generation.

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project initialized: `firebase init`
3. Node.js 22 (as specified in `functions/package.json`)

## Step 1: Install Dependencies

Navigate to the functions directory and install dependencies:

```bash
cd functions
npm install
```

This will install:
- `@anthropic-ai/sdk` - Claude API client
- `openai` - OpenAI API client
- `firebase-functions` - Firebase Functions SDK
- `firebase-admin` - Firebase Admin SDK
- `cors` - CORS middleware

## Step 2: Configure Firebase Secrets

Firebase Functions v2 uses secrets for secure API key storage. Configure the secrets using Firebase CLI:

### Set OpenAI API Key Secret

```bash
firebase functions:secrets:set OPENAI_KEY
```

When prompted, paste your OpenAI API key. The secret will be encrypted and stored securely.

### Set Claude API Key Secret

```bash
firebase functions:secrets:set CLAUDE_API_KEY
```

When prompted, paste your Claude API key.

### Verify Secrets

To list all configured secrets:

```bash
firebase functions:secrets:access OPENAI_KEY
firebase functions:secrets:access CLAUDE_API_KEY
```

**Note:** Secrets are only accessible in deployed functions, not in local emulators.

## Step 3: Local Development Setup

For local development, you'll need to use environment variables since secrets aren't available in emulators.

### Option A: Use .env file (Recommended for local dev)

Create `functions/.env`:

```env
OPENAI_KEY=your_openai_key_here
CLAUDE_API_KEY=your_claude_key_here
```

**Important:** Add `functions/.env` to `.gitignore` to prevent committing secrets.

### Option B: Use Firebase Emulator with Environment Variables

Set environment variables before running the emulator:

**Windows (PowerShell):**
```powershell
$env:OPENAI_KEY="your_openai_key_here"
$env:CLAUDE_API_KEY="your_claude_key_here"
npm run serve
```

**Linux/Mac:**
```bash
export OPENAI_KEY="your_openai_key_here"
export CLAUDE_API_KEY="your_claude_key_here"
npm run serve
```

### Running Local Emulator

```bash
cd functions
npm run serve
```

The function will be available at:
- Callable: `http://localhost:5001/<project-id>/us-central1/generateAssignment`
- Use `httpsCallable` from Firebase SDK to call it

## Step 4: Build and Deploy

### Build the Function

```bash
cd functions
npm run build
```

This compiles TypeScript to JavaScript in the `lib/` directory.

### Deploy the Function

From the project root:

```bash
firebase deploy --only functions:generateAssignment
```

Or deploy all functions:

```bash
firebase deploy --only functions
```

### Deploy with Secrets

When deploying, Firebase will automatically include the configured secrets. The deployment command will show which secrets are being used:

```
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudresourcemanager.googleapis.com is enabled...
i  functions: creating Node.js 22 function generateAssignment(us-central1)...
i  functions: creating secret version for OPENAI_KEY...
i  functions: creating secret version for CLAUDE_API_KEY...
```

## Step 5: Verify Deployment

After deployment, test the function:

```bash
# Get the function URL
firebase functions:config:get

# Or check in Firebase Console
# https://console.firebase.google.com/project/<project-id>/functions
```

### Test with Firebase SDK (Recommended)

Since `generateAssignment` is a callable function (`onCall`), use the Firebase SDK:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const generateAssignment = httpsCallable(functions, 'generateAssignment');

const result = await generateAssignment({
  courseName: "Test Course",
  faculty: "Engineering",
  department: "Computer Science",
  courseDescription: "Test description",
  selectedMethods: [{title: "Project-Based Learning", description: "Test"}],
  preferredProvider: "openai"
});

console.log(result.data);
```

### Test with HTTP (Alternative)

Callable functions can also be called via HTTP POST:

```bash
curl -X POST \
  https://us-central1-<project-id>.cloudfunctions.net/generateAssignment \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "courseName": "Test Course",
      "faculty": "Engineering",
      "department": "Computer Science",
      "courseDescription": "Test description",
      "selectedMethods": [{"title": "Project-Based Learning", "description": "Test"}],
      "preferredProvider": "openai"
    }
  }'
```

**Note:** Callable functions expect data wrapped in a `data` property when called via HTTP.

## Step 6: Frontend Configuration

The frontend code in `src/helpers/secureApiClient.ts` already supports Firebase Functions. It will automatically:

1. **In Production:** Use Firebase Functions via `httpsCallable`
2. **In Development:** Use local Express backend (if running) or Firebase Functions

### Environment Detection

The frontend detects the environment automatically:

```typescript
const USE_FIREBASE_FUNCTIONS = import.meta.env.PROD; // Use Firebase Functions in production
```

### Function Mapping

The frontend maps API endpoints to Firebase Function names:

```typescript
const FIREBASE_FUNCTION_MAP: Record<string, string> = {
  '/api/generate-assignment': 'generateAssignment',
  // ... other mappings
};
```

## Function Configuration

The `generateAssignment` function is configured with:

- **Timeout:** 60 seconds (for AI API calls)
- **Memory:** 512MiB
- **CORS:** Enabled
- **Secrets:** `OPENAI_KEY`, `CLAUDE_API_KEY`

## API Response Format

The function returns a structured response matching the Express backend:

```typescript
{
  success: true,
  data: {
    title: string,
    description: string,
    instructions: string[],
    requirements: string[],
    rubricCriteria: Array<{...}>,
    rubricHtml: string,  // Full HTML assignment
    modelUsed: string,
    generatedAt: string
  },
  provider: string,
  timestamp: string
}
```

## Error Handling

The function handles various error scenarios:

- **Missing API keys:** Returns 500 with `MISSING_API_KEY` code
- **Invalid input:** Returns 400 with appropriate error code
- **API failures:** Falls back to alternative provider or local fallback
- **Timeout:** Returns 408 with `TIMEOUT` code

## Monitoring and Logs

### View Function Logs

```bash
firebase functions:log
```

### View Specific Function Logs

```bash
firebase functions:log --only generateAssignment
```

### Real-time Log Streaming

```bash
firebase functions:log --follow
```

## Troubleshooting

### Secret Not Found Error

If you see errors about secrets not being found:

1. Verify secrets are set: `firebase functions:secrets:access OPENAI_KEY`
2. Ensure secrets are included in function configuration
3. Redeploy the function after setting secrets

### CORS Errors

The function has CORS enabled. If you encounter CORS issues:

1. Check that `cors: true` is set in function configuration
2. Verify frontend origin is allowed
3. Check browser console for specific CORS error messages

### Timeout Errors

If functions timeout:

1. Increase `timeoutSeconds` in function configuration (max 540s for v2)
2. Check AI API response times
3. Consider optimizing prompt size

### Local Development Issues

If local emulator doesn't work:

1. Ensure `.env` file exists with API keys
2. Or set environment variables before running emulator
3. Check that Firebase emulators are running: `firebase emulators:start`

## Cost Considerations

Firebase Functions pricing:
- **Invocations:** First 2 million free per month
- **Compute Time:** Based on memory allocation and execution time
- **AI API Costs:** Separate from Firebase (OpenAI/Claude pricing)

Monitor usage in Firebase Console:
- https://console.firebase.google.com/project/<project-id>/usage

## Security Best Practices

1. **Never commit secrets** - Use Firebase Secrets or environment variables
2. **Restrict function access** - Use Firebase Authentication if needed
3. **Monitor usage** - Set up alerts for unusual activity
4. **Rotate keys regularly** - Update secrets periodically
5. **Use least privilege** - Only grant necessary permissions

## Rollback

If you need to rollback to a previous version:

```bash
# List function versions
firebase functions:list

# Rollback to previous version (if available)
firebase functions:rollback generateAssignment
```

## Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env#secret-manager)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude API Documentation](https://docs.anthropic.com/)

