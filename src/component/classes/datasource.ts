import { AdapterContext } from './adapter/context';
import {
  IDatasourceConstructedGeneric,
  DatasourceGet,
  Settings,
  DevSettings,
  IDatasourceGeneric,
  IAdapterConfig,
  IDatasourceClass,
  IAdapter,
} from '../interfaces/index';

export class DatasourceGeneric<A> implements IDatasourceConstructedGeneric<A> {
  get: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter: A;

  constructor(datasource: IDatasourceGeneric<A>, config?: IAdapterConfig) {
    this.get = datasource.get;
    if (datasource.settings) {
      this.settings = datasource.settings;
    }
    if (datasource.devSettings) {
      this.devSettings = datasource.devSettings;
    }
    const adapterContext = new AdapterContext(config || { mock: false });
    this.adapter = adapterContext as any;
  }
}

export const makeDatasource = <A>(getConfig?: () => IAdapterConfig): IDatasourceClass<A> =>
  class extends DatasourceGeneric<A> {
    constructor(datasource: IDatasourceGeneric<A>) {
      const config = typeof getConfig === 'function' ? getConfig() : void 0;
      super(datasource, config);
    }
  } as unknown as IDatasourceClass<A>;

export const Datasource = makeDatasource<IAdapter>();
