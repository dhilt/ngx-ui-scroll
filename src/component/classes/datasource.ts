import { Datasource as IDatasource, DatasourceGet, DevSettings, Settings } from '../interfaces/index';
import { Adapter, generateMockAdapter } from './adapter';

export class Datasource implements IDatasource {
  readonly constructed: boolean;
  get: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter: Adapter;

  constructor(datasource: IDatasource, hasNoAdapter?: boolean) {
    this.constructed = true;
    Object.assign(<any>this, datasource);
    if (hasNoAdapter) {
      this.adapter = <Adapter>generateMockAdapter();
    } else {
      this.adapter = new Adapter();
    }
  }
}
