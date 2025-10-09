import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const reply = ctx.getResponse<FastifyReply>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Si el mensaje viene en objeto tipo { message: '...' }
    if (typeof message === 'object' && (message as any).message) {
      message = (message as any).message;
    }

    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      status,
      message,
    };

    // Log detallado
    this.logger.error(
      `❌ ${request.method} ${request.url}`,
      JSON.stringify(exception),
    );

    reply.status(status).send(errorResponse);
  }
}