export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  userId?: string
  metadata?: Record<string, any>
}

class Logger {
  private log(level: LogLevel, message: string, userId?: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      userId,
      metadata,
    }

    // In production, you might want to send this to a logging service
    console.log(JSON.stringify(entry))
  }

  error(message: string, userId?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, userId, metadata)
  }

  warn(message: string, userId?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.WARN, message, userId, metadata)
  }

  info(message: string, userId?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, userId, metadata)
  }

  debug(message: string, userId?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, userId, metadata)
  }
}

export const logger = new Logger()
