export enum InputValue {
  integer = 'integer',
  integerUnlimited = 'integer or infinity',
  iteratorCallback = 'iterator callback'
}

export interface ValidatedValue {
  value: any;
  type: InputValue;
  isValid: boolean;
  error: string;
}

export const validate = (value: any, type: InputValue): ValidatedValue => {
  let parsedValue = value;
  let error = '';
  if (type === InputValue.integer) {
    value = value === '' ? NaN : Number(value);
    parsedValue = parseInt(value, 10);
    if (value !== parsedValue) {
      error = 'it must be an integer';
    }
  }
  if (type === InputValue.integerUnlimited) {
    value = value === '' ? NaN : Number(value);
    if (value === Infinity || value === -Infinity) {
      parsedValue = value;
    } else {
      parsedValue = parseInt(value, 10);
    }
    if (value !== parsedValue) {
      error = 'it must be an integer or +/- Infinity';
    }
  }
  if (type === InputValue.iteratorCallback) {
    if (typeof value !== 'function') {
      error = 'it must be an iterator callback function';
    }
    parsedValue = value;
  }
  return {
    value: parsedValue,
    type,
    isValid: !error,
    error
  };
};
