import {
  Datasource as IDatasource, DatasourceGet,
  Adapter, DevSettings, Settings
} from '../interfaces/index';

export class Datasource implements IDatasource {
  get: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter?: Adapter;

  constructor(datasource: IDatasource) {
    Object.assign(this, datasource);

    // set up mock adapter
    this.adapter = <Adapter> {
      isInitialized: false,
      isLoading: false,
      reload: () => null
    };
  }
}
