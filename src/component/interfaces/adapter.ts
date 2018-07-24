import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/index';

export interface ItemAdapter {
  $index?: number;
  data?: any;
  element?: HTMLElement;
}

export interface Adapter {
  readonly version: string | null;
  readonly isInitialized: boolean;
  readonly isInitialized$: Observable<boolean>;
  readonly isLoading: boolean;
  readonly isLoading$: BehaviorSubject<boolean>;
  readonly firstVisible: ItemAdapter;
  readonly firstVisible$: BehaviorSubject<ItemAdapter>;
  reload: Function;
}
