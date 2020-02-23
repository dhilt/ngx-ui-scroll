export enum ValidatorType {
  integer = 'integer',
  integerUnlimited = 'integer or infinity',
  iteratorCallback = 'iterator callback',
  boolean = 'boolean',
}

export interface IValidator {
  type: ValidatorType;
  params?: any;
}

export interface ValidatedValue {
  value: any;
  isValid: boolean;
  errors: string[];
}
