import { Observable } from 'rxjs';

import { Adapter as IAdapter, AdapterAction, ActionType } from '../interfaces/index';

export class Adapter implements IAdapter {
  private observer;
  public resolver$: Observable<any>;

  constructor() {
    this.resolver$ = Observable.create(observer => this.observer = observer);
  }

  reload(startIndex?: number) {
    this.observer.next(<AdapterAction>{
      action: ActionType.reload,
      payload: startIndex
    });
  }

}
