import { Scroller } from '../scroller';
import { CommonProcess, AdapterProcess, ProcessStatus as Status, ProcessSubject } from '../interfaces/index';

type LogType = [any?, ...any[]];

export class Logger {

  readonly debug: boolean;
  readonly immediateLog: boolean;
  readonly logTime: boolean;
  readonly getTime: Function;
  readonly getStat: Function;
  readonly getFetchRange: Function;
  readonly getWorkflowCycleData: Function;
  readonly getLoopId: Function;
  readonly getLoopIdNext: Function;
  readonly getScrollPosition: Function;
  private logs: any[] = [];

  constructor(scroller: Scroller, version: string) {
    const { settings } = scroller;
    this.debug = settings.debug;
    this.immediateLog = settings.immediateLog;
    this.logTime = settings.logTime;
    this.getTime = (): string =>
      scroller.state && ` // time: ${scroller.state.time}`;
    this.getStat = (): string => {
      const { buffer, viewport } = scroller;
      const first = buffer.getFirstVisibleItem();
      const last = buffer.getLastVisibleItem();
      return 'pos: ' + viewport.scrollPosition + ', ' +
        'size: ' + viewport.getScrollableSize() + ', ' +
        'bwd_p: ' + viewport.paddings.backward.size + ', ' +
        'fwd_p: ' + viewport.paddings.forward.size + ', ' +
        'aver: ' + (buffer.hasItemSize ? buffer.averageSize : 'no') + ', ' +
        'items: ' + buffer.getVisibleItemsCount() + ', ' +
        'range: ' + (first && last ? `[${first.$index}..${last.$index}]` : 'no');
    };
    this.getFetchRange = (): string => {
      const { first: { index: first }, last: { index: last } } = scroller.state.fetch;
      return first !== null && last !== null && !Number.isNaN(first) && !Number.isNaN(last)
        ? `[${first}..${last}]`
        : 'no';
    };
    this.getLoopId = (): string => scroller.state.cycle.loopId;
    this.getLoopIdNext = (): string => scroller.state.cycle.loopIdNext;
    this.getWorkflowCycleData = (): string =>
      `${settings.instanceIndex}-${scroller.state.cycle.count}`;
    this.getScrollPosition = (element: HTMLElement) => scroller.routines.getScrollPosition(element);
    this.log(() => `uiScroll Workflow has been started (v${version}, instance ${settings.instanceIndex})`);
  }

  object(str: string, obj: any, stringify?: boolean) {
    this.log(() => [
      str,
      stringify
        ? JSON.stringify(obj, (k, v) => {
          if (Number.isNaN(v)) {
            return 'NaN';
          }
          if (v === Infinity) {
            return 'Infinity';
          }
          if (v === -Infinity) {
            return '-Infinity';
          }
          if (v instanceof Element) {
            return 'HTMLElement';
          }
          if (v instanceof HTMLDocument) {
            return 'HTMLDocument';
          }
          if (typeof v === 'function') {
            return 'Function';
          }
          return v;
        })
          .replace(/"/g, '')
          .replace(/(\{|\:|\,)/g, '$1 ')
          .replace(/(\})/g, ' $1')
        : obj
    ]);
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

  prepareForLog(data: any) {
    return data instanceof Event
      ? this.getScrollPosition(data.target)
      : data;
  }

  logProcess(data: ProcessSubject) {
    if (!this.debug) {
      return;
    }
    const { process, status, payload } = data;

    // inner loop start-end log
    const loopLog: string[] = [];
    if (
      process === CommonProcess.init && status === Status.next
    ) {
      loopLog.push(`%c---=== loop ${this.getLoopIdNext()} start`);
    } else if (
      process === CommonProcess.end
    ) {
      loopLog.push(`%c---=== loop ${this.getLoopId()} done`);
      const parent = payload && payload.process;
      if (status === Status.next && (parent !== AdapterProcess.reset && parent !== AdapterProcess.reload)) {
        loopLog[0] += `, loop ${this.getLoopIdNext()} start`;
      }
    }
    if (loopLog.length) {
      this.log(() => [...loopLog, 'color: #006600;']);
    }
  }

  logCycle(start = true) {
    const logData = this.getWorkflowCycleData();
    const border = start ? '1px 0 0 1px' : '0 0 1px 1px';
    const logStyles = `color: #0000aa; border: solid #555 1px; border-width: ${border}; margin-left: -2px`;
    this.log(() => [`%c   ~~~ WF Cycle ${logData} ${start ? 'STARTED' : 'FINALIZED'} ~~~  `, logStyles]);
  }

  logError(str: string) {
    if (this.debug) {
      const logStyles = ['color: #a00;', 'color: #000'];
      this.log(() => ['error:%c' + (str ? ` ${str}` : '') + `%c (loop ${this.getLoopIdNext()})`, ...logStyles]);
    }
  }

  logAdapterMethod = (methodName: string, args?: any, add?: string) => {
    if (!this.debug) {
      return;
    }
    const params = (
      args === void 0 ? [] : (Array.isArray(args) ? args : [args])
    )
      .map((arg: any) => {
        if (typeof arg === 'function') {
          return 'func';
        } else if (typeof arg !== 'object' || !arg) {
          return arg;
        } else if (Array.isArray(arg)) {
          return `[of ${arg.length}]`;
        }
        return '{ ' + Object.keys(arg).join(', ') + ' }';
      })
      .join(', ');
    this.log(`adapter: ${methodName}(${params || ''})${add || ''}`);
  }

  log(...args: any[]) {
    if (this.debug) {
      if (typeof args[0] === 'function') {
        args = args[0]();
        if (!Array.isArray(args)) {
          args = [args];
        }
      }
      if (args.every(item => item === void 0)) {
        return;
      }
      if (this.logTime) {
        args = [...args, this.getTime()];
      }
      args = args.map((arg: any) => this.prepareForLog(arg));
      if (this.immediateLog) {
        console.log.apply(this, args as LogType);
      } else {
        this.logs.push(args);
      }
    }
  }

  // logNow(...args: any[]) {
  //   const immediateLog = this.immediateLog;
  //   const debug = this.debug;
  //   (this as any).debug = true;
  //   (this as any).immediateLog = true;
  //   this.log.apply(this, args);
  //   (this as any).debug = debug;
  //   (this as any).immediateLog = immediateLog;
  // }

  logForce(...args: any[]) {
    if (this.debug) {
      if (!this.immediateLog && this.logs.length) {
        this.logs.forEach(logArgs => console.log.apply(this, logArgs));
        this.logs = [];
      }
      if (args.length) {
        console.log.apply(this, args as LogType);
      }
    }
  }
}
