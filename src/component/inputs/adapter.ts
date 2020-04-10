import { VALIDATORS } from './validation';
import { DatasourceProps } from './datasource';
import { ICommonProps } from '../interfaces/index';

const {
  MANDATORY,
  INTEGER_UNLIMITED,
  BOOLEAN,
  OBJECT,
  ITEM_LIST,
  FUNC_WITH_X_ARGUMENTS,
  FUNC_WITH_X_AND_MORE_ARGUMENTS,
  ONE_OF_MUST,
} = VALIDATORS;

export enum AdapterFixParams {
  scrollPosition = 'scrollPosition',
  minIndex = 'minIndex',
  maxIndex = 'maxIndex',
  updater = 'updater',
}

const FIX_METHOD_PARAMS: ICommonProps<AdapterFixParams> = {
  [AdapterFixParams.scrollPosition]: {
    validators: [INTEGER_UNLIMITED]
  },
  [AdapterFixParams.minIndex]: {
    validators: [INTEGER_UNLIMITED]
  },
  [AdapterFixParams.maxIndex]: {
    validators: [INTEGER_UNLIMITED]
  },
  [AdapterFixParams.updater]: {
    validators: [FUNC_WITH_X_ARGUMENTS(1)]
  }
};

enum AdapterInsertParams {
  items = 'items',
  before = 'before',
  after = 'after',
  decrease = 'decrease',
}

const INSERT_METHOD_PARAMS: ICommonProps<AdapterInsertParams> = {
  [AdapterInsertParams.items]: {
    validators: [MANDATORY, ITEM_LIST]
  },
  [AdapterInsertParams.before]: {
    validators: [FUNC_WITH_X_ARGUMENTS(1), ONE_OF_MUST([AdapterInsertParams.after])]
  },
  [AdapterInsertParams.after]: {
    validators: [FUNC_WITH_X_ARGUMENTS(1), ONE_OF_MUST([AdapterInsertParams.before])]
  },
  [AdapterInsertParams.decrease]: {
    validators: [BOOLEAN]
  }
};

const RESET_METHOD_PARAMS: ICommonProps<DatasourceProps> = {
  [DatasourceProps.get]: {
    validators: [FUNC_WITH_X_AND_MORE_ARGUMENTS(2)]
  },
  [DatasourceProps.settings]: {
    validators: [OBJECT]
  },
  [DatasourceProps.devSettings]: {
    validators: [OBJECT]
  }
};

interface IAdapterMethods {
  [key: string]: ICommonProps<any>;
}

export const ADAPTER_METHODS: IAdapterMethods = {
  FIX: FIX_METHOD_PARAMS,
  INSERT: INSERT_METHOD_PARAMS,
  RESET: RESET_METHOD_PARAMS,
};
