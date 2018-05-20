import { Observable } from 'rxjs';
import { Settings, DevSettings } from './settings';
import { Adapter } from './adapter';

export type DatasourceGetCallback = (index: number, count: number, success: Function, fail: Function) => void;
export type DatasourceGetObservable = (index: number, count: number) => Observable<any>;
export type DatasourceGetPromise = (index: number, count: number) => PromiseLike<any>;

export interface Datasource {
  get: DatasourceGetCallback | DatasourceGetObservable | DatasourceGetPromise;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter?: Adapter;
}
