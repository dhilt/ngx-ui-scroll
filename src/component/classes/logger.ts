import { Scroller } from '../scroller';

export class Logger {

  readonly debug: boolean;
  readonly immediateLog: boolean;
  readonly logTime: boolean;
  readonly getTime: Function;
  readonly getStat: Function;
  private logs: Array<any> = [];

  constructor(scroller: Scroller) {
    const { settings } = scroller;
    this.debug = settings.debug;
    this.immediateLog = settings.immediateLog;
    this.logTime = settings.logTime;
    this.getTime = () => ` // time: ${scroller.state.time}`;
    this.getStat = () =>
      'top: ' + scroller.viewport.scrollPosition + ', ' +
      'size: ' + scroller.viewport.getScrollableSize() + ', ' +
      'bwd_p: ' + scroller.viewport.padding.backward.size + ', ' +
      'fwd_p: ' + scroller.viewport.padding.forward.size + ', ' +
      'items: ' + scroller.datasource.adapter.itemsCount;
  }

  stat(str?: string) {
    if (this.debug) {
      this.log((str ? str + ', ' : '') + this.getStat());
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
