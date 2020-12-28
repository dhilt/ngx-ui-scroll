import { Observable } from 'rxjs';
import { Settings, DevSettings } from './settings';
import { IAdapter } from './adapter';

type SuccessCallback = (data: any[]) => any;
type DatasourceGetCallback = (index: number, count: number, success: SuccessCallback, fail?: Function) => void;
type DatasourceGetObservable = (index: number, count: number) => Observable<any[]>;
type DatasourceGetPromise = (index: number, count: number) => PromiseLike<any[]>;

export type DatasourceGet = DatasourceGetCallback | DatasourceGetObservable | DatasourceGetPromise;

export interface IDatasourceOptional {
  get?: DatasourceGet;
  settings?: Settings;
  devSettings?: DevSettings;
}

export interface IDatasourceGeneric<A> extends Omit<IDatasourceOptional, 'get'> {
  get: DatasourceGet;
  adapter?: A;
}

export interface IDatasourceConstructedGeneric<A> extends Omit<IDatasourceGeneric<A>, 'adapter'> {
  adapter: A;
}

export interface IDatasource extends IDatasourceGeneric<IAdapter> { }

export interface IDatasourceConstructed extends IDatasourceConstructedGeneric<IAdapter> { }

export interface IDatasourceClass<A> extends IDatasourceConstructedGeneric<A> {
  new(datasource: IDatasourceGeneric<A>): IDatasourceConstructedGeneric<A>;
}
