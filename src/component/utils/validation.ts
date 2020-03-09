import {
  ValidatorType,
  IValidator,
  ValidatedValue,
  IAdapterMethodParams,
  IAdapterValidatedMethodData,
  IAdapterValidatedMethodParams
} from '../interfaces/index';

const getNumber = (value: any): number =>
  value === '' || value === null ? NaN : Number(value);

const onMandatory = (value: any): ValidatedValue => {
  const isValid = typeof value !== 'undefined';
  return { value: value, isSet: false, isValid, errors: isValid ? [] : [
    'must be present'
  ] };
};

const onInteger = (value: any): ValidatedValue => {
  let parsedValue = value;
  const errors = [];
  value = getNumber(value);
  parsedValue = parseInt(value, 10);
  if (value !== parsedValue) {
    errors.push('must be an integer');
  }
  return { value: parsedValue, isSet: true, isValid: !errors.length, errors };
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
    errors.push('must be an integer or +/- Infinity');
  }
  return { value: parsedValue, isSet: true, isValid: !errors.length, errors };
};

const onBoolean = (value: any): ValidatedValue => {
  return { value: !!value, isSet: true, isValid: true, errors: [] };
};

const onItemList = (value: any): ValidatedValue => {
  let parsedValue = value;
  const errors = [];
  if (!Array.isArray(value)) {
    errors.push('must be an array');
    parsedValue = [];
  } else if (!value.length) {
    errors.push('must be an array with at least 1 item');
  } else if (value.length > 1) {
    const type = typeof value[0];
    if (value.some((v: any) => typeof v !== type)) {
      errors.push('must be an array of items of the same type');
    }
  }
  return { value: parsedValue, isSet: true, isValid: !errors.length, errors };
};

const onIteratorCallback = (value: any): ValidatedValue => {
  const errors = [];
  if (typeof value !== 'function') {
    errors.push('must be an iterator callback function');
  } else if ((<Function>value).length !== 1) {
    errors.push('must be an iterator callback function with 1 argument');
  }
  return { value, isSet: true, isValid: !errors.length, errors };
};

const onOneOf = (tokens: string[], must: boolean) => (value: any, context: any): ValidatedValue => {
  const errors = [];
  const isSet = typeof value !== 'undefined';
  let noOneIsPresent = !isSet;
  if (!Array.isArray(tokens) || !tokens.length) {
    errors.push(`token list must be passed`);
  } else {
    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i];
      if (typeof token !== 'string') {
        errors.push(`token list must be an array of strings`);
        break;
      }
      const isAnotherPresent = context.hasOwnProperty(token);
      if (isSet && isAnotherPresent) {
        errors.push(`must not be present with "${token}"`);
        break;
      }
      if (noOneIsPresent && isAnotherPresent) {
        noOneIsPresent = false;
      }
    }
    if (must && noOneIsPresent) {
      errors.push(`must be present (or "${tokens.join('", "')}" must be present)`);
    }
  }
  return { value, isSet, isValid: !errors.length, errors };
};

export const VALIDATORS = {
  MANDATORY: <IValidator>{
    type: ValidatorType.mandatory,
    method: onMandatory
  },
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
  ITEM_LIST: <IValidator>{
    type: ValidatorType.itemList,
    method: onItemList
  },
  ITERATOR_CALLBACK: <IValidator>{
    type: ValidatorType.iteratorCallback,
    method: onIteratorCallback
  },
  ONE_OF_CAN: (list: string[]): IValidator => ({
    type: ValidatorType.oneOfCan,
    method: onOneOf(list, false)
  }),
  ONE_OF_MUST: (params: any): IValidator => ({
    type: ValidatorType.oneOfMust,
    method: onOneOf(params, true)
  }),
};

export class AdapterValidatedMethodData implements IAdapterValidatedMethodData {
  private context: any;
  private commonErrors: string[];

  isValid: boolean;
  errors: string[];
  params: IAdapterValidatedMethodParams;

  constructor(context: any) {
    this.context = context;
    this.commonErrors = [];
    this.isValid = true;
    this.errors = [];
    this.params = <IAdapterValidatedMethodParams>{};
    this.checkContext();
  }

  private checkContext() {
    if (!this.context || typeof this.context !== 'object') {
      this.setCommonError(`context is not an object`);
    }
  }

  private setValidity() {
    this.errors = Object.keys(this.params).reduce((acc: string[], key: string) => [
      ...acc, ...this.params[key].errors
    ], this.commonErrors);
    this.isValid = !this.errors.length;
  }

  setCommonError(error: string) {
    this.commonErrors.push(error);
    this.errors.push(error);
    this.isValid = false;
  }

  setParam(token: string, value: ValidatedValue) {
    if (!value.isValid) {
      value.errors = value.errors.map((err: string) =>
        `"${token}" ${err}`
      );
    }
    this.params[token] = value;
    this.setValidity();
  }
}

const shouldSkip = ({ type }: IValidator, value: any) =>
  type !== ValidatorType.mandatory &&
  type !== ValidatorType.oneOfMust &&
  typeof value === 'undefined';

export const runValidator = (
  current: ValidatedValue,
  validator: IValidator,
  context?: any
): ValidatedValue => {
  const { value, errors } = current;
  if (shouldSkip(validator, value)) {
    return { ...current, isSet: false };
  }
  const result = validator.method(value, context);
  const _errors = [...errors, ...result.errors];
  return {
    value: result.value,
    isSet: result.isSet,
    isValid: !_errors.length,
    errors: _errors
  };
};

export const validateOne = (
  context: any, name: string, validators: IValidator[]
): ValidatedValue =>
  validators.reduce((acc, validator) => ({
    ...acc,
    ...runValidator(acc, validator, context)
  }), <ValidatedValue>{
    value: context[name],
    isSet: false,
    isValid: true,
    errors: []
  });

export const validate = (
  context: any, params: IAdapterMethodParams
): IAdapterValidatedMethodData => {
  const data = new AdapterValidatedMethodData(context);
  if (!data.isValid) {
    return data;
  }
  Object.keys(params).forEach((key: string) => {
    const { name, validators } = params[key];
    const parsed = validateOne(context, name, validators);
    data.setParam(name, parsed);
  });
  return data;
};
