import { Subject } from 'rxjs/Subject';

import { Adapter as IAdapter, AdapterAction, ActionType } from '../interfaces/index';

export class Adapter implements IAdapter {
  public subject: Subject<AdapterAction>;

  constructor() {
    this.subject = new Subject();
  }

  dispose() {
    this.subject.complete();
  }

  reload(reloadIndex?: number | string) {
    this.subject.next(<AdapterAction>{
      action: ActionType.reload,
      payload: reloadIndex
    });
  }

}
