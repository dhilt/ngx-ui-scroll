export enum ValidatorType {
  mandatory = 'must be present',
  number = 'must be a number',
  integer = 'must be an integer',
  integerUnlimited = 'must be an integer or infinity',
  moreOrEqual = 'must be a number greater than (or equal to) arg1',
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

export interface ICommonProp {
  validators: IValidator[];
  defaultValue?: any;
  fallback?: boolean; // if true, invalid prop value will be set to default
}

export type ICommonProps<T extends PropertyKey> = {
  [key in T]: ICommonProp;
};

export type IValidatedCommonProps<T extends PropertyKey> = {
  [key in T]: ValidatedValue;
};

export interface IValidatedData {
  isValid: boolean;
  errors: string[];
  params: IValidatedCommonProps<any>;
  showErrors: Function;
}
