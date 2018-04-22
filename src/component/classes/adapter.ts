import { Subject } from 'rxjs/Subject';

import { Adapter as IAdapter, AdapterAction, ActionType } from '../interfaces/index';

export class Adapter implements IAdapter {
  public subject: Subject;

  constructor() {
    this.subject = new Subject();
  }

  dispose() {
    this.subject.complete();
  }

  reload(startIndex?: number) {
    this.subject.next(<AdapterAction>{
      action: ActionType.reload,
      payload: startIndex
    });
  }

}
