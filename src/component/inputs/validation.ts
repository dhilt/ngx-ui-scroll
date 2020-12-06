import {
  ValidatorType,
  IValidator,
  ValidatedValue,
  IValidatedData,
  IValidatedCommonProps,
  ICommonProps,
  ICommonProp,
} from '../interfaces/index';

const getNumber = (value: any): number =>
  typeof value === 'number' || (typeof value === 'string' && value !== '')
    ? Number(value)
    : NaN;

const onNumber = (value: any): ValidatedValue => {
  const parsedValue = getNumber(value);
  const errors = [];
  if (Number.isNaN(parsedValue)) {
    errors.push('must be a number');
  }
  return { value: parsedValue, isSet: true, isValid: !errors.length, errors };
};

const onInteger = (value: any): ValidatedValue => {
  const errors = [];
  value = getNumber(value);
  const parsedValue = parseInt(value, 10);
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

const onMoreOrEqual = (limit: number, fallback?: boolean) => (value: any): ValidatedValue => {
  const result = onNumber(value);
  if (!result.isValid) {
    return result;
  }
  value = result.value;
  const errors = [];
  if (value < limit) {
    if (!fallback) {
      errors.push(`must be greater than ${limit}`);
    } else {
      value = limit;
    }
  }
  return { value, isSet: true, isValid: !errors.length, errors };
};

const onBoolean = (value: any): ValidatedValue => {
  const errors = [];
  let parsedValue = value;
  if (value === 'true') {
    parsedValue = true;
  } else if (value === 'false') {
    parsedValue = false;
  }
  if (typeof parsedValue !== 'boolean') {
    errors.push('must be a boolean');
  }
  return { value: parsedValue, isSet: true, isValid: !errors.length, errors };
};

const onObject = (value: any): ValidatedValue => {
  const errors = [];
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    errors.push('must be an object');
  }
  return { value, isSet: true, isValid: !errors.length, errors };
};

