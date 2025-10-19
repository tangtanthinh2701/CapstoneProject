import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function Match(property: string, validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'Match',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: string | number, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];

          const relatedValue = (args.object as Record<string, string | number>)[
            relatedPropertyName
          ];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          return `${args.property} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}
