import { applyDecorators } from '@nestjs/common';
import type { Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

interface ResponseWrapperOptions<TModel extends Type<unknown>> {
  type: TModel;
  description?: string;
  isPage?: boolean;
}

const getWrapperSchema = <TModel extends Type<unknown>>(
  model: TModel,
  isPage = false,
) => {
  return {
    properties: {
      success: { type: 'boolean', example: true },
      statusCode: { type: 'number', example: 200 },
      message: { type: 'string', example: 'Success' },
      data: isPage
        ? {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          }
        : {
            $ref: getSchemaPath(model),
          },
      ...(isPage && {
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            pageSize: { type: 'number', example: 20 },
            totalPages: { type: 'number', example: 5 },
          },
        },
      }),
    },
  };
};

export const ApiCreatedResponseWrapper = <TModel extends Type<unknown>>(
  options: ResponseWrapperOptions<TModel>,
) => {
  return applyDecorators(
    ApiExtraModels(options.type),
    ApiCreatedResponse({
      description: options.description || 'Tạo mới thành công.',
      schema: getWrapperSchema(options.type, options.isPage),
    }),
  );
};

export const ApiOkResponseWrapper = <TModel extends Type<unknown>>(
  options: ResponseWrapperOptions<TModel>,
) => {
  return applyDecorators(
    ApiExtraModels(options.type),
    ApiOkResponse({
      description: options.description || 'Thành công.',
      schema: getWrapperSchema(options.type, options.isPage),
    }),
  );
};

const getErrorNameByStatus = (status: number): string => {
  switch (status) {
    case 400: return 'Bad Request';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 404: return 'Not Found';
    case 409: return 'Conflict';
    case 412: return 'Precondition Failed';
    default: return 'Internal Server Error';
  }
};

export const ApiErrorResponseWrapper = (status: number, description: string) => {
  return ApiResponse({
    status,
    description,
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: status },
        message: { type: 'string', example: 'Thông báo lỗi chi tiết bằng tiếng Việt.' },
        error: { type: 'string', example: getErrorNameByStatus(status) },
        path: { type: 'string', example: '/players/1' },
        timestamp: { type: 'string', example: '2026-06-10T11:23:00.000Z' },
      },
    },
  });
};
