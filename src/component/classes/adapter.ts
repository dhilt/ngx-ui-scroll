import { Observable } from 'rxjs/Observable';

import { Adapter as IAdapter, AdapterAction, ActionType } from '../interfaces/index';

export class Adapter implements IAdapter {
  private observer;
  public resolver$: Observable<any>;

  constructor() {
    this.resolver$ = Observable.create(observer => this.observer = observer);
  }

  dispose() {
    this.observer.complete();
  }

  reload(startIndex?: number) {
    this.observer.next(<AdapterAction>{
      action: ActionType.reload,
      payload: startIndex
    });
  }

}
