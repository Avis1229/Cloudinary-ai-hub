import dbConnect from './dbConnect';
import SystemLogModel, { LogLevel, LogModule } from './models/SystemLogModel';

interface LogOptions {
  module: LogModule;
  message: string;
  meta?: Record<string, any>;
  ipAddress?: string;
  user?: string; // User ObjectId string
}

class Logger {
  private async writeLog(level: LogLevel, options: LogOptions) {
    try {
      // Don't await dbConnect directly if we're not sure it's connected, 
      // but usually in Next.js it's cached.
      await dbConnect();
      
      const logEntry = new SystemLogModel({
        level,
        module: options.module,
        message: options.message,
        meta: options.meta || {},
        ipAddress: options.ipAddress,
        user: options.user,
      });

      // We do not await save() if we want it to be fully async without blocking,
      // but in serverless environments, not awaiting might cause the process to exit
      // before the write completes. We'll await it for reliability.
      await logEntry.save();
    } catch (error) {
      console.error('[SYSTEM_LOGGER_ERROR]', error);
      // Fallback to console if DB logging fails
      console.log(`[${level.toUpperCase()}] [${options.module}] ${options.message}`, options.meta);
    }
  }

  public info(options: LogOptions) {
    return this.writeLog(LogLevel.INFO, options);
  }

  public warn(options: LogOptions) {
    return this.writeLog(LogLevel.WARN, options);
  }

  public error(options: LogOptions) {
    return this.writeLog(LogLevel.ERROR, options);
  }

  public critical(options: LogOptions) {
    return this.writeLog(LogLevel.CRITICAL, options);
  }
}

export const systemLogger = new Logger();
export { LogLevel, LogModule };
