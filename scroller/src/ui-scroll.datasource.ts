import { BehaviorSubject, Subject } from 'rxjs';

import {
  makeDatasource,
  AdapterPropName,
  EMPTY_ITEM,
  IReactivePropConfig,
  IAdapterConfig,
  IAdapterItem
} from './vscroll';
import { AngularDatasourceClass } from './types';

const getBooleanSubjectPropConfig = (): IReactivePropConfig => ({
  source: new Subject<boolean>(),
  emit: (source, value) => (source as Subject<boolean>).next(value as boolean)
});

const getItemBehaviorSubjectPropConfig = (): IReactivePropConfig => ({
  source: new BehaviorSubject<IAdapterItem>(EMPTY_ITEM),
  emit: (source, value) =>
    (source as BehaviorSubject<IAdapterItem>).next(value as IAdapterItem)
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
    [AdapterPropName.eof$]: getBooleanSubjectPropConfig()
  }
});

const AngularDatasource = makeDatasource(
  getAdapterConfig
) as AngularDatasourceClass;

export { AngularDatasource as Datasource };
