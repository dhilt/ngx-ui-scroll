import { BehaviorSubject, Subject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import {
  IAdapterProp,
  AdapterPropType as Prop,
  ItemAdapter,
  IAdapter
} from '../interfaces/adapter';

export const ADAPTER_PROPS: IAdapterProp[] = [
  { type: Prop.Scalar, name: 'version' },
  { type: Prop.Scalar, name: 'isLoading' },
  { type: Prop.Scalar, name: 'loopPending' },
  { type: Prop.Scalar, name: 'cyclePending' },
  { type: Prop.Scalar, name: 'firstVisible' },
  { type: Prop.Scalar, name: 'lastVisible' },
  { type: Prop.Scalar, name: 'bof' },
  { type: Prop.Scalar, name: 'eof' },
  { type: Prop.Function, name: 'reload' },
  { type: Prop.Function, name: 'append' },
  { type: Prop.Function, name: 'prepend' },
  { type: Prop.Function, name: 'check' },
  { type: Prop.Function, name: 'remove' },
  { type: Prop.Function, name: 'clip' },
  { type: Prop.Function, name: 'showLog' },
  { type: Prop.Function, name: 'fix' },
  { type: Prop.Observable, name: 'isLoading$' },
  { type: Prop.Observable, name: 'loopPending$' },
  { type: Prop.Observable, name: 'cyclePending$' },
  { type: Prop.Observable, name: 'firstVisible$' },
  { type: Prop.Observable, name: 'lastVisible$' },
  { type: Prop.Observable, name: 'bof$' },
  { type: Prop.Observable, name: 'eof$' }
];

export const itemAdapterEmpty = <ItemAdapter>{
  data: {},
  element: {}
};
