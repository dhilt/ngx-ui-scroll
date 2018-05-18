export interface Adapter {
  isInitialized: boolean;
  isLoading: boolean;
  reload: Function;
}

export enum AdapterActionType {
  reload = 'reload'
}

export interface AdapterAction {
  action: AdapterActionType;
  payload: any;
}
