import {
  Datasource as IDatasource, DatasourceGet, DevSettings, Settings, IAdapter
} from '../interfaces/index';
import { AdapterContext } from './adapterContext';

export class Datasource implements IDatasource {
  get: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter: IAdapter;

  constructor(datasource: IDatasource, noAdapter?: boolean) {
    Object.assign(<any>this, datasource);
    this.adapter = <IAdapter>new AdapterContext(!!noAdapter);
  }
}
