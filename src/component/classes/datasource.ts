import { IDatasource, DatasourceGet, DevSettings, Settings, IAdapter } from '../interfaces/index';
import { AdapterContext } from './adapter/context';

export class Datasource implements IDatasource {
  get: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter: IAdapter;

  constructor(datasource: IDatasource, ...args: any[]) {
    this.get = datasource.get;
    if (datasource.settings) {
      this.settings = datasource.settings;
    }
    if (datasource.devSettings) {
      this.devSettings = datasource.devSettings;
    }
    this.adapter = (new AdapterContext(!!args[0])) as IAdapter;
  }
}
