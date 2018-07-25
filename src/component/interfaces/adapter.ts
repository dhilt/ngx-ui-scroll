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
  readonly firstVisible: ItemAdapter;
  readonly firstVisible$: BehaviorSubject<ItemAdapter>;
  reload: Function;
}
