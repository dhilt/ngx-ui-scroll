import { BehaviorSubject, Subject } from 'rxjs';

import { IValidator, ValidatedValue } from './validation';
import { IDatasourceOptional } from './datasource';

export enum AdapterPropType {
  Scalar,
  Function,
  FunctionPromise,
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

export interface AdapterPrependOptions {
  items: any[];
  bof?: boolean;
}

export interface AdapterAppendOptions {
  items: any[];
  eof?: boolean;
}

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
  scrollToItem?: ItemsPredicate;
  scrollToItemOpt?: boolean | ScrollIntoViewOptions;
}

export interface IAdapter {
  readonly id: number;
  readonly mock: boolean;
  readonly version: string;
  readonly isLoading: boolean;
  readonly isLoading$: Subject<boolean>;
  readonly loopPending: boolean;
  readonly loopPending$: Subject<boolean>;
  readonly firstVisible: ItemAdapter;
  readonly firstVisible$: BehaviorSubject<ItemAdapter>;
  readonly lastVisible: ItemAdapter;
  readonly lastVisible$: BehaviorSubject<ItemAdapter>;
  readonly bof: boolean;
  readonly bof$: Subject<boolean>;
  readonly eof: boolean;
  readonly eof$: Subject<boolean>;
  readonly itemsCount: number;
  reset(datasource?: IDatasourceOptional): void;
  reload(reloadIndex?: number | string): void;
  append(options: AdapterAppendOptions): Promise<void>;
  append(items: any, eof?: boolean): Promise<void>; // old signature
  prepend(options: AdapterPrependOptions): Promise<void>;
  prepend(items: any, bof?: boolean): Promise<void>; // old signature
  check(): void;
  remove(predicate: ItemsPredicate): void;
  clip(options?: AdapterClipOptions): Promise<void>;
  insert(options: AdapterInsertOptions): Promise<void>;
  showLog(): void;
  fix(options: AdapterFixOptions): void; // experimental
}
