import { BehaviorSubject, Subject } from 'rxjs';

import { Reactive } from '../reactive';
import {
  AdapterPropName as Name, AdapterPropType as Type, IAdapterProp, IBufferInfo
} from '../../interfaces/index';

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
    type: Type.Scalar,
    name: Name.id,
    value: 0,
    permanent: true
  },
  {
    type: Type.Scalar,
    name: Name.mock,
    value: true,
    permanent: true
  },
  {
    type: Type.Scalar,
    name: Name.version,
    value: '',
    permanent: true
  },
  {
    type: Type.Scalar,
    name: Name.isLoading,
    value: false,
    reactive: Name.isLoading$
  },
  {
    type: Type.Scalar,
    name: Name.loopPending,
    value: false,
    reactive: Name.loopPending$
  },
  {
    type: Type.Scalar,
    name: Name.firstVisible,
    value: nullItem,
    reactive: Name.firstVisible$,
    wanted: true
  },
  {
    type: Type.Scalar,
    name: Name.lastVisible,
    value: nullItem,
    reactive: Name.lastVisible$,
    wanted: true
  },
  {
    type: Type.Scalar,
    name: Name.bof,
    value: false,
    reactive: Name.bof$
  },
  {
    type: Type.Scalar,
    name: Name.eof,
    value: false,
    reactive: Name.eof$
  },
  {
    type: Type.Scalar,
    name: Name.itemsCount,
    value: 0,
    onDemand: true
  },
  {
    type: Type.Scalar,
    name: Name.bufferInfo,
    value: bufferInfoDefault,
    onDemand: true
  },
  {
    type: Type.WorkflowRunner,
    name: Name.reset,
    value: noop
  },
  {
    type: Type.WorkflowRunner,
    name: Name.reload,
    value: noop
  },
  {
    type: Type.WorkflowRunner,
    name: Name.append,
    value: noop
  },
  {
    type: Type.WorkflowRunner,
    name: Name.prepend,
    value: noop
  },
  {
    type: Type.WorkflowRunner,
    name: Name.check,
    value: noop
  },
  {
    type: Type.WorkflowRunner,
    name: Name.remove,
    value: noop
  },
  {
    type: Type.WorkflowRunner,
    name: Name.clip,
    value: noop
  },
  {
    type: Type.WorkflowRunner,
    name: Name.insert,
    value: noop
  },
  {
    type: Type.WorkflowRunner,
    name: Name.replace,
    value: noop
  },
  {
    type: Type.WorkflowRunner,
    name: Name.fix,
    value: noop
  },
  {
    type: Type.Function,
    name: Name.relax,
    value: noop
  },
  {
    type: Type.Function,
    name: Name.showLog,
    value: noop
  },
  {
    type: Type.Reactive,
    name: Name.isLoading$,
    // value: new Subject<boolean>()
    value: new Reactive<boolean>()
  },
  {
    type: Type.Reactive,
    name: Name.loopPending$,
    value: new Subject<boolean>()
  },
  {
    type: Type.Reactive,
    name: Name.firstVisible$,
    value: new BehaviorSubject<any>(nullItem)
  },
  {
    type: Type.Reactive,
    name: Name.lastVisible$,
    value: new BehaviorSubject<any>(nullItem)
  },
  {
    type: Type.Reactive,
    name: Name.bof$,
    value: new Subject<boolean>()
  },
  {
    type: Type.Reactive,
    name: Name.eof$,
    value: new Subject<boolean>()
  }
];
