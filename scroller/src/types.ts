import { BehaviorSubject, Subject } from 'rxjs';

import {
  Workflow,
  IDatasource,
  IDatasourceConstructed,
  IAdapterItem,
  IAdapter
} from './vscroll';

type WorkflowParams = ConstructorParameters<typeof Workflow>;
export type RoutinesClassType = NonNullable<WorkflowParams[0]['Routines']>;

interface IReactiveOverride<Item = unknown> {
  init$: Subject<boolean>;
  isLoading$: Subject<boolean>;
  loopPending$: Subject<boolean>;
  firstVisible$: BehaviorSubject<IAdapterItem<Item>>;
  lastVisible$: BehaviorSubject<IAdapterItem<Item>>;
  bof$: Subject<boolean>;
  eof$: Subject<boolean>;
  paused$: Subject<boolean>;
}

type _Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

interface IAngularAdapter<Data = unknown>
  extends _Omit<IAdapter<Data>, keyof IReactiveOverride<Data>>,
    IReactiveOverride<Data> {}

export interface IAngularDatasourceParams<Data = unknown>
  extends _Omit<IDatasource<Data>, 'adapter'> {}

interface IAngularDatasource<Data = unknown>
  extends _Omit<IDatasource<Data>, 'adapter'> {
  adapter?: IAngularAdapter<Data>;
}

export interface IAngularDatasourceConstructed<Data = unknown>
  extends _Omit<IDatasourceConstructed<Data>, 'adapter'> {
  adapter: IAngularAdapter<Data>;
}

export type AngularDatasourceClass<> = new <Data>(
  params: IAngularDatasourceParams<Data>
) => IAngularDatasourceConstructed<Data>;

export { IAngularAdapter as IAdapter, IAngularDatasource as IDatasource };
