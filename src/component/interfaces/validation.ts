export enum ValidatorType {
  mandatory = 'must be present',
  integer = 'must be integer',
  integerUnlimited = 'must be integer or infinity',
  iteratorCallback = 'must be iterator callback',
  boolean = 'must be boolean',
  oneOfCan = 'can be present only if none of arg1 list is present',
  oneOfMust = 'must be present if none of arg1 list is present',
}

type ValidatorMethod = (value: any, context?: any) => ValidatedValue;

export interface ValidatedValue {
  value: any;
  isValid: boolean;
  errors: string[];
}

export interface IValidator {
  type: ValidatorType;
  method: ValidatorMethod;
}
