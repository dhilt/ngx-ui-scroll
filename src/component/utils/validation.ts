import { ValidatorType, IValidator, ValidatedValue } from '../interfaces/validation';

const getNumber = (value: any): number =>
  value === '' || value === null ? NaN : Number(value);

const onInteger = (value: any): ValidatedValue => {
  let parsedValue = value;
  const errors = [];
  value = getNumber(value);
  parsedValue = parseInt(value, 10);
  if (value !== parsedValue) {
    errors.push('it must be an integer');
  }
  return { value: parsedValue, isValid: !errors.length, errors };
};

const onIntegerUnlimited = (value: any): ValidatedValue => {
  let parsedValue = value;
  const errors = [];
  value = getNumber(value);
  if (value === Infinity || value === -Infinity) {
    parsedValue = value;
  } else {
    parsedValue = parseInt(value, 10);
  }
  if (value !== parsedValue) {
    errors.push('it must be an integer or +/- Infinity');
  }
  return { value: parsedValue, isValid: !errors.length, errors };
};

const onBoolean = (value: any): ValidatedValue => {
  return { value: !!value, isValid: true, errors: [] };
};

const onIteratorCallback = (value: any): ValidatedValue => {
  const errors = [];
  if (typeof value !== 'function') {
    errors.push('it must be an iterator callback function');
  } else if ((<Function>value).length !== 1) {
    errors.push('it must be an iterator callback function with 1 argument');
  }
  return { value, isValid: !errors.length, errors };
};

const onOneOf = (tokens: string[]) => (value: any, context: any): ValidatedValue => {
  const errors = [];
  if (typeof context !== 'object' || !Array.isArray(tokens) || !tokens.length) {
    errors.push(`context and token list must be passed`);
  } else {
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (typeof tokens[i] !== 'string') {
        errors.push(`token list must be an array of strings`);
      } else if (context.hasOwnProperty(tokens[i])) {
        errors.push(`must not be present with "${tokens[i]}"`);
      }
    }
  }
  return { value, isValid: !errors.length, errors };
};

export const VALIDATORS = {
  INTEGER: <IValidator>{
    type: ValidatorType.integer,
    method: onInteger
  },
  INTEGER_UNLIMITED: <IValidator>{
    type: ValidatorType.integerUnlimited,
    method: onIntegerUnlimited
  },
  BOOLEAN: <IValidator>{
    type: ValidatorType.boolean,
    method: onBoolean
  },
  ITERATOR_CALLBACK: <IValidator>{
    type: ValidatorType.iteratorCallback,
    method: onIteratorCallback
  },
  ONE_OF: (list: string[]): IValidator => ({
    type: ValidatorType.oneOf,
    method: onOneOf(list)
  }),
};

export const validateOne = (
  { value, isValid, errors }: ValidatedValue,
  { type, method }: IValidator,
  context?: any
): ValidatedValue => {
  const result = method(value, context);
  const _errors = [...errors, ...result.errors];
  return {
    value: result.value,
    isValid: !_errors.length,
    errors: _errors
  };
};

export const validate = (
  value: any, validators: IValidator[], context?: Object
): ValidatedValue =>
  validators.reduce((acc, validator) => ({
    ...acc,
    ...validateOne(acc, validator, context)
  }), <ValidatedValue>{
    value,
    isValid: true,
    errors: []
  });
