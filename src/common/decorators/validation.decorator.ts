import {
  MaxLength,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsEmail,
  IsInt,
  IsBoolean,
  IsArray,
  IsEnum,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import type { ValidationOptions } from 'class-validator';

// Custom Options cho Text Decorator
export interface TextDecoratorOptions {
  required?: boolean;
  validationOptions?: ValidationOptions;
}

// 1. Base Decorator cho chuỗi văn bản (Tự động trim, tự động check required mặc định, check max length)
function createTextDecorator(defaultMax: number) {
  return (
    label = 'Trường này',
    max = defaultMax,
    options?: TextDecoratorOptions,
  ) => {
    return (target: object, propertyKey: string) => {
      // Tự động trim
      Transform(({ value }) => typeof value === 'string' ? value.trim() : value)(target, propertyKey);

      // Mặc định required = true, tự động check rỗng
      const required = options?.required ?? true;
      if (required) {
        IsNotEmpty({
          message: `${label} không được để trống.`,
          ...options?.validationOptions,
        })(target, propertyKey);
      }

      // Check độ dài tối đa
      MaxLength(max, {
        message: `${label} không được vượt quá $constraint1 ký tự.`,
        ...options?.validationOptions,
      })(target, propertyKey);
    };
  };
}

export const IsCodeText = createTextDecorator(10);
export const IsNameText = createTextDecorator(50);
export const IsShortText = createTextDecorator(255);
export const IsLongText = createTextDecorator(1000);

// 2. Decorator kiểm tra bắt buộc nhập (IsNotEmpty)
export function Required(label = 'Trường này', validationOptions?: ValidationOptions) {
  return IsNotEmpty({
    message: `${label} không được để trống.`,
    ...validationOptions,
  });
}

// 3. Decorator kiểm tra số (Tự động convert kiểu dữ liệu, báo lỗi tiếng Việt)
export function IsNumberField(label = 'Trường này', validationOptions?: ValidationOptions) {
  return (target: object, propertyKey: string) => {
    Type(() => Number)(target, propertyKey);
    IsNumber({}, {
      message: `${label} phải là số.`,
      ...validationOptions,
    })(target, propertyKey);
  };
}

// 4. Decorator kiểm tra ngày (Đúng định dạng ngày YYYY-MM-DD)
export function IsDateField(label = 'Trường này', validationOptions?: ValidationOptions) {
  return IsDateString({}, {
    message: `${label} phải đúng định dạng ngày (YYYY-MM-DD).`,
    ...validationOptions,
  });
}

// 5. Decorator kiểm tra email
export function IsEmailField(label = 'Email', validationOptions?: ValidationOptions) {
  return IsEmail({}, {
    message: `${label} phải là địa chỉ email hợp lệ.`,
    ...validationOptions,
  });
}

// 6. Decorator kiểm tra số nguyên (Integer)
export function IsIntField(label = 'Trường này', validationOptions?: ValidationOptions) {
  return (target: object, propertyKey: string) => {
    Type(() => Number)(target, propertyKey);
    IsInt({
      message: `${label} phải là số nguyên.`,
      ...validationOptions,
    })(target, propertyKey);
  };
}

// 7. Decorator kiểm tra kiểu Boolean
export function IsBooleanField(label = 'Trường này', validationOptions?: ValidationOptions) {
  return (target: object, propertyKey: string) => {
    Type(() => Boolean)(target, propertyKey);
    IsBoolean({
      message: `${label} phải là kiểu logic (true/false).`,
      ...validationOptions,
    })(target, propertyKey);
  };
}

// 8. Decorator kiểm tra mảng (Array)
export function IsArrayField(label = 'Trường này', validationOptions?: ValidationOptions) {
  return IsArray({
    message: `${label} phải là một danh sách.`,
    ...validationOptions,
  });
}

// 9. Decorator kiểm tra danh mục Enum
export function IsEnumField(
  entityEnum: object,
  label = 'Trường này',
  validationOptions?: ValidationOptions,
) {
  return IsEnum(entityEnum, {
    message: `${label} không hợp lệ hoặc không nằm trong danh sách cho phép.`,
    ...validationOptions,
  });
}

// 10. Decorator kiểm tra mật khẩu mạnh (tối thiểu 8 ký tự, 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt)
export function IsPasswordField(label = 'Mật khẩu', validationOptions?: ValidationOptions) {
  return (target: object, propertyKey: string) => {
    IsNotEmpty({
      message: `${label} không được để trống.`,
      ...validationOptions,
    })(target, propertyKey);

    MinLength(8, {
      message: `${label} phải có tối thiểu 8 ký tự.`,
      ...validationOptions,
    })(target, propertyKey);

    Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
      message: `${label} phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.`,
      ...validationOptions,
    })(target, propertyKey);
  };
}
