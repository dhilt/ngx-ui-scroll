import {
  Datasource as IDatasource, DatasourceGet, DevSettings, Settings, Adapter as IAdapter
} from '../interfaces/index';
import { Adapter, generateMockAdapter } from './adapter';

export class Datasource implements IDatasource {
  readonly constructed: boolean;
  get: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter: IAdapter;

  constructor(datasource: IDatasource, hasNoAdapter?: boolean) {
    this.constructed = true;
    Object.assign(<any>this, datasource);
    if (hasNoAdapter) {
      this.adapter = <IAdapter>generateMockAdapter();
    } else {
      this.adapter = new Adapter();
    }
  }
}
