export enum ValidatorType {
  integer = 'integer',
  integerUnlimited = 'integer or infinity',
  iteratorCallback = 'iterator callback',
  boolean = 'boolean',
  thisOrThat = 'only one should be present',
}

type ValidatorMethod = (value: any, context?: any) => ValidatedValue

export interface ValidatedValue {
  value: any;
  isValid: boolean;
  errors: string[];
}

export interface IValidator {
  type: ValidatorType;
  method: ValidatorMethod;
}
