import { BehaviorSubject, Subject } from 'rxjs';

import { AdapterPropType as Prop, IAdapterProp } from '../../interfaces/index';

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
    type: Prop.FunctionPromise,
    name: 'reset',
    value: noop
  },
  {
    type: Prop.FunctionPromise,
    name: 'reload',
    value: noop
  },
  {
    type: Prop.FunctionPromise,
    name: 'append',
    value: noop
  },
  {
    type: Prop.FunctionPromise,
    name: 'prepend',
    value: noop
  },
  {
    type: Prop.FunctionPromise,
    name: 'check',
    value: noop
  },
  {
    type: Prop.FunctionPromise,
    name: 'remove',
    value: noop
  },
  {
    type: Prop.FunctionPromise,
    name: 'clip',
    value: noop
  },
  {
    type: Prop.FunctionPromise,
    name: 'insert',
    value: noop
  },
  {
    type: Prop.FunctionPromise,
    name: 'fix',
    value: noop
  },
  {
    type: Prop.Function,
    name: 'showLog',
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
