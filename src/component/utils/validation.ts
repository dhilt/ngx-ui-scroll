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
    errors.push('it must have 1 argument');
  }
  return { value, isValid: !errors.length, errors };
};

const onThisOrThat = (token: string) => (value: any, context: any): ValidatedValue => {
  const errors = [];
  if (typeof context !== 'object' || typeof token !== 'string') {
    errors.push(`context and token must be passed`);
  } else if (context.hasOwnProperty(token)) {
    errors.push(`only this or "${token}" must be present`);
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
  THIS_OR_THAT: (params: any): IValidator => ({
    type: ValidatorType.thisOrThat,
    method: onThisOrThat(params)
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
