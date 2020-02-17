import {
  Datasource as IDatasource, DatasourceGet, DevSettings, Settings, Adapter as IAdapter
} from '../interfaces/index';
import { AdapterOld } from './adapter';
import { generateMockAdapter } from '../utils/index';
import { IAdapterNew } from '../interfaces/adapter';
import { generateAdapterContext } from '../utils/adapter';

export class Datasource implements IDatasource {
  readonly constructed: boolean;
  get: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter: IAdapterNew;

  constructor(datasource: IDatasource, noAdapter?: boolean) {
    this.constructed = true;
    Object.assign(<any>this, datasource);
    this.adapter = generateAdapterContext(!!noAdapter);
  }
}
