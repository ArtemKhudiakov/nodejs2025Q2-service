import { Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggingService {
  private readonly logLevels: Record<LogLevel, number> = {
    verbose: 0,
    debug: 1,
    log: 2,
    warn: 3,
    error: 4,
    fatal: 5,
  };

  private readonly logDir = path.join(process.cwd(), 'logs');
  private readonly appLogFile = path.join(this.logDir, 'app.log');
  private readonly errorLogFile = path.join(this.logDir, 'error.log');

  private readonly maxLogFileSizeBytes: number;
  private readonly currentLogLevel: number;

  private canWriteToFiles = true;

  constructor(private readonly configService: ConfigService) {
    const maxFileSizeKb =
      this.configService.get<number>('MAX_LOG_FILE_SIZE_KB') || 10240;
    this.maxLogFileSizeBytes = maxFileSizeKb * 1024;

    const logLevel = this.configService.get<LogLevel>('LOG_LEVEL') || 'log';
    this.currentLogLevel = this.logLevels[logLevel] ?? 2;

    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true, mode: 0o755 });
      }
    } catch (err: any) {
      this.canWriteToFiles = false;
      const message = err?.message || String(err);
      console.warn(
        `Cannot create log directory ${this.logDir}: ${message}. Logging to console only.`,
      );
    }
  }

  verbose(message: string, context?: string) {
    this.writeLog('verbose', message, context);
  }

  debug(message: string, context?: string) {
    this.writeLog('debug', message, context);
  }

  log(message: string, context?: string) {
    this.writeLog('log', message, context);
  }

  warn(message: string, context?: string) {
    this.writeLog('warn', message, context);
  }

  error(message: string, trace?: string, context?: string) {
    const fullMessage = trace ? `${message}\n${trace}` : message;
    this.writeLog('error', fullMessage, context);
    this.writeToFile(this.errorLogFile, fullMessage, 'error', context);
  }

  fatal(message: string, trace?: string, context?: string) {
    const fullMessage = trace ? `${message}\n${trace}` : message;
    this.writeLog('fatal', fullMessage, context);
    this.writeToFile(this.errorLogFile, fullMessage, 'fatal', context);
  }

  private writeLog(level: LogLevel, message: string, context?: string) {
    const levelPriority = this.logLevels[level];

    if (levelPriority < this.currentLogLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${contextStr} ${message}`;

    // Запись в консоль
    console.log(logMessage);

    // Запись в файл
    if (level === 'error' || level === 'fatal') {
      // Ошибки уже записываются в error.log через метод error/fatal
      this.writeToFile(this.appLogFile, message, level, context);
    } else {
      this.writeToFile(this.appLogFile, message, level, context);
    }
  }

  private writeToFile(
    filePath: string,
    message: string,
    level: LogLevel,
    context?: string,
  ) {
    if (!this.canWriteToFiles) {
      return;
    }

    try {
      this.rotateLogIfNeeded(filePath);

      const timestamp = new Date().toISOString();
      const contextStr = context ? `[${context}]` : '';
      const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${contextStr} ${message}\n`;

      fs.appendFileSync(filePath, logMessage, 'utf8');
    } catch (err: any) {
      if (err.code === 'EACCES' || err.code === 'EPERM') {
        this.canWriteToFiles = false;
        console.warn(
          `Cannot write to log file ${filePath}: permission denied. Logging to console only.`,
        );
      }
    }
  }

  private rotateLogIfNeeded(filePath: string) {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }

      const stats = fs.statSync(filePath);
      if (stats.size >= this.maxLogFileSizeBytes) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const ext = path.extname(filePath);
        const base = path.basename(filePath, ext);
        const dir = path.dirname(filePath);
        const rotatedFile = path.join(dir, `${base}-${timestamp}${ext}`);

        fs.renameSync(filePath, rotatedFile);
      }
    } catch (err) {
      console.error('Failed to rotate log file:', err);
    }
  }
}

