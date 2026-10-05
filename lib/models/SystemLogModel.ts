import mongoose from 'mongoose';

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum LogModule {
  AUTH = 'auth',
  ORDER = 'order',
  PAYMENT = 'payment',
  SYSTEM = 'system',
  SECURITY = 'security',
  PRODUCT = 'product',
}

export interface ISystemLog extends mongoose.Document {
  level: LogLevel;
  module: LogModule;
  message: string;
  meta: Record<string, any>;
  ipAddress?: string;
  user?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const systemLogSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: Object.values(LogLevel),
      required: true,
      index: true,
    },
    module: {
      type: String,
      enum: Object.values(LogModule),
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt for logs
  }
);

// Add TTL index to automatically delete logs older than 30 days
systemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const SystemLogModel = mongoose.models.SystemLog || mongoose.model<ISystemLog>('SystemLog', systemLogSchema);

export default SystemLogModel;
