import { Adapter as IAdapter, Process } from '../interfaces/index';
import { ProcessSubject } from '../interfaces';

export class Adapter implements IAdapter {
  public isInitialized;
  public isLoading;
  readonly callWorkflow: Function;

  constructor(callWorkflow: Function) {
    this.isInitialized = true;
    this.callWorkflow = callWorkflow;
  }

  reload(reloadIndex?: number | string) {
    this.callWorkflow(<ProcessSubject>{
      process: Process.reload,
      status: 'start',
      payload: reloadIndex
    });
  }
}
