import { BehaviorSubject, Subject } from 'rxjs';

import { Reactive } from '../classes/reactive';
import { IDatasourceOptional } from './datasource';

export enum AdapterPropName {
  id = 'id',
  mock = 'mock',
  version = 'version',
  isLoading = 'isLoading',
  isLoading$ = 'isLoading$',
  loopPending = 'loopPending',
  loopPending$ = 'loopPending$',
  firstVisible = 'firstVisible',
  firstVisible$ = 'firstVisible$',
  lastVisible = 'lastVisible',
  lastVisible$ = 'lastVisible$',
  bof = 'bof',
  bof$ = 'bof$',
  eof = 'eof',
  eof$ = 'eof$',
  itemsCount = 'itemsCount',
  bufferInfo = 'bufferInfo',
  reset = 'reset',
  reload = 'reload',
  append = 'append',
  prepend = 'prepend',
  check = 'check',
  remove = 'remove',
  clip = 'clip',
  insert = 'insert',
  replace = 'replace',
  fix = 'fix',
  relax = 'relax',
  showLog = 'showLog',
}

export enum AdapterPropType {
  Scalar,
  Reactive,
  WorkflowRunner,
  Function
}

interface IReactivePropConfig {
  source: any;
  emit: (source: any, value: any) => void;
}

interface IReactivePropStore extends IReactivePropConfig {
  default: any;
}

export type IReactivePropsConfig = {
  [key in AdapterPropName]?: IReactivePropConfig;
};

export type IReactivePropsStore = {
  [key in AdapterPropName]?: IReactivePropStore;
};

export interface IAdapterConfig {
  mock: boolean;
  reactive?: IReactivePropsConfig;
}

export interface IAdapterProp {
  name: AdapterPropName;
  type: AdapterPropType;
  value: any;
  reactive?: AdapterPropName;
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
  firstIndex: number;
  lastIndex: number;
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
  readonly isLoading$: Reactive<boolean>;
  readonly loopPending: boolean;
  readonly loopPending$: Reactive<boolean>;
  readonly firstVisible: ItemAdapter;
  readonly firstVisible$: BehaviorSubject<ItemAdapter>;
  readonly lastVisible: ItemAdapter;
  readonly lastVisible$: BehaviorSubject<ItemAdapter>;
  readonly bof: boolean;
  readonly bof$: Subject<boolean>;
  readonly eof: boolean;
  readonly eof$: Subject<boolean>;
  readonly itemsCount: number;
  readonly bufferInfo: IBufferInfo;
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
