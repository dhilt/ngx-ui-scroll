import { BehaviorSubject, Subject } from 'rxjs';

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
  readonly eof: boolean;
  initialize: Function; // internal use only
  reload: (reloadIndex?: number | string) => any;
  append: (items: any, eof?: boolean) => any;
  prepend: (items: any, bof?: boolean) => any;
  check: () => any;
  remove: (predicate: ItemsPredicate) => any;
  clip: (options?: ClipOptions) => any;
  cache: (enabled: boolean) => any;
  showLog: () => any;
  setScrollPosition: (value: number) => any;
}
