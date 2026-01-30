/**
 * Error Handling Utility
 * Provides centralized error handling with retry logic, logging, and user-friendly messages
 */

import { toast } from 'react-toastify';

/**
 * Error type definitions
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  VALIDATION_ERROR: 'Please check the form data and try again.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  NOT_FOUND_ERROR: 'The resource you requested was not found.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

/**
 * HTTP Status Code to Error Type Mapping
 */
const STATUS_CODE_MAP = {
  400: ERROR_TYPES.VALIDATION,
  401: ERROR_TYPES.AUTH,
  403: ERROR_TYPES.AUTH,
  404: ERROR_TYPES.NOT_FOUND,
  408: ERROR_TYPES.TIMEOUT,
  429: { type: ERROR_TYPES.SERVER, message: 'Too many requests. Please try again later.' },
  500: ERROR_TYPES.SERVER,
  502: ERROR_TYPES.SERVER,
  503: ERROR_TYPES.SERVER,
  504: ERROR_TYPES.TIMEOUT,
};

/**
 * Classify error type from HTTP response or error object
 */
export const classifyError = (error) => {
  if (!error) {
    return { type: ERROR_TYPES.UNKNOWN, message: ERROR_MESSAGES.UNKNOWN_ERROR };
  }

  // Network errors
  if (!error.response) {
    if (error.message === 'Network Error') {
      return { type: ERROR_TYPES.NETWORK, message: ERROR_MESSAGES.NETWORK_ERROR };
    }
    if (error.code === 'ECONNABORTED') {
      return { type: ERROR_TYPES.TIMEOUT, message: ERROR_MESSAGES.TIMEOUT_ERROR };
    }
    return { type: ERROR_TYPES.UNKNOWN, message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
  }

  // HTTP errors
  const status = error.response.status;
  const data = error.response.data;
  
  const mappedError = STATUS_CODE_MAP[status] || ERROR_TYPES.SERVER;
  const type = typeof mappedError === 'string' ? mappedError : mappedError.type;
  const message = typeof mappedError === 'object' ? mappedError.message : ERROR_MESSAGES[type];

  // Use API-provided error message if available
  const detailMessage = data?.detail || data?.message || message;

  return { type, message: detailMessage };
};

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504]
};

/**
 * Check if error is retryable
 */
export const isRetryable = (error) => {
  if (!error.response) {
    // Network errors are retryable
    return true;
  }

  return RETRY_CONFIG.retryableStatusCodes.includes(error.response.status);
};

/**
 * Calculate delay for exponential backoff
 */
export const calculateBackoffDelay = (attempt) => {
  const delay = Math.min(
    RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
    RETRY_CONFIG.maxDelay
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
};

/**
 * Retry async operation with exponential backoff
 */
export const retryWithBackoff = async (
  operation,
  maxRetries = RETRY_CONFIG.maxRetries,
  onRetry = null
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (!isRetryable(error) || attempt === maxRetries) {
        throw error;
      }

      // Calculate delay
      const delay = calculateBackoffDelay(attempt);

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, delay, error);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Handle API errors with retry prompt
 */
export const handleApiError = (error, options = {}) => {
  const {
    showToast = true,
    onRetry = null,
    context = ''
  } = options;

  const { type, message } = classifyError(error);
  
  console.error(`[${type}]${context ? ` ${context}:` : ''}`, error);

  if (showToast) {
    // Special handling for auth errors
    if (type === ERROR_TYPES.AUTH) {
      toast.error('Session expired. Please log in again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    } else {
      toast.error(message, {
        position: 'top-right',
        autoClose: 5000,
      });

      // Show retry option if error is retryable and retry callback provided
      if (isRetryable(error) && onRetry) {
        toast.info('Would you like to retry?', {
          position: 'bottom-center',
          autoClose: false,
          action: {
            label: 'Retry',
            onClick: onRetry
          }
        });
      }
    }
  }

  return { type, message };
};

/**
 * Format validation errors from API response
 */
export const formatValidationErrors = (error) => {
  const errors = {};

  if (!error.response || !error.response.data) {
    return errors;
  }

  const data = error.response.data;

  // Handle Pydantic validation errors (FastAPI)
  if (Array.isArray(data.detail)) {
    data.detail.forEach(item => {
      const field = item.loc[item.loc.length - 1];
      errors[field] = item.msg;
    });
  }
  // Handle custom error format
  else if (data.errors) {
    Object.assign(errors, data.errors);
  }
  // Handle single field error
  else if (data.field && data.message) {
    errors[data.field] = data.message;
  }

  return errors;
};

/**
 * Create error boundary component handler
 */
export const handleErrorBoundary = (error, errorInfo) => {
  console.error('Error Boundary caught:', error);
  console.error('Error Info:', errorInfo);

  // Log to error tracking service (Sentry, LogRocket, etc.)
  if (window.Sentry) {
    window.Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  toast.error('An unexpected error occurred. Please refresh the page.', {
    position: 'top-right',
    autoClose: 5000,
  });
};

/**
 * Timeout promise wrapper
 */
export const withTimeout = (promise, timeoutMs = 30000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Request timeout')),
        timeoutMs
      )
    )
  ]);
};

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = (json, fallback = {}) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error('JSON Parse Error:', e);
    return fallback;
  }
};

/**
 * Create abort controller with timeout
 */
export const createAbortController = (timeoutMs = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeoutId };
};

/**
 * Clear abort timeout
 */
export const clearAbortTimeout = (timeoutId) => {
  clearTimeout(timeoutId);
};

/**
 * Error logging utility
 */
export class ErrorLogger {
  static logs = [];
  static maxLogs = 100;

  static log(error, context) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      context,
      type: error.type,
      message: error.message,
      stack: error.stack
    };

    this.logs.push(logEntry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`📋 Error Log: ${context}`);
      console.log('Time:', timestamp);
      console.log('Type:', error.type);
      console.log('Message:', error.message);
      if (error.stack) console.log('Stack:', error.stack);
      console.groupEnd();
    }
  }

  static getLogs() {
    return this.logs;
  }

  static clearLogs() {
    this.logs = [];
  }

  static exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

/**
 * Create error response for failed requests
 */
export const createErrorResponse = (type, message, details = {}) => {
  return {
    success: false,
    error: {
      type,
      message,
      details,
      timestamp: new Date().toISOString()
    }
  };
};
