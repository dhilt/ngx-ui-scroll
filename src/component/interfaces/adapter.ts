import { BehaviorSubject, Subject } from 'rxjs';

import { IValidator, ValidatedValue } from './validation';

export enum AdapterPropType {
  Scalar,
  Function,
  Observable
}

export interface IAdapterProp {
  name: string;
  type: AdapterPropType;
  value: any;
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
  before?: ItemsPredicate;
  after?: ItemsPredicate;
  decrement?: boolean;
}

export interface AdapterFixOptions {
  scrollPosition?: number;
  minIndex?: number;
  maxIndex?: number;
  updater?: ItemsLooper;
  scrollToItem?: ItemsPredicate;
  scrollToItemOpt?: boolean | ScrollIntoViewOptions;
  safe?: boolean;
}

export interface IAdapter {
  readonly init$?: BehaviorSubject<boolean>;
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
  readonly itemsCount: number;
  readonly bof: boolean;
  readonly bof$: Subject<boolean>;
  readonly eof: boolean;
  readonly eof$: Subject<boolean>;
  reload: (reloadIndex?: number | string) => any;
  append: (items: any, eof?: boolean) => any;
  prepend: (items: any, bof?: boolean) => any;
  check: () => any;
  remove: (predicate: ItemsPredicate) => any;
  clip: (options?: AdapterClipOptions) => any;
  insert: (options?: AdapterInsertOptions) => any;
  showLog: () => any;
  fix: (options: AdapterFixOptions) => any; // undocumented
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
