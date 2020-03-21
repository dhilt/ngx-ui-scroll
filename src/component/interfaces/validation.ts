export enum ValidatorType {
  mandatory = 'must be present',
  integer = 'must be an integer',
  integerUnlimited = 'must be an integer or infinity',
  itemList = 'must be an array of items',
  boolean = 'must be a boolean',
  object = 'must be an object',
  function = 'must be a function',
  funcOfxArguments = 'must have arg1 arguments',
  funcOfxAndMoreArguments = 'must have at least arg1 arguments',
  oneOfCan = 'can be present only if none of arg1 list is present',
  oneOfMust = 'must be present if none of arg1 list is present',
}

type ValidatorMethod = (value: any, context?: any) => ValidatedValue;

export interface ValidatedValue {
  value: any;
  isSet: boolean;
  isValid: boolean;
  errors: string[];
}

export interface IValidator {
  type: ValidatorType;
  method: ValidatorMethod;
}