const onHtmlElement = (value: any): ValidatedValue => {
  const errors = [];
  if (!(value instanceof Element) && !(value instanceof HTMLDocument)) {
    errors.push('must be an html element');
  }
  return { value, isSet: true, isValid: !errors.length, errors };
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

const onFunction = (value: any): ValidatedValue => {
  const errors = [];
  if (typeof value !== 'function') {
    errors.push('must be a function');
  }
  return { value, isSet: true, isValid: !errors.length, errors };
};

const onFunctionWithXArguments = (argsCount: number) => (value: any): ValidatedValue => {
  const result = onFunction(value);
  if (!result.isValid) {
    return result;
  }
  value = result.value;
  const errors = [];
  if ((value as Function).length !== argsCount) {
    errors.push(`must have ${argsCount} argument` + (argsCount > 1 ? 's' : ''));
  }
  return { value, isSet: true, isValid: !errors.length, errors };
};

const onFunctionWithXAndMoreArguments = (argsCount: number) => (value: any): ValidatedValue => {
  const result = onFunction(value);
  if (!result.isValid) {
    return result;
  }
  value = result.value;
  const errors = [];
  if ((value as Function).length < argsCount) {
    errors.push(`must have at least ${argsCount} argument` + (argsCount > 1 ? 's' : ''));
  }
  return { value, isSet: true, isValid: !errors.length, errors };
};

const onOneOf = (tokens: string[], must: boolean) => (value: any, context: any): ValidatedValue => {
  const errors = [];
  const isSet = value !== void 0;
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

const onOr = (validators: IValidator[]) => (value: any): ValidatedValue => {
  const errors = [];
  if (validators.every(validator => !validator.method(value).isValid)) {
    errors.push(validators.map(v => v.type).join(' OR '));
  }
  return { value, isSet: true, isValid: !errors.length, errors };
};

export const VALIDATORS = {
  NUMBER: {
    type: ValidatorType.number,
    method: onNumber
  },
  INTEGER: {
    type: ValidatorType.integer,
    method: onInteger
  },
  INTEGER_UNLIMITED: {
    type: ValidatorType.integerUnlimited,
    method: onIntegerUnlimited
  },
  MORE_OR_EQUAL: (limit: number, fallback?: boolean): IValidator => ({
    type: ValidatorType.moreOrEqual,
    method: onMoreOrEqual(limit, fallback)
  }),
  BOOLEAN: {
    type: ValidatorType.boolean,
    method: onBoolean
  },
  OBJECT: {
    type: ValidatorType.object,
    method: onObject
  },
  ITEM_LIST: {
    type: ValidatorType.itemList,
    method: onItemList
  },
  ELEMENT: {
    type: ValidatorType.element,
    method: onHtmlElement
  },
  FUNC: {
    type: ValidatorType.function,
    method: onFunction
  },
  FUNC_WITH_X_ARGUMENTS: (count: number): IValidator => ({
    type: ValidatorType.funcOfxArguments,
    method: onFunctionWithXArguments(count)
  }),
  FUNC_WITH_X_AND_MORE_ARGUMENTS: (count: number): IValidator => ({
    type: ValidatorType.funcOfxAndMoreArguments,
    method: onFunctionWithXAndMoreArguments(count)
  }),
  ONE_OF_CAN: (list: string[]): IValidator => ({
    type: ValidatorType.oneOfCan,
    method: onOneOf(list, false)
  }),
  ONE_OF_MUST: (list: string[]): IValidator => ({
    type: ValidatorType.oneOfMust,
    method: onOneOf(list, true)
  }),
  OR: (list: IValidator[]): IValidator => ({
    type: ValidatorType.or,
    method: onOr(list)
  }),
};

export class ValidatedData implements IValidatedData {
  private context: any;
  private contextErrors: string[];
  readonly isValidContext: boolean;

  isValid: boolean;
  errors: string[];
  params: IValidatedCommonProps<any>;

  constructor(context: any) {
    this.context = context;
    this.params = {};
    this.contextErrors = [];
    this.errors = [];
    this.isValid = true;
    this.isValidContext = this.checkContext();
  }

  private checkContext(): boolean {
    if (!this.context || Object.prototype.toString.call(this.context) !== '[object Object]') {
      this.setCommonError(`context is not an object`);
      return false;
    }
    return true;
  }

  private setValidity() {
    this.errors = Object.keys(this.params).reduce((acc: string[], key: string) => [
      ...acc, ...this.params[key].errors
    ], []);
    this.isValid = !this.errors.length;
  }

  setCommonError(error: string) {
    this.contextErrors.push(error);
    this.errors.push(error);
    this.isValid = false;
  }

  setParam(token: string, value: ValidatedValue) {
    if (!value.isValid) {
      value.errors = !value.isSet
        ? [`"${token}" must be set`]
        : value.errors.map((err: string) =>
          `"${token}" ${err}`
        );
    }
    this.params[token] = value;
    this.setValidity();
  }

  showErrors(): string {
    return this.errors.length
      ? 'validation failed: ' + this.errors.join(', ')
      : '';
  }
}

export const runValidator = (
  current: ValidatedValue,
  validator: IValidator,
  context: any,
  prop: ICommonProp
): ValidatedValue => {
  const { value, errors } = current;
  const result = validator.method(value, context);
  const _errors = [...errors, ...result.errors];
  return {
    value: result.value,
    isSet: result.isSet,
    isValid: !_errors.length,
    errors: _errors
  };
};

const getDefault = (value: any, prop: ICommonProp): ValidatedValue => {
  const empty = value === void 0;
  const auto = !prop.mandatory && prop.defaultValue !== void 0;
  return {
    value: !empty ? value : (auto ? prop.defaultValue : void 0),
    isSet: !empty || auto,
    isValid: !empty || !prop.mandatory,
    errors: []
  };
};

export const validateOne = (
  context: any, name: string, prop: ICommonProp
): ValidatedValue => {
  const result = getDefault(context[name], prop);
  if (!result.isSet) {
    const oneOfMust = prop.validators.find(v => v.type === ValidatorType.oneOfMust);
    if (oneOfMust) {
      return runValidator(result, oneOfMust, context, prop);
    }
  } else {
    for (const validator of Object.values(prop.validators)) {
      const current = runValidator(result, validator, context, prop);
      if (!current.isValid && prop.defaultValue !== void 0) {
        return {
          value: prop.defaultValue,
          isSet: true,
          isValid: true,
          errors: []
        };
      }
      Object.assign(result, current);
    }
  }
  return result;
};

export const validate = (
  context: any, params: ICommonProps<any>
): IValidatedData => {
  const data = new ValidatedData(context);
  Object.entries(params).forEach(([key, prop]) =>
    data.setParam(key, data.isValidContext
      ? validateOne(context, key, prop)
      : getDefault(void 0, prop)
    )
  );
  return data;
};
