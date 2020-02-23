export enum ValidatorType {
  integer = 'integer',
  integerUnlimited = 'integer or infinity',
  iteratorCallback = 'iterator callback',
  boolean = 'boolean'
}

export interface ValidatedValue {
  value: any;
  isValid: boolean;
  errors: string[];
}

const getNumber = (value: any): number =>
  value === '' || value === null ? NaN : Number(value);

const validateOne = (
  { value, isValid, errors }: ValidatedValue, validator: ValidatorType
): ValidatedValue => {
  let parsedValue = value;
  let error = '';
  if (validator === ValidatorType.integer) {
    value = getNumber(value);
    parsedValue = parseInt(value, 10);
    if (value !== parsedValue) {
      error = 'it must be an integer';
    }
  }
  if (validator === ValidatorType.integerUnlimited) {
    value = getNumber(value);
    if (value === Infinity || value === -Infinity) {
      parsedValue = value;
    } else {
      parsedValue = parseInt(value, 10);
    }
    if (value !== parsedValue) {
      error = 'it must be an integer or +/- Infinity';
    }
  }
  if (validator === ValidatorType.iteratorCallback) {
    if (typeof value !== 'function') {
      error = 'it must be an iterator callback function';
    }
    if ((<Function>value).length !== 1) {
      error = 'it must have 1 argument';
    }
    parsedValue = value;
  }
  if (validator === ValidatorType.boolean) {
    parsedValue = !!value;
  }
  return {
    value: parsedValue,
    isValid: isValid && !error,
    errors: [...errors, ...(error ? [error] : [])]
  };
};

export const validate = (value: any, validators: ValidatorType[]): ValidatedValue =>
  validators.reduce((acc, validator) => ({
    ...acc,
    ...validateOne(acc, validator)
  }), <ValidatedValue>{
    value,
    isValid: true,
    errors: []
  });
