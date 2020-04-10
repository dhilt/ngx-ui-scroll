import { VALIDATORS } from './validation';
import { DatasourceProps } from './datasource';
import { ICommonProps } from '../interfaces/index';

const {
  MANDATORY,
  INTEGER,
  INTEGER_UNLIMITED,
  BOOLEAN,
  OBJECT,
  ITEM_LIST,
  FUNC_WITH_X_ARGUMENTS,
  FUNC_WITH_X_AND_MORE_ARGUMENTS,
  ONE_OF_MUST,
  ONE_OF_CAN,
} = VALIDATORS;

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

enum AdapterReloadParams {
  reloadIndex = 'reloadIndex',
}

const RELOAD_METHOD_PARAMS: ICommonProps<AdapterReloadParams> = {
  [AdapterReloadParams.reloadIndex]: {
    validators: [INTEGER]
  },
};

enum AdapterRemoveParams {
  predicate = 'predicate',
}

const REMOVE_METHOD_PARAMS: ICommonProps<AdapterRemoveParams> = {
  [AdapterRemoveParams.predicate]: {
    validators: [MANDATORY, FUNC_WITH_X_ARGUMENTS(1)]
  },
};

enum AdapterClipParams {
  backwardOnly = 'backwardOnly',
  forwardOnly = 'forwardOnly',
}

const CLIP_METHOD_PARAMS: ICommonProps<AdapterClipParams> = {
  [AdapterClipParams.backwardOnly]: {
    validators: [BOOLEAN, ONE_OF_CAN([AdapterClipParams.forwardOnly])],
    defaultValue: false,
    fallback: true
  },
  [AdapterClipParams.forwardOnly]: {
    validators: [BOOLEAN, ONE_OF_CAN([AdapterClipParams.backwardOnly])],
    defaultValue: false,
    fallback: true
  },
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

enum AdapterFixParams {
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

export const AdapterMethods = {
  Reset: AdapterInsertParams,
  Reload: AdapterReloadParams,
  Clip: AdapterClipParams,
  Insert: AdapterInsertParams,
  Fix: AdapterFixParams,
};

export const ADAPTER_METHODS = {
  RESET: RESET_METHOD_PARAMS,
  RELOAD: RELOAD_METHOD_PARAMS,
  REMOVE: REMOVE_METHOD_PARAMS,
  CLIP: CLIP_METHOD_PARAMS,
  INSERT: INSERT_METHOD_PARAMS,
  FIX: FIX_METHOD_PARAMS,
};
