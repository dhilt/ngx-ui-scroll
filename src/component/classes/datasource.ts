import { IDatasource, DatasourceGet, DevSettings, Settings, IAdapter } from '../interfaces/index';
import { AdapterContext } from './adapterContext';

export class Datasource implements IDatasource {
  get: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter: IAdapter;

  constructor(datasource: IDatasource, context?: AdapterContext) {
    Object.assign(<any>this, datasource);
    this.adapter = (context || new AdapterContext()) as IAdapter;
  }
}
