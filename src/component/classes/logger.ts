import { Scroller } from '../scroller';
import { Process, ProcessRun, ProcessStatus as Status, ProcessSubject } from '../interfaces/index';

export class Logger {

  readonly debug: boolean;
  readonly immediateLog: boolean;
  readonly logTime: boolean;
  readonly getTime: Function;
  readonly getStat: Function;
  readonly getFetchRange: Function;
  readonly getInnerLoopCount: Function;
  readonly getWorkflowCycleData: Function;
  private logs: Array<any> = [];

  constructor(scroller: Scroller) {
    const { settings } = scroller;
    this.debug = settings.debug;
    this.immediateLog = settings.immediateLog;
    this.logTime = settings.logTime;
    this.getTime = (): string => ` // time: ${scroller.state.time}`;
    this.getStat = (): string => {
      const first = scroller.buffer.getFirstVisibleItem();
      const last = scroller.buffer.getLastVisibleItem();
      return 'top: ' + scroller.viewport.scrollPosition + ', ' +
        'size: ' + scroller.viewport.getScrollableSize() + ', ' +
        'bwd_p: ' + scroller.viewport.padding.backward.size + ', ' +
        'fwd_p: ' + scroller.viewport.padding.forward.size + ', ' +
        'average: ' + scroller.buffer.averageSize + ', ' +
        'items: ' + scroller.buffer.getVisibleItemsCount() + ', ' +
        'range: ' + (first && last ? `[${first.$index}..${last.$index}]` : 'no');
    };
    this.getFetchRange = (): string => {
      const { firstIndex, lastIndex } = scroller.state.fetch;
      const hasInterval = firstIndex !== null && lastIndex !== null && !isNaN(firstIndex) && !isNaN(lastIndex);
      return hasInterval ? `[${firstIndex}..${lastIndex}]` : 'no';
    };
    this.getInnerLoopCount = (): number => scroller.state.innerLoopCount;
    this.getWorkflowCycleData = (more: boolean): string =>
      `${scroller.settings.instanceIndex}-${scroller.state.workflowCycleCount}` + (more ? '-' : '');
    this.log(() => `uiScroll Workflow has been started (v${scroller.version})`);
  }

  stat(str?: string) {
    if (this.debug) {
      const logStyles = ['color: #888; border: dashed #888 0; border-bottom-width: 0px', 'color: #000; border-width: 0'];
      this.log(() => ['%cstat' + (str ? ` ${str}` : '') + ',%c ' + this.getStat(), ...logStyles]);
    }
  }

  fetch(str?: string) {
    if (this.debug) {
      const _text = 'fetch interval' + (str ? ` ${str}` : '');
      const logStyles = ['color: #888', 'color: #000'];
      this.log(() => [`%c${_text}: %c${this.getFetchRange()}`, ...logStyles]);
    }
  }

  logProcess(data: ProcessSubject) {
    if (!this.debug) {
      return;
    }
    const { process, status } = data;
    const payload: ProcessRun = data.payload || { empty: true };

    // standard process log
    const processLog = `process ${process}, %c${status}%c` + (!payload.empty ? ',' : '');
    const styles = [status === Status.error ? 'color: #cc0000;' : '', 'color: #000000;'];
    this.log(() => [processLog, ...styles, ...(!payload.empty ? [payload] : [])]);

    // inner loop start-end log
    const workflowCycleData = this.getWorkflowCycleData(true);
    const loopCount = this.getInnerLoopCount();
    const loopLog: string[] = [];
    if (
      process === Process.init && status === Status.next ||
      process === Process.scroll && status === Status.next && payload.keepScroll ||
      process === Process.end && status === Status.next && payload.byTimer
    ) {
      loopLog.push(`%c---=== loop ${workflowCycleData + (loopCount + 1)} start`);
    } else if (
      process === Process.end && !payload.byTimer
    ) {
      loopLog.push(`%c---=== loop ${workflowCycleData + loopCount} done`);
      if (status === Status.next && !(payload.keepScroll)) {
        loopLog[0] += `, loop ${workflowCycleData + (loopCount + 1)} start`;
      }
    }
    if (loopLog.length) {
      this.log(() => [...loopLog, 'color: #006600;']);
    }

    // workflow cycle start log
    if (
      process === Process.init && status === Status.start ||
      process === Process.reload && status === Status.next ||
      process === Process.scroll && status === Status.next && !(payload.keepScroll)
    ) {
      const logData = this.getWorkflowCycleData(false);
      const logStyles = 'color: #0000aa; border: solid black 1px; border-width: 1px 0 0 1px; margin-left: -2px';
      this.log(() => [`%c   ~~~ WF Cycle ${logData} STARTED ~~~  `, logStyles]);
    }

    // workflow run end log
    if (process === Process.end && status === Status.done) {
      const logData = this.getWorkflowCycleData(false);
      const logStyles = 'color: #0000aa; border: solid #555 1px; border-width: 0 0 1px 1px; margin-left: -2px';
      this.log(() => [`%c   ~~~ WF Cycle ${logData} FINALIZED ~~~  `, logStyles]);
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
