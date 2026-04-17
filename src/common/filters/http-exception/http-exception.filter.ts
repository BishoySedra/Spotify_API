import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      return res.status(exception.getStatus()).json({
        error: {
          statusCode: exception.getStatus(),
          message: exception.message,
        },
      });
    }

    return res.status(500).json({
      error: {
        statusCode: 500,
        message: 'Internal server error',
      },
    });
  }
}
