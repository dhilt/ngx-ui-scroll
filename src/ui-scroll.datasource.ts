import { BehaviorSubject, Subject } from 'rxjs';

import {
  makeDatasource,
  AdapterPropName,
  EMPTY_ITEM,
  IDatasourceGeneric,
  IReactivePropConfig,
  IAdapterConfig,
  IAdapterItem,
  IAdapter,
} from './vscroll';

interface IReactiveOverride {
  init$: Subject<boolean>;
  isLoading$: Subject<boolean>;
  loopPending$: Subject<boolean>;
  firstVisible$: BehaviorSubject<IAdapterItem>;
  lastVisible$: BehaviorSubject<IAdapterItem>;
  bof$: Subject<boolean>;
  eof$: Subject<boolean>;
}

interface IAngularAdapter<Item = unknown> extends Omit<IAdapter<Item>, keyof IReactiveOverride>, IReactiveOverride { }

interface IAngularDatasource<Item = unknown> extends IDatasourceGeneric<IAngularAdapter<Item>> { }

const getBooleanSubjectPropConfig = (): IReactivePropConfig => ({
  source: new Subject<boolean>(),
  emit: (source, value) => (source as Subject<boolean>).next(value as boolean)
});

const getItemBehaviorSubjectPropConfig = (): IReactivePropConfig => ({
  source: new BehaviorSubject<IAdapterItem>(EMPTY_ITEM),
  emit: (source, value) => (source as BehaviorSubject<IAdapterItem>).next(value as IAdapterItem)
});

const getAdapterConfig = (): IAdapterConfig => ({
  mock: false,
  reactive: {
    [AdapterPropName.init$]: getBooleanSubjectPropConfig(),
    [AdapterPropName.isLoading$]: getBooleanSubjectPropConfig(),
    [AdapterPropName.loopPending$]: getBooleanSubjectPropConfig(),
    [AdapterPropName.firstVisible$]: getItemBehaviorSubjectPropConfig(),
    [AdapterPropName.lastVisible$]: getItemBehaviorSubjectPropConfig(),
    [AdapterPropName.bof$]: getBooleanSubjectPropConfig(),
    [AdapterPropName.eof$]: getBooleanSubjectPropConfig(),
  }
});

const AngularDatasource = makeDatasource<IAngularAdapter>(getAdapterConfig);

export {
  IAngularAdapter as IAdapter,
  IAngularDatasource as IDatasource,
  AngularDatasource as Datasource
};
