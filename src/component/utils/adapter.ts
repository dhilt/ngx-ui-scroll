import { BehaviorSubject, Subject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { VALIDATORS } from './validation';
import {
  AdapterPropType as Prop,
  IAdapterProp,
  ItemAdapter,
  IAdapter,
  IAdapterMethodParam,
  IAdapterMethodParams,
  IAdapterMethods
} from '../interfaces/index';

export const itemAdapterEmpty = <ItemAdapter>{
  data: {},
  element: {}
};

const noop = () => null;

export const ADAPTER_PROPS = (): IAdapterProp[] => [
  {
    type: Prop.Scalar,
    name: 'id',
    value: '',
    permanent: true
  },
  {
    type: Prop.Scalar,
    name: 'mock',
    value: true,
    permanent: true
  },
  {
    type: Prop.Scalar,
    name: 'version',
    value: '',
    onDemand: true
  },
  {
    type: Prop.Scalar,
    name: 'isLoading',
    value: false,
    observable: 'isLoading$'
  },
  {
    type: Prop.Scalar,
    name: 'loopPending',
    value: false,
    observable: 'loopPending$'
  },
  {
    type: Prop.Scalar,
    name: 'cyclePending',
    value: false,
    observable: 'cyclePending$'
  },
  {
    type: Prop.Scalar,
    name: 'firstVisible',
    value: itemAdapterEmpty,
    observable: 'firstVisible$',
    wanted: true
  },
  {
    type: Prop.Scalar,
    name: 'lastVisible',
    value: itemAdapterEmpty,
    observable: 'lastVisible$',
    wanted: true
  },
  {
    type: Prop.Scalar,
    name: 'bof',
    value: false,
    observable: 'bof$'
  },
  {
    type: Prop.Scalar,
    name: 'eof',
    value: false,
    observable: 'eof$'
  },
  {
    type: Prop.Scalar,
    name: 'itemsCount',
    value: 0,
    onDemand: true
  },
  {
    type: Prop.Function,
    name: 'reset',
    value: noop
  },
  {
    type: Prop.Function,
    name: 'reload',
    value: noop
  },
  {
    type: Prop.Function,
    name: 'append',
    value: noop
  },
  {
    type: Prop.Function,
    name: 'prepend',
    value: noop
  },
  {
    type: Prop.Function,
    name: 'check',
    value: noop
  },
  {
    type: Prop.Function,
    name: 'remove',
    value: noop
  },
  {
    type: Prop.Function,
    name: 'clip',
    value: noop
  },
  {
    type: Prop.Function,
    name: 'insert',
    value: noop
  },
  {
    type: Prop.Function,
    name: 'showLog',
    value: noop
  },
  {
    type: Prop.Function,
    name: 'fix',
    value: noop
  },
  {
    type: Prop.Observable,
    name: 'isLoading$',
    value: new Subject<boolean>()
  },
  {
    type: Prop.Observable,
    name: 'loopPending$',
    value: new Subject<boolean>()
  },
  {
    type: Prop.Observable,
    name: 'cyclePending$',
    value: new Subject<boolean>()
  },
  {
    type: Prop.Observable,
    name: 'firstVisible$',
    value: new BehaviorSubject<ItemAdapter>(itemAdapterEmpty)
  },
  {
    type: Prop.Observable,
    name: 'lastVisible$',
    value: new BehaviorSubject<ItemAdapter>(itemAdapterEmpty)
  },
  {
    type: Prop.Observable,
    name: 'bof$',
    value: new Subject<boolean>()
  },
  {
    type: Prop.Observable,
    name: 'eof$',
    value: new Subject<boolean>()
  }
];

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

const FIX_METHOD_PARAMS: IAdapterMethodParams = {
  scrollPosition: {
    name: 'scrollPosition',
    validators: [INTEGER_UNLIMITED]
  },
  minIndex: {
    name: 'minIndex',
    validators: [INTEGER_UNLIMITED]
  },
  maxIndex: {
    name: 'maxIndex',
    validators: [INTEGER_UNLIMITED]
  },
  updater: {
    name: 'updater',
    validators: [FUNC_WITH_X_ARGUMENTS(1)]
  }
};

const INSERT_METHOD_PARAMS: IAdapterMethodParams = {
  items: {
    name: 'items',
    validators: [MANDATORY, ITEM_LIST]
  },
  before: {
    name: 'before',
    validators: [FUNC_WITH_X_ARGUMENTS(1), ONE_OF_MUST(['after'])]
  },
  after: {
    name: 'after',
    validators: [FUNC_WITH_X_ARGUMENTS(1), ONE_OF_MUST(['before'])]
  },
  decrease: {
    name: 'decrease',
    validators: [BOOLEAN]
  }
};

const RESET_METHOD_PARAMS: IAdapterMethodParams = {
  get: {
    name: 'get',
    validators: [FUNC_WITH_X_AND_MORE_ARGUMENTS(2)]
  },
  settings: {
    name: 'settings',
    validators: [OBJECT]
  },
  devSettings: {
    name: 'devSettings',
    validators: [OBJECT]
  }
};

export const ADAPTER_METHODS_PARAMS: IAdapterMethods = {
  FIX: FIX_METHOD_PARAMS,
  INSERT: INSERT_METHOD_PARAMS,
  RESET: RESET_METHOD_PARAMS,
};
