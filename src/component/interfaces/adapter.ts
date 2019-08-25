import { BehaviorSubject } from 'rxjs';

export interface ItemAdapter {
  $index?: number;
  data?: any;
  element?: HTMLElement;
}

export type ItemsPredicate = (item: ItemAdapter) => boolean;

export interface ClipOptions {
  forwardOnly?: boolean;
  backwardOnly?: boolean;
}

export interface AdapterContext {
  getVersion: Function;
  getIsLoading: Function;
  getIsLoading$: Function;
  getCyclePending: Function;
  getCyclePending$: Function;
  getLoopPending: Function;
  getLoopPending$: Function;
  getItemsCount: Function;
  getBOF: Function;
  getEOF: Function;
  getFirstVisible: Function;
  getFirstVisible$: Function;
  getLastVisible: Function;
  getLastVisible$: Function;
  _setScrollPosition: Function;
}

export interface Adapter {
  init$: BehaviorSubject<boolean>;
  readonly version: string | null;
  readonly init: boolean;
  readonly isLoading: boolean;
  readonly isLoading$: BehaviorSubject<boolean>;
  readonly loopPending: boolean;
  readonly loopPending$: BehaviorSubject<boolean>;
  readonly cyclePending: boolean;
  readonly cyclePending$: BehaviorSubject<boolean>;
  readonly firstVisible: ItemAdapter;
  readonly firstVisible$: BehaviorSubject<ItemAdapter>;
  readonly lastVisible: ItemAdapter;
  readonly lastVisible$: BehaviorSubject<ItemAdapter>;
  readonly itemsCount: number;
  readonly bof: boolean;
  readonly eof: boolean;
  initializeContext: Function; // internal use only
  reload: (reloadIndex?: number | string) => any;
  append: (items: any, bof?: boolean) => any;
  prepend: (items: any, bof?: boolean) => any;
  check: () => any;
  remove: (predicate: ItemsPredicate) => any;
  clip: (options?: ClipOptions) => any;
  showLog: () => any;
  setScrollPosition: (value: number) => any;
}
