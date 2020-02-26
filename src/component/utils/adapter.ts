import { BehaviorSubject, Subject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import {
  IAdapterProp,
  AdapterPropType as Prop,
  ItemAdapter,
  IAdapter
} from '../interfaces/adapter';

export const itemAdapterEmpty = <ItemAdapter>{
  data: {},
  element: {}
};

export const ADAPTER_PROPS: IAdapterProp[] = [
  {
    type: Prop.Scalar,
    name: 'version',
    value: ''
  },
  {
    type: Prop.Scalar,
    name: 'isLoading',
    value: false
  },
  {
    type: Prop.Scalar,
    name: 'loopPending',
    value: false
  },
  {
    type: Prop.Scalar,
    name: 'cyclePending',
    value: false
  },
  {
    type: Prop.Scalar,
    name: 'firstVisible',
    value: itemAdapterEmpty
  },
  {
    type: Prop.Scalar,
    name: 'lastVisible',
    value: itemAdapterEmpty
  },
  {
    type: Prop.Scalar,
    name: 'itemsCount',
    value: 0
  },
  {
    type: Prop.Scalar,
    name: 'bof',
    value: false
  },
  {
    type: Prop.Scalar,
    name: 'eof',
    value: false
  },
  {
    type: Prop.Function,
    name: 'reload',
    value: () => null
  },
  {
    type: Prop.Function,
    name: 'append',
    value: () => null
  },
  {
    type: Prop.Function,
    name: 'prepend',
    value: () => null
  },
  {
    type: Prop.Function,
    name: 'check',
    value: () => null
  },
  {
    type: Prop.Function,
    name: 'remove',
    value: () => null
  },
  {
    type: Prop.Function,
    name: 'clip',
    value: () => null
  },
  {
    type: Prop.Function,
    name: 'showLog',
    value: () => null
  },
  {
    type: Prop.Function,
    name: 'fix',
    value: () => null
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
