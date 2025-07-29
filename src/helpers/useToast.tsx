import { useState, useCallback } from 'react';
import { ToastType, ToastProps } from '../components/Toast';

interface ToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface UseToastReturn {
  toasts: ToastProps[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  // Helper methods for common toast types
  showSuccess: (title: string, message?: string, duration?: number) => string;
  showError: (title: string, message?: string, persistent?: boolean) => string;
  showWarning: (title: string, message?: string, duration?: number) => string;
  showInfo: (title: string, message?: string, duration?: number) => string;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const newToast: ToastProps = {
      id,
      type: options.type,
      title: options.title,
      message: options.message,
      duration: options.duration ?? 5000,
      persistent: options.persistent ?? false,
    };

    setToasts(prevToasts => [...prevToasts, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Helper methods for common toast types
  const showSuccess = useCallback((title: string, message?: string, duration: number = 4000): string => {
    return addToast({
      type: 'success',
      title,
      message,
      duration,
    });
  }, [addToast]);

  const showError = useCallback((title: string, message?: string, persistent: boolean = false): string => {
    return addToast({
      type: 'error',
      title,
      message,
      duration: persistent ? 0 : 8000,
      persistent,
    });
  }, [addToast]);

  const showWarning = useCallback((title: string, message?: string, duration: number = 6000): string => {
    return addToast({
      type: 'warning',
      title,
      message,
      duration,
    });
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string, duration: number = 5000): string => {
    return addToast({
      type: 'info',
      title,
      message,
      duration,
    });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

// Common toast messages for the app
export const TOAST_MESSAGES = {
  // File upload
  FILE_UPLOAD_SUCCESS: (fileName: string) => ({
    title: 'קובץ הועלה בהצלחה',
    message: `הקובץ "${fileName}" נטען וניתן לעריכה`,
  }),
  FILE_UPLOAD_ERROR: (error: string) => ({
    title: 'שגיאה בהעלאת קובץ',
    message: error,
  }),
  FILE_SIZE_ERROR: (maxSize: string) => ({
    title: 'קובץ גדול מדי',
    message: `גודל הקובץ חורג מהמגבלה של ${maxSize}`,
  }),
  
  // Auto-save
  AUTO_SAVE_SUCCESS: {
    title: 'נשמר אוטומטית',
    message: 'השינויים שלך נשמרו במקומי',
  },
  AUTO_SAVE_ERROR: {
    title: 'שגיאה בשמירה',
    message: 'לא הצלחנו לשמור את השינויים במקומי',
  },
  DATA_RESTORED: {
    title: 'נתונים שוחזרו',
    message: 'השינויים הקודמים שלך שוחזרו אוטומטית',
  },
  
  // Assessment generation
  ASSESSMENT_GENERATION_START: {
    title: 'מתחיל ליצור מטלה',
    message: 'זה עלול לקחת כמה רגעים...',
  },
  ASSESSMENT_GENERATION_SUCCESS: {
    title: 'המטלה נוצרה בהצלחה!',
    message: 'המטלה והמחוון מוכנים לשימוש',
  },
  ASSESSMENT_GENERATION_ERROR: (error: string) => ({
    title: 'שגיאה ביצירת המטלה',
    message: error,
  }),
  
  // Form validation
  FORM_VALIDATION_ERROR: {
    title: 'חסרים פרטים',
    message: 'אנא מלא את כל השדות הנדרשים',
  },
  FORM_SUBMIT_SUCCESS: {
    title: 'הטופס נשלח בהצלחה',
    message: 'הפרטים נשמרו והועברו לשלב הבא',
  },
  
  // Network errors
  NETWORK_ERROR: {
    title: 'בעיית תקשורת',
    message: 'בדוק את החיבור לאינטרנט ונסה שוב',
  },
  SERVER_ERROR: {
    title: 'שגיאת שרת',
    message: 'השרת לא זמין כרגע, אנא נסה שוב מאוחר יותר',
  },
}; 