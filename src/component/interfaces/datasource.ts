import { Observable } from 'rxjs';
import { Settings, DevSettings } from './settings';
import { Adapter } from './adapter';

export type DatasourceGetCallback = (index: number, count: number, success: Function, fail?: Function) => void;
export type DatasourceGetObservable = (index: number, count: number) => Observable<any>;
export type DatasourceGetPromise = (index: number, count: number) => PromiseLike<any>;

export type DatasourceGet = DatasourceGetCallback | DatasourceGetObservable | DatasourceGetPromise;

export interface Datasource {
  readonly constructed?: boolean;
  get: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter?: Adapter;
}
