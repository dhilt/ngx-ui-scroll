import {
  Datasource as IDatasource, DatasourceGet,
  Adapter, DevSettings, Settings
} from '../interfaces/index';
import { generateMockAdapter } from './adapter';

export class Datasource implements IDatasource {
  get: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter: Adapter;

  constructor(datasource: IDatasource) {
    Object.assign(this, datasource);
    this.adapter = generateMockAdapter(this);
  }
}
