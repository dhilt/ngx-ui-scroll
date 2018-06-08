export interface Adapter {
  version: string;
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
