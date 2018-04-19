export interface Adapter {
  reload: Function;
}

export enum ActionType {
  reload = 'reload'
}

export interface AdapterAction {
  action: ActionType;
  payload: any;
}
