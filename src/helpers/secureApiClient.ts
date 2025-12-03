// 🔒 Secure API Client for Pedagogical Lego Backend Proxy
// This client ensures all AI API calls go through our secure backend proxy

const SERVER_URL = 'http://localhost:3001';

// 📝 Enhanced TypeScript interfaces for structured responses
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  service: string;
}

export interface ServerStatus {
  server: string;
  providers: {
    openai: 'configured' | 'missing';
    claude: 'configured' | 'missing';
    recommended?: 'openai' | 'claude';
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
  provider: string;
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
  preferredProvider?: 'openai' | 'claude';
}

// Generic request handler with enhanced error handling
async function makeRequest<T>(endpoint: string, options: {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
} = {}): Promise<T> {
  try {
    const url = `${SERVER_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
        code: 'HTTP_ERROR'
      }));
      
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      // Network errors or parsing errors
      if (error.message.includes('Failed to fetch')) {
        throw new Error('לא ניתן להתחבר לשרת. אנא ודא שהשרת פועל.');
      }
      throw error;
    }
    throw new Error('שגיאה לא צפויה בתקשורת עם השרת');
  }
}

// Health check
export async function checkServerHealth(): Promise<HealthStatus> {
  return makeRequest<HealthStatus>('/health');
}

// Get server status and available providers
export async function getServerStatus(): Promise<ServerStatus> {
  return makeRequest<ServerStatus>('/api/status');
}

// Generate with OpenAI (direct proxy)
export async function generateWithOpenAI(messages: any[], model = 'gpt-4'): Promise<any> {
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

// Generate with Claude (direct proxy)  
export async function generateWithClaude(messages: any[], model = 'claude-3-sonnet-20240229'): Promise<any> {
  return makeRequest('/api/claude/generate', {
    method: 'POST',
    body: JSON.stringify({
      messages,
      model,
      max_tokens: 4000
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

// Enhanced assignment generation with retry logic
export async function generateAssignmentWithRetry(
  params: AssignmentParams, 
  maxRetries = 2
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
      
      console.log(`✅ Successful generation on attempt ${attempt}`);
      return result;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('שגיאה לא ידועה');
      console.warn(`❌ Attempt ${attempt} failed:`, lastError.message);
      
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
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('כל הניסיונות נכשלו');
}

// Check available providers
export async function checkAvailableProviders(): Promise<{
  openai: boolean;
  claude: boolean;
  recommended?: 'openai' | 'claude';
}> {
  try {
    const status = await getServerStatus();
    return {
      openai: status.providers.openai === 'configured',
      claude: status.providers.claude === 'configured',
      recommended: status.providers.recommended || 'openai'
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
    
    if (message.includes('network') || message.includes('failed to fetch')) {
      return 'בעיית חיבור לשרת. אנא בדוק את חיבור האינטרנט ונסה שוב.';
    }
    
    if (message.includes('timeout')) {
      return 'הבקשה לא הושלמה בזמן. נסה שוב במספר דקות.';
    }
    
    if (message.includes('api key')) {
      return 'בעיה במפתח ה-API. אנא פנה למנהל המערכת.';
    }
    
    if (message.includes('rate limit')) {
      return 'הגעת למגבלת השימוש. נסה שוב בעוד מספר דקות.';
    }
    
    if (message.includes('תגובה לא תקינה')) {
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