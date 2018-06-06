import { Observable } from 'rxjs/Observable';
import { Settings, DevSettings } from './settings';
import { Adapter } from './adapter';

type DatasourceGetCallback = (index: number, count: number, success: Function, fail?: Function) => void;
type DatasourceGetObservable = (index: number, count: number) => Observable<any>;
type DatasourceGetPromise = (index: number, count: number) => PromiseLike<any>;

export type DatasourceGet = DatasourceGetCallback | DatasourceGetObservable | DatasourceGetPromise;

export interface Datasource {
  get: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
  adapter?: Adapter;
}
