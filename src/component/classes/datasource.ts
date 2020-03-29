import { IDatasource, DatasourceGet, DevSettings, Settings, IAdapter } from '../interfaces/index';
import { AdapterContext } from './adapterContext';

export class Datasource implements IDatasource {
  get: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter: IAdapter;

  constructor(datasource: IDatasource, mockAdapter?: boolean) {
    Object.assign(this as any, datasource);
    this.adapter = (new AdapterContext(mockAdapter)) as IAdapter;
  }
}
