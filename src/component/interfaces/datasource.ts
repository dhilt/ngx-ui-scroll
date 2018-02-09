import { Settings } from './settings';

export type DatasourceGet = (index: number, count: number) => any;

export interface Datasource {
  get: DatasourceGet;
  settings?: Settings;
}
