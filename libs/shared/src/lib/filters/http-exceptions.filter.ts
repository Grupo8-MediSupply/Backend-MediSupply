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

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let code: string | undefined;
    let context: Record<string, any> | undefined;
    let stack: string | undefined;
    let exceptionName = 'UnknownException';

    // 🧩 HttpException
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      status = exception.getStatus();
      exceptionName = exception.constructor?.name ?? 'HttpException';

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object') {
        message = (response as any).message ?? response;
      }

      stack = exception.stack;
    }

    // 🧩 DomainException (de tu dominio)
    else if (exception instanceof DomainException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = exception.code;
      context = exception.context;
      stack = exception.stack;
      exceptionName = exception.constructor?.name ?? 'DomainException';
    }

    // 🧩 Errores genéricos de tipo Error
    else if (exception instanceof Error) {
      message = exception.message || 'Error inesperado';
      stack = exception.stack;
      exceptionName = exception.constructor?.name ?? 'Error';
    }

    // 🧩 Si no entra en ninguno de los anteriores
    else {
      message = "Error al realizar la operación. Contáctese con soporte.";
    }

    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      message,
      ...(code && { code }),
      ...(context && { context }),
    };

    // 📘 Log más completo y sin errores de tipo
    this.logger.error(
      `🚨 [${request.method}] ${request.url}`,
      `
📋 Status: ${status}
🧩 Exception: ${exceptionName}
💬 Message: ${
        typeof message === 'string' ? message : JSON.stringify(message, null, 2)
      }
🧠 Code: ${code ?? 'N/A'}
👤 Request Info: ${JSON.stringify({
        ip: request.ip,
        headers: {
          'user-agent': request.headers['user-agent'],
          referer: request.headers['referer'],
        },
      })}
🪵 Stack:
${stack ?? '(no stack trace)'}
`.trim()
    );

    reply.status(status).send(errorResponse);
  }
}
