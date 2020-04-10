import { BehaviorSubject, Subject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { VALIDATORS } from './validation';
import {
  AdapterPropType as Prop,
  IAdapterProp,
  IAdapter,
  IAdapterMethodParam,
  IAdapterMethodParams,
  IAdapterMethods
} from '../interfaces/index';

const noop = () => null;

export const ADAPTER_PROPS = (nullItem: any): IAdapterProp[] => [
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
    value: nullItem,
    observable: 'firstVisible$',
    wanted: true
  },
  {
    type: Prop.Scalar,
    name: 'lastVisible',
    value: nullItem,
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
    value: new BehaviorSubject<any>(nullItem)
  },
  {
    type: Prop.Observable,
    name: 'lastVisible$',
    value: new BehaviorSubject<any>(nullItem)
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
  'scrollPosition': {
    validators: [INTEGER_UNLIMITED]
  },
  'minIndex': {
    validators: [INTEGER_UNLIMITED]
  },
  'maxIndex': {
    validators: [INTEGER_UNLIMITED]
  },
  'updater': {
    validators: [FUNC_WITH_X_ARGUMENTS(1)]
  }
};

const INSERT_METHOD_PARAMS: IAdapterMethodParams = {
  'items': {
    validators: [MANDATORY, ITEM_LIST]
  },
  'before': {
    validators: [FUNC_WITH_X_ARGUMENTS(1), ONE_OF_MUST(['after'])]
  },
  'after': {
    validators: [FUNC_WITH_X_ARGUMENTS(1), ONE_OF_MUST(['before'])]
  },
  'decrease': {
    validators: [BOOLEAN]
  }
};

const RESET_METHOD_PARAMS: IAdapterMethodParams = {
  'get': {
    validators: [FUNC_WITH_X_AND_MORE_ARGUMENTS(2)]
  },
  'settings': {
    validators: [OBJECT]
  },
  'devSettings': {
    validators: [OBJECT]
  }
};

export const ADAPTER_METHODS_PARAMS: IAdapterMethods = {
  FIX: FIX_METHOD_PARAMS,
  INSERT: INSERT_METHOD_PARAMS,
  RESET: RESET_METHOD_PARAMS,
};
