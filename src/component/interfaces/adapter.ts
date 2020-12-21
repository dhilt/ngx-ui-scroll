import { BehaviorSubject, Subject } from 'rxjs';

import { IDatasourceOptional } from './datasource';

export enum AdapterPropType {
  Scalar,
  Observable,
  WorkflowRunner,
  Function
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
export type ItemsProcessor = (items: ItemAdapter[]) => void;

export interface IBufferInfo {
  minIndex: number;
  maxIndex: number;
  absMinIndex: number;
  absMaxIndex: number;
}

export interface AdapterAppendOptions {
  items: any[];
  eof?: boolean;
}

export interface AdapterPrependOptions {
  items: any[];
  bof?: boolean;
}

export interface AdapterRemoveOptions {
  predicate?: ItemsPredicate;
  indexes?: number[];
  increase?: boolean;
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

export interface AdapterReplaceOptions {
  items: any[];
  predicate: ItemsPredicate;
  fixRight?: boolean;
}

export interface AdapterFixOptions {
  scrollPosition?: number;
  minIndex?: number;
  maxIndex?: number;
  updater?: ItemsLooper;
  scrollToItem?: ItemsPredicate;
  scrollToItemOpt?: boolean | ScrollIntoViewOptions;
}

export interface AdapterMethodResult {
  success: boolean;
  immediate: boolean;
  details: string | null;
}
type MethodResult = Promise<AdapterMethodResult>;

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
  reset(datasource?: IDatasourceOptional): MethodResult;
  reload(reloadIndex?: number | string): MethodResult;
  append(options: AdapterAppendOptions): MethodResult;
  append(items: any, eof?: boolean): MethodResult; // old signature
  prepend(options: AdapterPrependOptions): MethodResult;
  prepend(items: any, bof?: boolean): MethodResult; // old signature
  check(): MethodResult;
  remove(args: AdapterRemoveOptions | ItemsPredicate): MethodResult; // + old signature
  clip(options?: AdapterClipOptions): MethodResult;
  insert(options: AdapterInsertOptions): MethodResult;
  replace(options: AdapterReplaceOptions): MethodResult;
  fix(options: AdapterFixOptions): MethodResult; // experimental
  relax(callback?: Function): MethodResult;
  showLog(): void;
}
