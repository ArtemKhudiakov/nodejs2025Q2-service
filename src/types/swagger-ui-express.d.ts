import { RequestHandler } from 'express';

interface SwaggerUiOptions {
  explorer?: boolean;
  customCss?: string;
  customfavIcon?: string;
  customSiteTitle?: string;
  swaggerOptions?: Record<string, unknown>;
  [key: string]: unknown;
}

declare const swaggerUi: {
  serve: RequestHandler[];
  setup: (swaggerDoc: any, options?: SwaggerUiOptions) => RequestHandler;
};

export = swaggerUi;

