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

interface IsExistConstraintInput {
  model: string;
  field?: string;
  name?: string;
}

@ValidatorConstraint({ name: 'IsExistConstraint', async: true })
@Injectable()
export class IsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) { }

  async validate(value: unknown, args: ValidationArguments) {
    if (value === undefined || value === null || value === '') return true;

    const [input] = args.constraints as [IsExistConstraintInput];
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

    const record = await dbModel.findFirst({
      where: {
        [fieldName]: value,
      },
    });

    return !!record;
  }

  defaultMessage(args: ValidationArguments) {
    const [input] = args.constraints as [IsExistConstraintInput];
    const displayName = input.name || args.property;
    return `${displayName} không tồn tại trong hệ thống.`;
  }
}

export function IsExist(
  input: IsExistConstraintInput,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [input],
      validator: IsExistConstraint,
    });
  };
}
