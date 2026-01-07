/**
 * Centralized Logging System
 * Handles all application logging, error tracking, and performance monitoring
 * 
 * @author Manus AI
 * @version 1.0.0
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  stackTrace?: string;
  duration?: number; // milliseconds
}

export interface LoggerConfig {
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  maxStoredLogs: number;
  minLevel: LogLevel;
}

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private performanceMarkers: Map<string, number> = new Map();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enableConsole: true,
      enableStorage: true,
      enableRemote: false,
      maxStoredLogs: 1000,
      minLevel: LogLevel.DEBUG,
      ...config,
    };
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log a critical error
   */
  critical(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.CRITICAL, message, context, error);
  }

  /**
   * Main logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    // Check if this log level should be logged
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
      stackTrace: error?.stack,
    };

    // Store log
    if (this.config.enableStorage) {
      this.storeLo(entry);
    }

    // Log to console
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Send to remote server
    if (this.config.enableRemote) {
      this.sendToRemote(entry);
    }
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.CRITICAL];
    const minIndex = levels.indexOf(this.config.minLevel);
    const levelIndex = levels.indexOf(level);
    return levelIndex >= minIndex;
  }

  /**
   * Store log entry
   */
  private storeLo(entry: LogEntry): void {
    this.logs.push(entry);

    // Trim logs if exceeds max
    if (this.logs.length > this.config.maxStoredLogs) {
      this.logs = this.logs.slice(-this.config.maxStoredLogs);
    }
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level}]`;
    const style = this.getConsoleStyle(entry.level);

    if (entry.error) {
      console.error(`${prefix} ${entry.message}`, entry.error, entry.context);
    } else {
      console.log(`${prefix} ${entry.message}`, entry.context);
    }
  }

  /**
   * Get console styling for log level
   */
  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: 'color: gray',
      [LogLevel.INFO]: 'color: blue',
      [LogLevel.WARN]: 'color: orange',
      [LogLevel.ERROR]: 'color: red',
      [LogLevel.CRITICAL]: 'color: red; font-weight: bold',
    };
    return styles[level];
  }

  /**
   * Send log to remote server
   */
  private async sendToRemote(entry: LogEntry): Promise<void> {
    try {
      // TODO: Implement remote logging
      // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
    } catch (error) {
      console.error('Failed to send log to remote server', error);
    }
  }

  /**
   * Start performance measurement
   */
  startTimer(label: string): void {
    this.performanceMarkers.set(label, Date.now());
    this.debug(`Timer started: ${label}`);
  }

  /**
   * End performance measurement and log duration
   */
  endTimer(label: string): number {
    const startTime = this.performanceMarkers.get(label);
    if (!startTime) {
      this.warn(`Timer not found: ${label}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.performanceMarkers.delete(label);
    this.info(`Timer ended: ${label}`, { duration: `${duration}ms` });

    return duration;
  }

  /**
   * Get all stored logs
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (!level) {
      return [...this.logs];
    }
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Clear all stored logs
   */
  clearLogs(): void {
    this.logs = [];
    this.info('Logs cleared');
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get log statistics
   */
  getStats(): Record<LogLevel, number> {
    const stats: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.CRITICAL]: 0,
    };

    this.logs.forEach((log) => {
      stats[log.level]++;
    });

    return stats;
  }
}

// Create singleton instance
export const logger = new Logger({
  enableConsole: true,
  enableStorage: true,
  enableRemote: false,
  maxStoredLogs: 1000,
  minLevel: LogLevel.DEBUG,
});

export default logger;
