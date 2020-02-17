import { BehaviorSubject, Subject } from 'rxjs';

export interface IAdapterNew {
  readonly init$: BehaviorSubject<boolean>;
  readonly version: string;
  readonly isLoading: boolean;
  readonly isLoading$: Subject<boolean>;
  reload: (reloadIndex?: number | string) => any;
  append: (items: any, bof?: boolean) => any;
  prepend: (items: any, bof?: boolean) => any;
  check: () => any;
  remove: (predicate: ItemsPredicate) => any;
  clip: (options?: ClipOptions) => any;
  showLog: () => any;
  fix: (options: FixOptions) => any; // undocumented
}

export interface ItemAdapter {
  $index: number;
  data: any;
  element?: HTMLElement;
}

export type ItemsPredicate = (item: ItemAdapter) => boolean;
export type ItemsLooper = (item: ItemAdapter) => any;

export interface ClipOptions {
  forwardOnly?: boolean;
  backwardOnly?: boolean;
}

export interface FixOptions {
  scrollPosition?: number;
  minIndex?: number;
  maxIndex?: number;
  updater?: ItemsLooper;
  safe?: boolean;
}

export interface Adapter {
  init$: BehaviorSubject<boolean>;
  readonly version: string | null;
  readonly init: boolean;
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
  initialize: Function; // internal use only
  dispose: Function; // internal use only
  reload: (reloadIndex?: number | string) => any;
  append: (items: any, bof?: boolean) => any;
  prepend: (items: any, bof?: boolean) => any;
  check: () => any;
  remove: (predicate: ItemsPredicate) => any;
  clip: (options?: ClipOptions) => any;
  fix: (options: FixOptions) => any; // undocumented
  showLog: () => any;
}
