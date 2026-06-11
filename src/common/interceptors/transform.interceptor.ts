import { Injectable } from '@nestjs/common';
import type { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: unknown;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((result) => {
        // Nếu result chứa cấu trúc phân trang { data: [...], meta: {...} }
        if (
          result &&
          typeof result === 'object' &&
          'data' in result &&
          'meta' in result
        ) {
          const { data, meta, ...rest } = result as Record<string, unknown>;
          return {
            success: true,
            statusCode,
            message: 'Success',
            data: (data ?? []) as T,
            meta,
            ...rest,
          };
        }

        return {
          success: true,
          statusCode,
          message: 'Success',
          data: result ?? null,
        };
      }),
    );
  }
}
