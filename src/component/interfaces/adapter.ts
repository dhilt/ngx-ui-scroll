import { Observable, BehaviorSubject } from 'rxjs';

export interface ItemAdapter {
  $index?: number;
  data?: any;
  element?: HTMLElement;
}

export interface Adapter {
  readonly version: string | null;
  readonly init: boolean;
  readonly init$: Observable<boolean>;
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
  initialize: Function; // not callable outside
  reload: (reloadIndex?: number | string) => any;
  prepend: (items: any) => any;
  showLog: () => any;
  setMinIndex: (value: number) => any;
  setScrollPosition: (value: number) => any;
}
