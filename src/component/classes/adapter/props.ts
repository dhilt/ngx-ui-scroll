import { BehaviorSubject, Subject } from 'rxjs';

import { AdapterPropType as Prop, IAdapterProp, IBufferInfo } from '../../interfaces/index';

const noop = () => null;

const bufferInfoDefault: IBufferInfo = {
  firstIndex: NaN,
  lastIndex: NaN,
  minIndex: NaN,
  maxIndex: NaN,
  absMinIndex: -Infinity,
  absMaxIndex: +Infinity,
};

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
    reactive: 'isLoading$'
  },
  {
    type: Prop.Scalar,
    name: 'loopPending',
    value: false,
    reactive: 'loopPending$'
  },
  {
    type: Prop.Scalar,
    name: 'firstVisible',
    value: nullItem,
    reactive: 'firstVisible$',
    wanted: true
  },
  {
    type: Prop.Scalar,
    name: 'lastVisible',
    value: nullItem,
    reactive: 'lastVisible$',
    wanted: true
  },
  {
    type: Prop.Scalar,
    name: 'bof',
    value: false,
    reactive: 'bof$'
  },
  {
    type: Prop.Scalar,
    name: 'eof',
    value: false,
    reactive: 'eof$'
  },
  {
    type: Prop.Scalar,
    name: 'itemsCount',
    value: 0,
    onDemand: true
  },
  {
    type: Prop.Scalar,
    name: 'bufferInfo',
    value: bufferInfoDefault,
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
    name: 'replace',
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
    type: Prop.Reactive,
    name: 'isLoading$',
    value: new Subject<boolean>()
  },
  {
    type: Prop.Reactive,
    name: 'loopPending$',
    value: new Subject<boolean>()
  },
  {
    type: Prop.Reactive,
    name: 'firstVisible$',
    value: new BehaviorSubject<any>(nullItem)
  },
  {
    type: Prop.Reactive,
    name: 'lastVisible$',
    value: new BehaviorSubject<any>(nullItem)
  },
  {
    type: Prop.Reactive,
    name: 'bof$',
    value: new Subject<boolean>()
  },
  {
    type: Prop.Reactive,
    name: 'eof$',
    value: new Subject<boolean>()
  }
];
