// 🔒 Secure API Client for Pedagogical Lego Backend Proxy
// This client ensures all AI API calls go through our secure backend proxy

import { getFunctions, httpsCallable } from "firebase/functions";

// Reliable production detection - SINGLE SOURCE OF TRUTH
export const isProduction = (): boolean => {
  // Check environment variable first
  if (import.meta.env.PROD) {
    return true;
  }
  
  // Also check hostname for extra reliability
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname.endsWith('.web.app') || 
           hostname.endsWith('.firebaseapp.com') ||
           hostname === 'lego-tips.web.app' ||
           hostname === 'lego-tips.firebaseapp.com';
  }
  
  return false;
};

// Compile-time DEV constant - tree-shaken in production builds
// This ensures "http://localhost:3001" never appears in production bundle
const DEV_LOCALHOST_URL = import.meta.env.DEV ? "http://localhost:3001" : "";

// Determine server URL based on environment
const getServerUrl = (): string => {
  // In production, NEVER use localhost - use Firebase Functions only
  if (isProduction()) {
    return ''; // Empty = same origin, Firebase Functions will be used
  }
  
  // Development: use local Express backend ONLY when actually on localhost
  // Even if production detection fails (preview domains / unusual hostnames),
  // NEVER default to localhost:3001 unless window.location.hostname is localhost/127.0.0.1
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalhost = host === 'localhost' || host === '127.0.0.1';
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) return envUrl;
  return isLocalhost ? DEV_LOCALHOST_URL : '';
};

const SERVER_URL = getServerUrl();
const USE_FIREBASE_FUNCTIONS = isProduction(); // Use Firebase Functions in production

// 📝 Enhanced TypeScript interfaces for structured responses
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  service: string;
  skipped?: boolean; // Indicates health check was skipped (production mode)
}

export interface ServerStatus {
  server: string;
  providers: {
    openai: 'configured' | 'missing';
    claude: 'configured' | 'missing';
  };
  security: {
    cors: string;
    helmet: string;
    rateLimiting: string;
  };
}

// Structured assignment response from the new API
export interface StructuredAssignment {
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

export interface AIResponse {
  success: boolean;
  data: StructuredAssignment;  // ✅ Now structured instead of raw API response
  provider?: string;  // Legacy field for backward compatibility
  providerUsed?: string;  // New field from server
  attempts?: Array<{
    provider: 'openai' | 'claude';
    ok: boolean;
    errorCode?: string;
    errorMessage?: string;
  }>;
  requestId?: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: string;
}

export interface AssignmentParams {
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

// Map API endpoints to Firebase Function names
const FIREBASE_FUNCTION_MAP: Record<string, string> = {
  '/api/generate-assignment': 'generateAssignment',
  '/api/openai/generate': 'generateWithOpenAI',
  '/api/status': 'getServerStatus',
  // Note: /health endpoint is skipped in production - no Firebase Function needed
};

// Firebase Functions request handler
async function makeFirebaseFunctionRequest<T>(
  endpoint: string,
  options: { method?: string; body?: string }
): Promise<T> {
  try {
    const functions = getFunctions();
    const functionName = FIREBASE_FUNCTION_MAP[endpoint];
    
    if (!functionName) {
      throw new Error(`No Firebase Function mapped for endpoint: ${endpoint}`);
    }
    
    const cloudFunction = httpsCallable(functions, functionName);
    const body = options.body ? JSON.parse(options.body) : {};
    
    console.log(`[Firebase Function] Calling ${functionName}`, { endpoint, body });
    
    const result = await cloudFunction(body);
    
    // Firebase Functions return data in result.data
    return result.data as T;
  } catch (error: any) {
    console.error(`[Firebase Function] Error calling ${endpoint}:`, error);
    
    // Extract error message from Firebase error
    const errorMessage = error?.message || error?.details || 'Firebase Function call failed';
    
    // Handle specific Firebase errors
    if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
      throw new Error(`הפונקציה ${FIREBASE_FUNCTION_MAP[endpoint]} לא נמצאה. אנא פנה למנהל המערכת.`);
    }
    
    if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
      throw new Error('אין הרשאה לגשת לשירות זה. אנא התחבר מחדש.');
    }
    
