import { Subject } from 'rxjs';

import { makeDatasource } from './component/classes/datasource';
import {
  IDatasourceGeneric,
  AdapterPropName,
  IAdapterConfig,
  IAdapter,
} from './component/interfaces/index';

interface IAdapterOverride {
  isLoading$: Subject<boolean>;
  loopPending$: Subject<boolean>;
}

interface IAngularAdapter extends Omit<IAdapter, keyof IAdapterOverride> {
  isLoading$: Subject<boolean>;
  loopPending$: Subject<boolean>;
}

interface IAngularDatasource extends IDatasourceGeneric<IAngularAdapter> { }

const getAdapterConfig = (): IAdapterConfig => ({
  mock: false,
  reactive: {
    [AdapterPropName.isLoading$]: {
      source: new Subject<boolean>(),
      emit: (source, value) => source.next(value)
    },
    [AdapterPropName.loopPending$]: {
      source: new Subject<boolean>(),
      emit: (source, value) => source.next(value)
    },
  }
});

const AngularDatasource = makeDatasource<IAngularAdapter>(getAdapterConfig);

export {
  IAngularAdapter as IAdapter,
  IAngularDatasource as IDatasource,
  AngularDatasource as Datasource
};
