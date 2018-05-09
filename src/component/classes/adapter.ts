import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Adapter as IAdapter, Process, ProcessSubject } from '../interfaces/index';

type GetProcessMethod = () => BehaviorSubject<ProcessSubject>;

export class Adapter implements IAdapter {
  public isInitialized;
  public isLoading;
  public getProcessSubject: GetProcessMethod;

  constructor(getProcessSubject: GetProcessMethod) {
    this.isInitialized = true;
    this.getProcessSubject = getProcessSubject;
  }

  dispose() {
  }

  reload(reloadIndex?: number | string) {
    const process: BehaviorSubject<ProcessSubject> = this.getProcessSubject();
    if (!process.isStopped) {
      process.next(<ProcessSubject>{
        process: Process.reload,
        status: 'start',
        payload: reloadIndex
      });
    }
  }

}
