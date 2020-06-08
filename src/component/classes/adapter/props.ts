import { BehaviorSubject, Subject } from 'rxjs';

import { AdapterPropType as Prop, IAdapterProp } from '../../interfaces/index';

const noop = () => null;

export const ADAPTER_PROPS = (nullItem: any): IAdapterProp[] => [
  {
    type: Prop.Scalar,
    name: 'id',
    value: 0,
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
    permanent: true
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
    type: Prop.WorkflowRunner,
    name: 'reset',
    value: noop
  },
  {
    type: Prop.WorkflowRunner,
    name: 'reload',
    value: noop
  },
  {
    type: Prop.WorkflowRunner,
    name: 'append',
    value: noop
  },
  {
    type: Prop.WorkflowRunner,
    name: 'prepend',
    value: noop
  },
  {
    type: Prop.WorkflowRunner,
    name: 'check',
    value: noop
  },
  {
    type: Prop.WorkflowRunner,
    name: 'remove',
    value: noop
  },
  {
    type: Prop.WorkflowRunner,
    name: 'clip',
    value: noop
  },
  {
    type: Prop.WorkflowRunner,
    name: 'insert',
    value: noop
  },
  {
    type: Prop.WorkflowRunner,
    name: 'fix',
    value: noop
  },
  {
    type: Prop.Function,
    name: 'relax',
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
