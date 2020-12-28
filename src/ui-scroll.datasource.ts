import { Subject } from 'rxjs';

import { makeDatasource } from './component/classes/datasource';
import {
  IDatasourceGeneric,
  AdapterPropName,
  IReactivePropConfig,
  IAdapterConfig,
  IAdapter,
} from './component/interfaces/index';

interface IReactiveOverride {
  isLoading$: Subject<boolean>;
  loopPending$: Subject<boolean>;
  bof$: Subject<boolean>;
  eof$: Subject<boolean>;
}

interface IAngularAdapter extends Omit<IAdapter, keyof IReactiveOverride>, IReactiveOverride { }

interface IAngularDatasource extends IDatasourceGeneric<IAngularAdapter> { }

const getBooleanSubjectPropConfig = (): IReactivePropConfig => ({
  source: new Subject<boolean>(),
  emit: (source, value) => source.next(value)
});

const getAdapterConfig = (): IAdapterConfig => ({
  mock: false,
  reactive: {
    [AdapterPropName.isLoading$]: getBooleanSubjectPropConfig(),
    [AdapterPropName.loopPending$]: getBooleanSubjectPropConfig(),
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
