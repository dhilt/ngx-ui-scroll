export interface Adapter {
  isInitialized: boolean;
  isLoading?: boolean;
  reload: Function;
}

export enum ActionType {
  reload = 'reload'
}

export interface AdapterAction {
  action: ActionType;
  payload: any;
}
