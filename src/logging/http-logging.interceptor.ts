import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';
import { Request, Response } from 'express';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, query, body } = request;
    const startTime = Date.now();

    const requestLog = [
      `${method} ${url}`,
      Object.keys(query).length > 0 ? `Query: ${JSON.stringify(query)}` : '',
      body && Object.keys(body).length > 0
        ? `Body: ${JSON.stringify(body)}`
        : '',
    ]
      .filter(Boolean)
      .join(' | ');

    this.loggingService.log(`Incoming request: ${requestLog}`, 'HTTP');

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.loggingService.log(
            `Response: ${method} ${url} ${response.statusCode} - ${duration}ms`,
            'HTTP',
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          this.loggingService.error(
            `Response: ${method} ${url} ${statusCode} - ${duration}ms - ${error.message}`,
            error.stack,
            'HTTP',
          );
        },
      }),
    );
  }
}

