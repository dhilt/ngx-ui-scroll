import { Datasource as IDatasource, DatasourceGet, DevSettings, Settings } from '../interfaces/index';
import { Adapter, generateMockAdapter } from './adapter';

export class Datasource implements IDatasource {
  get: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter: Adapter;

  constructor(datasource: IDatasource, auto?: boolean) {
    Object.assign(<any>this, datasource);
    // true Adapter is available only if Datasource is instantiated manually
    this.adapter = auto ? <Adapter>generateMockAdapter() : new Adapter();
  }
}
