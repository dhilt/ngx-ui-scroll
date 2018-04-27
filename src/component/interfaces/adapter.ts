export interface Adapter {
  isLoading?: boolean;
  reload?: Function;
}

export enum ActionType {
  reload = 'reload'
}

export interface AdapterAction {
  action: ActionType;
  payload: any;
}
