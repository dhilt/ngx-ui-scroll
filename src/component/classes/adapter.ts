import { ProcessSubject } from '../interfaces';

import { Scroller } from '../scroller';
import { Adapter as IAdapter, Process } from '../interfaces/index';

export class Adapter implements IAdapter {
  public version;
  public isInitialized;
  public isLoading;
  readonly callWorkflow: Function;

  constructor(scroller: Scroller) {
    this.version = scroller.version;
    this.isInitialized = true;
    this.callWorkflow = scroller.callWorkflow;
  }

  reload(reloadIndex?: number | string) {
    this.callWorkflow(<ProcessSubject>{
      process: Process.reload,
      status: 'start',
      payload: reloadIndex
    });
  }
}
