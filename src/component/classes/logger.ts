import { Scroller } from '../scroller';
import { Process, ProcessStatus as Status, ProcessSubject } from '../interfaces';

export class Logger {

  readonly debug: boolean;
  readonly immediateLog: boolean;
  readonly logTime: boolean;
  readonly getTime: Function;
  readonly getStat: Function;
  readonly getCycleCount: Function;
  readonly getWorkflowCycleData: Function;
  private logs: Array<any> = [];

  constructor(scroller: Scroller) {
    const { settings } = scroller;
    this.debug = settings.debug;
    this.immediateLog = settings.immediateLog;
    this.logTime = settings.logTime;
    this.getTime = (): string => ` // time: ${scroller.state.time}`;
    this.getStat = (): string =>
      'top: ' + scroller.viewport.scrollPosition + ', ' +
      'size: ' + scroller.viewport.getScrollableSize() + ', ' +
      'bwd_p: ' + scroller.viewport.padding.backward.size + ', ' +
      'fwd_p: ' + scroller.viewport.padding.forward.size + ', ' +
      'items: ' + scroller.datasource.adapter.itemsCount;
    this.getCycleCount = (): number => scroller.state.cycleCount;
    this.getWorkflowCycleData = (more: boolean): string =>
      `${scroller.settings.instanceIndex}-${scroller.state.workflowCycleCount}` + (more ? '-' : '');
    this.log(() => `uiScroll Workflow has been started (v${scroller.version})`);
  }

  stat(str?: string) {
    if (this.debug) {
      const logStyles = ['color: #888; border: dashed #888 0; border-bottom-width: 0px', 'color: #000; border-width: 0'];
      this.log(() => [(str ? `%c${str} ` : '') + 'stat,%c ' + this.getStat(), ...logStyles]);
    }
  }

  logProcess(data: ProcessSubject) {
    if (!this.debug) {
      return;
    }
    const { process, status, payload } = data;

    // standard process log
    const result = `process ${process}, %c${status}%c` + (payload && typeof payload !== 'object' ? ',' : '');
    const styles = [status === Status.error ? 'color: #ff0000;' : '', 'color: #000000;'];
    const _payload = payload ? [payload] : [];
    this.log(() => [result, ...styles, ..._payload]);

    // sub cycle log
    const preCycleData = this.getWorkflowCycleData(true);
    const cycleCount = this.getCycleCount();
    const cycleResult = [];
    if (
      process === Process.init && status === Status.next ||
      process === Process.scroll && status === Status.next && data.payload.keepScroll
    ) {
      cycleResult.push(`%c---=== cycle ${preCycleData + (cycleCount + 1)} start`);
    } else if (
      process === Process.end
    ) {
      cycleResult.push(`%c---=== cycle ${preCycleData + cycleCount} done`);
      if (data.status === Status.next && !data.payload.keepScroll) {
        cycleResult[0] += `, cycle ${preCycleData + (cycleCount + 1)} start`;
      }
    }
    if (cycleResult.length) {
      this.log(() => [...cycleResult, 'color: #006600;']);
    }

    // workflow run-start log
    if (
      process === Process.init && status === Status.start ||
      process === Process.reload && status === Status.next ||
      process === Process.scroll && status === Status.next && !payload.keepScroll
    ) {
      const logData = this.getWorkflowCycleData(false);
      const logStyles = 'color: #0000aa; border: solid black 1px; border-width: 1px 0 0 1px; margin-left: -2px';
      this.log(() => [`%c   ~~~ WF Run ${logData} STARTED ~~~  `, logStyles]);
    }

    // workflow run-end log
    if (process === Process.end && status === Status.done) {
      const logData = this.getWorkflowCycleData(false);
      const logStyles = 'color: #0000aa; border: solid #555 1px; border-width: 0 0 1px 1px; margin-left: -2px';
      this.log(() => [`%c   ~~~ WF Run ${logData} FINALIZED ~~~  `, logStyles]);
    }
  }

  log(...args: Array<any>) {
    if (this.debug) {
      if (typeof args[0] === 'function') {
        args = args[0]();
        if (!Array.isArray(args)) {
          args = [args];
        }
      }
      if (args.every(item => !item)) {
        return;
      }
      if (this.logTime) {
        args = [...args, this.getTime()];
      }
      if (this.immediateLog) {
        console.log.apply(this, args);
      } else {
        this.logs.push(args);
      }
    }
  }

  logForce(...args: Array<any>) {
    if (this.debug) {
      if (!this.immediateLog && this.logs.length) {
        this.logs.forEach(logArgs => console.log.apply(this, logArgs));
        this.logs = [];
      }
      if (args.length) {
        console.log.apply(this, args);
      }
    }
  }
}
