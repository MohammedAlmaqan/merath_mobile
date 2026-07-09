/**
 * Comprehensive Error Handling System
 * Provides structured error handling, recovery strategies, and user-friendly messages
 * 
 * @author Manus AI
 * @version 1.0.0
 */

import { logger } from './logger';

export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  details?: Record<string, any>;
  originalError?: Error;
  recoveryAction?: () => Promise<void>;
}

export class ApplicationError extends Error implements AppError {
  type: ErrorType;
  userMessage: string;
  details?: Record<string, any>;
  originalError?: Error;
  recoveryAction?: () => Promise<void>;

  constructor(
    type: ErrorType,
    message: string,
    userMessage: string,
    details?: Record<string, any>,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.type = type;
    this.userMessage = userMessage;
    this.details = details;
    this.originalError = originalError;
  }
}

/**
 * Error Handler Class
 */
export class ErrorHandler {
  /**
   * Handle calculation errors
   */
  static handleCalculationError(error: Error, context?: Record<string, any>): AppError {
    logger.error('Calculation error occurred', error);

    // Check for specific calculation errors
    if (error.message.includes('invalid heir')) {
      return new ApplicationError(
        ErrorType.CALCULATION_ERROR,
        error.message,
        'تم تحديد وارث غير صحيح. يرجى التحقق من بيانات الورثة.',
        context,
        error
      );
    }

    if (error.message.includes('invalid estate')) {
      return new ApplicationError(
        ErrorType.CALCULATION_ERROR,
        error.message,
        'بيانات التركة غير صحيحة. يرجى التحقق من القيم المدخلة.',
        context,
        error
      );
    }

    if (error.message.includes('division by zero')) {
      return new ApplicationError(
        ErrorType.CALCULATION_ERROR,
        error.message,
        'حدث خطأ في الحساب: قسمة على صفر. يرجى التحقق من البيانات.',
        context,
        error
      );
    }

    // Generic calculation error
    return new ApplicationError(
      ErrorType.CALCULATION_ERROR,
      error.message,
      'حدث خطأ أثناء حساب الميراث. يرجى المحاولة مرة أخرى.',
      context,
      error
    );
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(
    error: Error,
    field?: string,
    context?: Record<string, any>
  ): AppError {
    logger.warn('Validation error', error);

    if (field) {
      return new ApplicationError(
        ErrorType.VALIDATION_ERROR,
        error.message,
        `خطأ في حقل "${field}": ${error.message}`,
        { field, ...context },
        error
      );
    }

    return new ApplicationError(
      ErrorType.VALIDATION_ERROR,
      error.message,
      'بيانات غير صحيحة. يرجى التحقق من جميع الحقول.',
      context,
      error
    );
  }

  /**
   * Handle storage errors
   */
  static handleStorageError(error: Error, operation: string, context?: Record<string, any>): AppError {
    logger.error(`Storage error during ${operation}`, error);

    const userMessages: Record<string, string> = {
      save: 'فشل حفظ البيانات. يرجى المحاولة مرة أخرى.',
      load: 'فشل تحميل البيانات. يرجى المحاولة مرة أخرى.',
      delete: 'فشل حذف البيانات. يرجى المحاولة مرة أخرى.',
      clear: 'فشل مسح البيانات. يرجى المحاولة مرة أخرى.',
    };

    return new ApplicationError(
      ErrorType.STORAGE_ERROR,
      error.message,
      userMessages[operation] || 'حدث خطأ في التخزين.',
      { operation, ...context },
      error
    );
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: Error, endpoint?: string, context?: Record<string, any>): AppError {
    logger.error(`Network error at ${endpoint}`, error);

    return new ApplicationError(
      ErrorType.NETWORK_ERROR,
      error.message,
      'فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
      { endpoint, ...context },
      error
    );
  }

  /**
   * Handle permission errors
   */
  static handlePermissionError(error: Error, permission: string, context?: Record<string, any>): AppError {
    logger.warn(`Permission denied: ${permission}`, error);

    const permissionMessages: Record<string, string> = {
      camera: 'لم يتم منح صلاحية الكاميرا.',
      location: 'لم يتم منح صلاحية الموقع.',
      contacts: 'لم يتم منح صلاحية الوصول إلى جهات الاتصال.',
      storage: 'لم يتم منح صلاحية الوصول إلى التخزين.',
    };

    return new ApplicationError(
      ErrorType.PERMISSION_ERROR,
      error.message,
      permissionMessages[permission] || `لم يتم منح صلاحية ${permission}.`,
      { permission, ...context },
      error
    );
  }

  /**
   * Handle not found errors
   */
  static handleNotFoundError(error: Error, resource: string, context?: Record<string, any>): AppError {
    logger.warn(`Resource not found: ${resource}`, error);

    return new ApplicationError(
      ErrorType.NOT_FOUND_ERROR,
      error.message,
      `لم يتم العثور على ${resource}.`,
      { resource, ...context },
      error
    );
  }

  /**
   * Handle unknown errors
   */
  static handleUnknownError(error: Error, context?: Record<string, any>): AppError {
    logger.critical('Unknown error occurred', error, context);

    return new ApplicationError(
      ErrorType.UNKNOWN_ERROR,
      error.message,
      'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.',
      context,
      error
    );
  }

  /**
   * Wrap async function with error handling
   */
  static async wrapAsync<T>(
    fn: () => Promise<T>,
    errorHandler?: (error: Error) => AppError
  ): Promise<{ data?: T; error?: AppError }> {
    try {
      const data = await fn();
      return { data };
    } catch (error) {
      const appError = errorHandler
        ? errorHandler(error as Error)
        : this.handleUnknownError(error as Error, {});
      return { error: appError };
    }
  }

  /**
   * Wrap sync function with error handling
   */
  static wrapSync<T>(
    fn: () => T,
    errorHandler?: (error: Error) => AppError
  ): { data?: T; error?: AppError } {
    try {
      const data = fn();
      return { data };
    } catch (error) {
      const appError = errorHandler
        ? errorHandler(error as Error)
        : this.handleUnknownError(error as Error, {});
      return { error: appError };
    }
  }

  /**
   * Retry logic with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        logger.debug(`Attempt ${attempt}/${maxAttempts}`);
        return await fn();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Attempt ${attempt} failed`, error as Error);

        if (attempt < maxAttempts) {
          const delay = delayMs * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Safe JSON parse
   */
  static safeJsonParse<T>(json: string, defaultValue: T): T {
    try {
      return JSON.parse(json) as T;
    } catch (error) {
      logger.warn('Failed to parse JSON', error as Error);
      return defaultValue;
    }
  }

  /**
   * Safe JSON stringify
   */
  static safeJsonStringify(obj: any, defaultValue: string = '{}'): string {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      logger.warn('Failed to stringify JSON', error as Error);
      return defaultValue;
    }
  }
}

export default ErrorHandler;
