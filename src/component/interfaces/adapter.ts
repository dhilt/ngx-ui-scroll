import { BehaviorSubject, Subject } from 'rxjs';

import { IValidator, ValidatedValue } from './validation';
import { IDatasourceOptional } from './datasource';

export enum AdapterPropType {
  Scalar,
  Function,
  Observable
}

export interface IAdapterProp {
  name: string;
  type: AdapterPropType;
  value: any;
  observable?: string;
  wanted?: boolean;
  onDemand?: boolean;
  permanent?: boolean;
}

export interface ItemAdapter {
  $index: number;
  data: any;
  element?: HTMLElement;
}

export type ItemsPredicate = (item: ItemAdapter) => boolean;
export type ItemsLooper = (item: ItemAdapter) => any;

export interface AdapterClipOptions {
  forwardOnly?: boolean;
  backwardOnly?: boolean;
}

export interface AdapterInsertOptions {
  items: any[];
  before?: ItemsPredicate;
  after?: ItemsPredicate;
  decrease?: boolean;
}

export interface AdapterFixOptions {
  scrollPosition?: number;
  minIndex?: number;
  maxIndex?: number;
  updater?: ItemsLooper;
  safe?: boolean;
}

export interface IAdapter {
  readonly id: number;
  readonly mock: boolean;
  readonly version: string;
  readonly isLoading: boolean;
  readonly isLoading$: Subject<boolean>;
  readonly loopPending: boolean;
  readonly loopPending$: Subject<boolean>;
  readonly cyclePending: boolean;
  readonly cyclePending$: Subject<boolean>;
  readonly firstVisible: ItemAdapter;
  readonly firstVisible$: BehaviorSubject<ItemAdapter>;
  readonly lastVisible: ItemAdapter;
  readonly lastVisible$: BehaviorSubject<ItemAdapter>;
  readonly bof: boolean;
  readonly bof$: Subject<boolean>;
  readonly eof: boolean;
  readonly eof$: Subject<boolean>;
  readonly itemsCount: number;
  reset: (datasource?: IDatasourceOptional) => void;
  reload: (reloadIndex?: number | string) => void;
  append: (items: any, eof?: boolean) => void;
  prepend: (items: any, bof?: boolean) => void;
  check: () => void;
  remove: (predicate: ItemsPredicate) => void;
  clip: (options?: AdapterClipOptions) => void;
  insert: (options: AdapterInsertOptions) => void;
  showLog: () => void;
  fix: (options: AdapterFixOptions) => void; // experimental
}

export interface IAdapterMethodParam {
  name: string;
  validators: IValidator[];
  call?: Function;
  value?: any;
}

export interface IAdapterMethodParams {
  [key: string]: IAdapterMethodParam;
}

export interface IAdapterMethods {
  [key: string]: IAdapterMethodParams;
}

export interface IAdapterValidatedMethodParams {
  [key: string]: ValidatedValue;
}

export interface IAdapterValidatedMethodData {
  isValid: boolean;
  errors: string[];
  params: IAdapterValidatedMethodParams;
}
