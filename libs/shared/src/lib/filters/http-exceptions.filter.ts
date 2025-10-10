import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { DomainException } from '@medi-supply/core'; 

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const reply = ctx.getResponse<FastifyReply>();

    let status: number;
    let message: string | object;
    let code: string | undefined;
    let context: Record<string, any> | undefined;

    // 🧩 Caso 1: HttpException de NestJS
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();

      if (typeof message === 'object' && (message as any).message) {
        message = (message as any).message;
      }
    }

    // 🧩 Caso 2: DomainException (de tu capa de dominio)
    else if (exception instanceof DomainException) {
      status = HttpStatus.BAD_REQUEST; // o HttpStatus.UNPROCESSABLE_ENTITY si lo prefieres
      message = exception.message;
      code = exception.code;
      context = exception.context;
    }

    // 🧩 Caso 3: Excepción desconocida
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      status,
      message,
      ...(code && { code }),
      ...(context && { context }),
    };

    // 🧾 Log más detallado
    this.logger.error(
      `❌ ${request.method} ${request.url} → ${message}`,
      JSON.stringify(exception),
    );

    reply.status(status).send(errorResponse);
  }
}
