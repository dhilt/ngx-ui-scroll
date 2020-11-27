import { VALIDATORS } from './validation';
import { DatasourceProps } from './datasource';
import { ICommonProps } from '../interfaces/index';

const {
  INTEGER,
  INTEGER_UNLIMITED,
  BOOLEAN,
  OBJECT,
  ITEM_LIST,
  FUNC_WITH_X_ARGUMENTS,
  FUNC_WITH_X_AND_MORE_ARGUMENTS,
  ONE_OF_MUST,
  ONE_OF_CAN,
  OR,
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
  },
};

enum AdapterReloadParams {
  reloadIndex = 'reloadIndex',
}

const RELOAD_METHOD_PARAMS: ICommonProps<AdapterReloadParams> = {
  [AdapterReloadParams.reloadIndex]: {
    validators: [INTEGER]
  },
};

enum AdapterAppendParams {
  items = 'items',
  bof = 'bof',
  eof = 'eof',
}

const APPEND_METHOD_PARAMS: ICommonProps<AdapterAppendParams> = {
  [AdapterAppendParams.items]: {
    validators: [ITEM_LIST],
    mandatory: true
  },
  [AdapterAppendParams.bof]: {
    validators: [BOOLEAN, ONE_OF_CAN([AdapterAppendParams.eof])]
  },
  [AdapterAppendParams.eof]: {
    validators: [BOOLEAN, ONE_OF_CAN([AdapterAppendParams.bof])]
  },
};

enum AdapterRemoveParams {
  predicate = 'predicate',
  indexes = 'indexes',
  increase = 'increase',
}

const REMOVE_METHOD_PARAMS: ICommonProps<AdapterRemoveParams> = {
  [AdapterRemoveParams.predicate]: {
    validators: [FUNC_WITH_X_ARGUMENTS(1), ONE_OF_MUST([AdapterRemoveParams.indexes])]
  },
  [AdapterRemoveParams.indexes]: {
    validators: [ITEM_LIST, ONE_OF_MUST([AdapterRemoveParams.predicate])]
  },
  [AdapterRemoveParams.increase]: {
    validators: [BOOLEAN],
    defaultValue: false
  },
};

enum AdapterClipParams {
  backwardOnly = 'backwardOnly',
  forwardOnly = 'forwardOnly',
}

const CLIP_METHOD_PARAMS: ICommonProps<AdapterClipParams> = {
  [AdapterClipParams.backwardOnly]: {
    validators: [BOOLEAN, ONE_OF_CAN([AdapterClipParams.forwardOnly])],
    defaultValue: false
  },
  [AdapterClipParams.forwardOnly]: {
    validators: [BOOLEAN, ONE_OF_CAN([AdapterClipParams.backwardOnly])],
    defaultValue: false
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
    validators: [ITEM_LIST],
    mandatory: true
  },
  [AdapterInsertParams.before]: {
    validators: [FUNC_WITH_X_ARGUMENTS(1), ONE_OF_MUST([AdapterInsertParams.after])]
  },
  [AdapterInsertParams.after]: {
    validators: [FUNC_WITH_X_ARGUMENTS(1), ONE_OF_MUST([AdapterInsertParams.before])]
  },
  [AdapterInsertParams.decrease]: {
    validators: [BOOLEAN]
  },
};

enum AdapterReplaceParams {
  items = 'items',
  predicate = 'predicate',
}

const REPLACE_METHOD_PARAMS: ICommonProps<AdapterReplaceParams> = {
  [AdapterInsertParams.items]: {
    validators: [ITEM_LIST],
    mandatory: true
  },
  [AdapterReplaceParams.predicate]: {
    validators: [FUNC_WITH_X_ARGUMENTS(1)]
  }
};

enum AdapterFixParams {
  scrollPosition = 'scrollPosition',
  minIndex = 'minIndex',
  maxIndex = 'maxIndex',
  updater = 'updater',
  scrollToItem = 'scrollToItem',
  scrollToItemOpt = 'scrollToItemOpt',
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
  },
  [AdapterFixParams.scrollToItem]: {
    validators: [FUNC_WITH_X_ARGUMENTS(1)]
  },
  [AdapterFixParams.scrollToItemOpt]: {
    validators: [OR([BOOLEAN, OBJECT])]
  },
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
  APPEND: APPEND_METHOD_PARAMS,
  REMOVE: REMOVE_METHOD_PARAMS,
  CLIP: CLIP_METHOD_PARAMS,
  INSERT: INSERT_METHOD_PARAMS,
  REPLACE: REPLACE_METHOD_PARAMS,
  FIX: FIX_METHOD_PARAMS,
};
