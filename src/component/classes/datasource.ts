import {
  Datasource as IDatasource, DatasourceGet, DevSettings, Settings, IAdapter
} from '../interfaces/index';
import { AdapterContext } from './adapterContext';

export class Datasource implements IDatasource {
  readonly constructed: boolean;
  get: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter: IAdapter;

  constructor(datasource: IDatasource, noAdapter?: boolean) {
    this.constructed = true;
    Object.assign(<any>this, datasource);
    this.adapter = <IAdapter>new AdapterContext(!!noAdapter);
  }
}
