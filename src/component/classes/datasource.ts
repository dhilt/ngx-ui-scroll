import { Adapter as IAdapter, Datasource as IDatasource } from '../interfaces/index';

export class Datasource implements IDatasource {
  get;
  settings?;
  devSettings?;
  adapter?;

  constructor(datasource: IDatasource) {
    Object.assign(this, datasource);

    // set up mock adapter
    this.adapter = <IAdapter> {
      isInitialized: false,
      reload: () => null
    };
  }
}
