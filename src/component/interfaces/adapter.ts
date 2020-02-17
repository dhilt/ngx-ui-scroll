import { BehaviorSubject, Subject } from 'rxjs';

export enum AdapterPropType {
  Scalar,
  Function,
  Observable
}

export interface IAdapterProp {
  type: AdapterPropType;
  name: string;
}

export interface IAdapter {
  readonly init$: BehaviorSubject<boolean>;
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
