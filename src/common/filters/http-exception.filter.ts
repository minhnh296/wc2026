import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import type { Response, Request } from 'express';
import { Prisma } from '@prisma/client';

const getErrorNameByStatus = (status: number): string => {
  switch (status) {
    case 400: return 'Bad Request';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 404: return 'Not Found';
    case 409: return 'Conflict';
    case 412: return 'Precondition Failed';
    case 422: return 'Unprocessable Entity';
    default: return 'Internal Server Error';
  }
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log chi tiết lỗi trên server để developer dễ debug
    this.logger.error(exception);

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';
    let errorDetails: unknown = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as Record<string, unknown>;
        if (typeof resObj.message === 'string' || Array.isArray(resObj.message)) {
          message = resObj.message as string | string[];
        } else {
          message = exception.message;
        }
        errorDetails = resObj.error ?? getErrorNameByStatus(status);
      } else {
        message = exception.message;
        errorDetails = getErrorNameByStatus(status);
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          status = HttpStatus.CONFLICT;
          const targets = (exception.meta?.target as string[]) || [];
          const fields = targets.join(', ');
          message = fields
            ? `Dữ liệu bị trùng lặp ở trường: ${fields}.`
            : 'Dữ liệu đã tồn tại trong hệ thống.';
          break;
        }
        case 'P2025': {
          status = HttpStatus.NOT_FOUND;
          message = 'Không tìm thấy bản ghi yêu cầu.';
          break;
        }
        case 'P2003': {
          status = HttpStatus.BAD_REQUEST;
          message = 'Dữ liệu liên kết không hợp lệ hoặc đang được sử dụng.';
          break;
        }
        default: {
          status = HttpStatus.BAD_REQUEST;
          message = 'Lỗi tương tác cơ sở dữ liệu.';
          break;
        }
      }
      errorDetails = getErrorNameByStatus(status);
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Dữ liệu gửi lên không đúng cấu trúc hoặc thiếu các trường bắt buộc của hệ thống.';
      errorDetails = 'Bad Request';
    } else if (exception instanceof Error) {
      message = status === HttpStatus.INTERNAL_SERVER_ERROR 
        ? 'Đã xảy ra lỗi hệ thống. Vui lòng liên hệ quản trị viên.' 
        : exception.message;
      errorDetails = getErrorNameByStatus(status);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
      error: errorDetails,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
