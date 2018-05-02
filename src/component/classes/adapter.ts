import { Subject } from 'rxjs/Subject';

import { Adapter as IAdapter, AdapterAction, AdapterActionType } from '../interfaces/index';

export class Adapter implements IAdapter {
  public isInitialized;
  public isLoading;
  public subject: Subject<AdapterAction>;

  constructor() {
    this.isInitialized = true;
    this.subject = new Subject();
  }

  dispose() {
    this.subject.complete();
  }

  reload(reloadIndex?: number | string) {
    this.subject.next(<AdapterAction>{
      action: AdapterActionType.reload,
      payload: reloadIndex
    });
  }

}
