export enum InputValueType {
  integer = 'integer',
  integerUnlimited = 'integer or infinity',
  iteratorCallback = 'iterator callback',
  boolean = 'boolean'
}

export interface ValidatedValue {
  value: any;
  type: InputValueType;
  isValid: boolean;
  error: string;
}

const getNumber = (value: any): number =>
  value === '' || value === null ? NaN : Number(value);

export const validate = (value: any, type: InputValueType): ValidatedValue => {
  let parsedValue = value;
  let error = '';
  if (type === InputValueType.integer) {
    value = getNumber(value);
    parsedValue = parseInt(value, 10);
    if (value !== parsedValue) {
      error = 'it must be an integer';
    }
  }
  if (type === InputValueType.integerUnlimited) {
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
  if (type === InputValueType.iteratorCallback) {
    if (typeof value !== 'function') {
      error = 'it must be an iterator callback function';
    }
    if ((<Function>value).length !== 1) {
      error = 'it must have 1 argument';
    }
    parsedValue = value;
  }
  if (type === InputValueType.boolean) {
    parsedValue = !!value;
  }
  return {
    value: parsedValue,
    type,
    isValid: !error,
    error
  };
};