    throw new Error(errorMessage);
  }
}

// Generic request handler with enhanced error handling
async function makeRequest<T>(endpoint: string, options: {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
} = {}): Promise<T> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`[API] ${requestId} → ${endpoint}`, {
    method: options.method || 'GET',
    environment: import.meta.env.MODE,
    useFirebaseFunctions: USE_FIREBASE_FUNCTIONS,
    timestamp: new Date().toISOString()
  });

  try {
    // In production, ALWAYS use Firebase Functions for API endpoints
    // NEVER call localhost:3001 in production (or non-localhost environments)
    if (isProduction()) {
      // Health checks are COMPLETELY skipped in production - return immediately without any fetch
      if (endpoint === '/health') {
        console.log('Production mode: skipping /health endpoint (no localhost check)');
        return {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'Firebase Functions',
          skipped: true
        } as T;
      }
      // Route API endpoints to Firebase Functions
      if (endpoint.startsWith('/api/')) {
        return await makeFirebaseFunctionRequest<T>(endpoint, options);
      }
      // For any other endpoint in production, try Firebase Functions if mapped
      if (FIREBASE_FUNCTION_MAP[endpoint]) {
        return await makeFirebaseFunctionRequest<T>(endpoint, options);
      }
      // If not mapped and in production, throw error (don't fall back to localhost)
      throw new Error(`Endpoint ${endpoint} is not available in production. Use Firebase Functions instead.`);
    }
    
    // Development: use Express backend
    const url = `${SERVER_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...options.headers,
      },
      ...options,
    });

    const duration = Date.now() - startTime;

    // Check Content-Type to detect HTML responses (server not running or wrong endpoint)
    const contentType = response.headers.get('content-type') || '';
    const isHtmlResponse = contentType.includes('text/html') || contentType.includes('text/plain');
    
    if (!response.ok) {
      // Try to parse JSON error, but handle HTML error pages gracefully
      let errorData: ErrorResponse;
      if (isHtmlResponse) {
        const text = await response.text();
        console.error(`[API] ${requestId} ✗ ${endpoint} - Server returned HTML instead of JSON`, {
          status: response.status,
          preview: text.substring(0, 200)
        });
        errorData = {
          error: isProduction()
            ? 'השרת לא זמין. אנא נסה שוב בעוד מספר דקות.'
            : 'השרת המאובטח לא זמין. ודא שהשרת פועל על פורט 3001. הרץ: cd server && npm start',
          code: 'SERVER_NOT_RUNNING'
        };
      } else {
        errorData = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
          code: 'HTTP_ERROR'
        }));
      }
      
      console.error(`[API] ${requestId} ✗ ${endpoint}`, {
        status: response.status,
        duration: `${duration}ms`,
        error: errorData
      });
      
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    // Check if response is HTML even with 200 status (wrong server/proxy)
    if (isHtmlResponse) {
      const text = await response.text();
      console.error(`[API] ${requestId} ✗ ${endpoint} - Server returned HTML instead of JSON`, {
        status: response.status,
        preview: text.substring(0, 200)
      });
      const errorMsg = isProduction()
        ? 'השרת לא זמין. אנא נסה שוב בעוד מספר דקות.'
        : 'השרת המאובטח לא זמין. ודא שהשרת פועל על פורט 3001. הרץ: cd server && npm start';
      throw new Error(errorMsg);
    }

    const data = await response.json().catch((parseError) => {
      // If JSON parsing fails, it might be HTML
      console.error(`[API] ${requestId} ✗ ${endpoint} - Failed to parse JSON response`, parseError);
      const errorMsg = isProduction()
        ? 'השרת לא זמין. אנא נסה שוב בעוד מספר דקות.'
        : 'השרת המאובטח לא זמין. ודא שהשרת פועל על פורט 3001. הרץ: cd server && npm start';
      throw new Error(errorMsg);
    });
    
    console.log(`[API] ${requestId} ✓ ${endpoint}`, {
      status: response.status,
      duration: `${duration}ms`,
      success: true
    });

    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`[API] ${requestId} ✗ ${endpoint}`, {
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    if (error instanceof Error) {
      // Network errors or parsing errors
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        const errorMsg = isProduction()
          ? 'לא ניתן להתחבר לשירותי Firebase Functions. אנא נסה שוב בעוד מספר דקות.'
          : 'לא ניתן להתחבר לשרת. אנא ודא שהשרת המאובטח פועל על פורט 3001. הרץ: cd server && npm start';
        throw new Error(errorMsg);
      }
      
      // JSON parsing errors (usually means HTML response)
      if (error.message.includes('Unexpected token') || error.message.includes('JSON') || error.message.includes('is not valid JSON')) {
        const errorMsg = isProduction()
          ? 'השרת לא זמין. אנא נסה שוב בעוד מספר דקות.'
          : 'השרת המאובטח לא זמין. ודא שהשרת פועל על פורט 3001. הרץ: cd server && npm start';
        throw new Error(errorMsg);
      }
      
      // If error message already contains helpful instructions, use it as-is
      if (error.message.includes('cd server') || error.message.includes('פועל על פורט')) {
        throw error;
      }
      
      throw error;
    }
    throw new Error('שגיאה לא צפויה בתקשורת עם השרת');
  }
}

// Health check - skipped in production (no localhost server)
export async function checkServerHealth(): Promise<HealthStatus> {
  // In production, NEVER perform any fetch - return immediately
  if (isProduction()) {
    console.log('Production mode: using Firebase Functions (no localhost health check)');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Firebase Functions',
      skipped: true
    };
  }
  
  // In development, check local server
  return makeRequest<HealthStatus>('/health');
}

// Get server status and available providers
export async function getServerStatus(): Promise<ServerStatus> {
  return makeRequest<ServerStatus>('/api/status');
}

// Generate with OpenAI (direct proxy)
export async function generateWithOpenAI(messages: any[], model = 'gpt-4o'): Promise<any> {
  return makeRequest('/api/openai/generate', {
    method: 'POST',
    body: JSON.stringify({
      messages,
      model,
      max_tokens: 4000,
      temperature: 0.7
    }),
  });
}


// 🎯 Main assignment generation endpoint - returns structured data
export async function generateAssignment(params: AssignmentParams): Promise<AIResponse> {
  return makeRequest<AIResponse>('/api/generate-assignment', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// Check if error is transient (should retry) or permanent (should not retry)
function isTransientError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = (error.message || '').toLowerCase();
  const errorCode = error.code || '';
  
  // Permanent errors - don't retry
  const permanentErrors = [
    'api key',
    'unauthorized',
    'missing',
    'invalid input',
    'permission',
    'authentication',
    'auth_error',
    'not_configured',
    'missing_course_name',
    'invalid-argument'
  ];
  
  if (permanentErrors.some(term => errorMessage.includes(term) || errorCode.includes(term))) {
    return false;
  }
  
  // Transient errors - retry
  const transientErrors = [
    'failed to fetch',
    'network',
    'timeout',
    'econnreset',
    'enotfound',
    'econnrefused',
    'rate_limit',
    'server_error',
    'internal',
    'all_providers_failed'  // Server tried all providers, client can retry
  ];
  
  return transientErrors.some(term => errorMessage.includes(term) || errorCode.includes(term));
}

// Enhanced assignment generation with retry logic (only for transient failures)
export async function generateAssignmentWithRetry(
  params: AssignmentParams, 
  maxRetries = 2, // Reduced to 2 since server handles provider fallback
  baseDelay = 1000
): Promise<AIResponse> {
  let lastError: Error | null = null;
  
  // Log AI generation event (non-blocking)
  import("../analytics/analyticsLogger").then(({ logAnalyticsEvent }) => {
    logAnalyticsEvent("ai_generate", {
      courseName: params.courseName,
      faculty: params.faculty,
      department: params.department,
      tipCount: params.selectedMethods?.length || 0,
      preferredProvider: params.preferredProvider,
    });
  }).catch((logError) => {
    console.warn("Failed to log AI generation event:", logError);
  });
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Assignment generation attempt ${attempt}/${maxRetries}`);
      const result = await generateAssignment(params);
      
      // Validate structured response
      if (!result.data || !result.data.title) {
        throw new Error('תגובה לא תקינה מהשרת - חסר מידע בסיסי');
      }
      
      console.log(`✅ Successful generation on attempt ${attempt}`, {
        providerUsed: result.providerUsed || result.provider,
        attempts: result.attempts
      });
      return result;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('שגיאה לא ידועה');
      
      // Check if error is transient (network/server issues) or permanent (auth/config)
      if (!isTransientError(error)) {
        console.warn(`❌ Non-retryable error: ${lastError.message}`);
        throw lastError;
      }
      
      console.warn(`❌ Attempt ${attempt} failed (transient):`, lastError.message);
      
      // Log error on final attempt (non-blocking)
      if (attempt === maxRetries) {
        const errorToLog = lastError;
        if (errorToLog) {
          import("../analytics/analyticsLogger").then(({ logAnalyticsEvent }) => {
            logAnalyticsEvent("error", {
              message: errorToLog.message,
              context: "ai_generation_api",
              courseName: params.courseName,
              attempts: maxRetries,
            });
          }).catch((logError) => {
            console.warn("Failed to log error event:", logError);
          });
        }
        break;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`⏳ Waiting ${Math.round(delay)}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('כל הניסיונות נכשלו');
}

// Check available providers
export async function checkAvailableProviders(): Promise<{
  openai: boolean;
  claude: boolean;
}> {
  try {
    const status = await getServerStatus();
    return {
      openai: status.providers.openai === 'configured',
      claude: status.providers.claude === 'configured'
    };
  } catch (error) {
    console.error('Failed to check providers:', error);
    return {
      openai: false,
      claude: false
    };
  }
}

// Enhanced error handling with user-friendly messages
export function handleAPIError(error: any): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('network') || message.includes('failed to fetch')) {
      if (isProduction()) {
        return 'בעיית חיבור לשירותי Firebase Functions. אנא נסה שוב בעוד מספר דקות.';
      }
      return 'בעיית חיבור לשרת. ודא שהשרת המאובטח פועל על פורט 3001.';
    }
    
    // Firebase Functions errors
    if (message.includes('firebase') || message.includes('functions') || message.includes('not found')) {
      return 'שגיאה בשירותי Firebase. אנא נסה שוב או פנה לתמיכה.';
    }
    
    // Timeout errors
    if (message.includes('timeout')) {
      return 'הבקשה לא הושלמה בזמן. נסה שוב.';
    }
    
    // API key errors
    if (message.includes('api key') || message.includes('unauthorized') || message.includes('permission')) {
      return 'בעיה באימות המפתח. אנא פנה למנהל המערכת.';
    }
    
    // Rate limit errors
    if (message.includes('rate limit')) {
      return 'הגעת למגבלת השימוש. נסה שוב בעוד מספר דקות.';
    }
    
    // Invalid response errors
    if (message.includes('תגובה לא תקינה') || message.includes('invalid')) {
      return 'התקבלה תגובה לא תקינה מהשרת. נסה שוב.';
    }
    
    return error.message;
  }
  
  return 'שגיאה לא צפויה. אנא נסה שוב.';
}

// API Usage Tracking for analytics
export const APIUsageTracker = {
  stats: {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    providers: {} as Record<string, number>
  },
  
  track(endpoint: string, success: boolean, provider?: string) {
    this.stats.totalRequests++;
    
    if (success) {
      this.stats.successfulRequests++;
      if (provider) {
        this.stats.providers[provider] = (this.stats.providers[provider] || 0) + 1;
      }
    } else {
      this.stats.failedRequests++;
    }
    
    // Log for debugging
    console.log(`📊 API Usage: ${endpoint} - ${success ? 'SUCCESS' : 'FAILURE'} (Provider: ${provider || 'none'})`);
  },
  
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalRequests > 0 
        ? (this.stats.successfulRequests / this.stats.totalRequests * 100).toFixed(2) + '%'
        : '0%'
    };
  },
  
  reset() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      providers: {}
    };
  }
}; 