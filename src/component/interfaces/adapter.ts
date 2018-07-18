export interface ItemAdapter {
  $index?: number;
  data?: any;
  element?: HTMLElement;
}

export interface Adapter {
  readonly version: string | null;
  readonly isInitialized: boolean;
  readonly isLoading: boolean;
  readonly firstVisible: ItemAdapter;
  reload: Function;
}
