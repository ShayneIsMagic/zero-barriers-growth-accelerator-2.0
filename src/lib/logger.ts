/**
 * Production-ready logging utility
 * Suppresses console messages in production builds
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      level: this.getLogLevel(),
      enableConsole: process.env.NODE_ENV === 'development',
      enableRemote: process.env.NODE_ENV === 'production',
    };
  }

  private getLogLevel(): LogLevel {
    if (process.env.NODE_ENV === 'production') {
      return 'warn';
    }
    return 'debug';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.config.level];
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    ...args: unknown[]
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}`;
  }

  debug(message: string, ..._args: unknown[]): void {
    if (this.shouldLog('debug') && this.config.enableConsole) {
      console.debug(this.formatMessage('debug', message), ..._args);
    }
  }

  info(message: string, ..._args: unknown[]): void {
    if (this.shouldLog('info') && this.config.enableConsole) {
      console.info(this.formatMessage('info', message), ..._args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn') && this.config.enableConsole) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ..._args: unknown[]): void {
    if (this.shouldLog('error')) {
      if (this.config.enableConsole) {
        console.error(this.formatMessage('error', message), ..._args);
      }

      // In production, send to remote logging service
      if (this.config.enableRemote) {
        this.sendToRemoteLogging('error', message, _args);
      }
    }
  }

  private sendToRemoteLogging(
    _level: LogLevel,
    _message: string,
    _args: unknown[]
  ): void {
    // Implementation for remote logging (e.g., Sentry, LogRocket, etc.)
    // This is a placeholder - implement based on your logging service
    try {
      // Example: Sentry.captureMessage(message, level);
      // Example: LogRocket.log(level, message, args);
    } catch (error) {
      // Fallback to console if remote logging fails
      if (process.env.NODE_ENV === 'development') {
        console.error('Remote logging failed:', error);
      }
    }
  }

  // Suppress console methods in production
  suppressConsole(): void {
    if (process.env.NODE_ENV === 'production') {
      // Override console methods to prevent accidental logging
      const noop = () => {};
      console.log = noop;
      console.debug = noop;
      console.info = noop;
      // Keep warn and error for critical issues
    }
  }
}

// Create singleton instance
export const logger = new Logger();

// Export individual methods for convenience
export const { debug, info, warn, error } = logger;

// Export the logger instance
export default logger;
