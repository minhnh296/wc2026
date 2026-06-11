import {
  registerDecorator,
  ValidatorConstraint,
} from 'class-validator';
import type {
  ValidationOptions,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { requestStorage } from '@/shared/utils/request-storage';

interface IsUniqueConstraintInput {
  model: string;
  field?: string;
  name?: string;
}

@ValidatorConstraint({ name: 'IsUniqueConstraint', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) { }

  async validate(value: unknown, args: ValidationArguments) {
    const [input] = args.constraints as [IsUniqueConstraintInput];
    if (!value) return true;

    const modelName = input.model.charAt(0).toLowerCase() + input.model.slice(1);
    const fieldName = input.field || args.property;

    const db = this.prisma as unknown as Record<
      string,
      { findFirst: (args: { where: Record<string, unknown> }) => Promise<unknown> }
    >;
    const dbModel = db[modelName];
    if (!dbModel) {
      return false;
    }

    const request = requestStorage.getStore();
    const idParam = request?.params?.id;

    let excludeId: number | string | undefined = undefined;
    if (typeof idParam === 'string') {
      const parsed = Number.parseInt(idParam, 10);
      excludeId = Number.isNaN(parsed) ? idParam : parsed;
    }

    const record = await dbModel.findFirst({
      where: {
        [fieldName]: value,
        ...(excludeId !== undefined && {
          id: {
            not: excludeId,
          },
        }),
      },
    });

    return !record;
  }

  defaultMessage(args: ValidationArguments) {
    const [input] = args.constraints as [IsUniqueConstraintInput];
    const fieldName = input.name || input.field || args.property;
    return `${fieldName} đã tồn tại trong hệ thống.`;
  }
}

export function IsUnique(
  input: IsUniqueConstraintInput,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [input],
      validator: IsUniqueConstraint,
    });
  };
}
