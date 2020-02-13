import { Subscription, BehaviorSubject } from 'rxjs';

import { UiScrollComponent } from '../ui-scroll.component';
import { Scroller } from './scroller';
import { Process, ProcessStatus as Status, ProcessSubject, WorkflowError, ScrollerWorkflow, ProcessStatus } from './interfaces/index';
import {
  Init, Scroll, Reload, Append, Check, Remove, UserClip, Fix,
  Start, PreFetch, Fetch, PostFetch, Render, PreClip, Clip, Adjust, End
} from './processes/index';

export class Workflow {

  isInitialized: boolean;
  scroller: Scroller;
  process$: BehaviorSubject<ProcessSubject>;
  cyclesDone: number;
  interruptionCount: number;
  errors: Array<WorkflowError>;

  readonly context: UiScrollComponent;
  readonly onScrollHandler: EventListener;
  private itemsSubscription: Subscription;
  private workflowSubscription: Subscription;
  private scrollEventOptions: any;

  constructor(context: UiScrollComponent) {
    this.isInitialized = false;
    this.context = context;
    this.process$ = new BehaviorSubject(<ProcessSubject>{
      process: Process.init,
      status: Status.start
    });
    this.callWorkflow = <any>this.callWorkflow.bind(this);
    this.scroller = new Scroller(this.context, this.callWorkflow);
    this.cyclesDone = 0;
    this.interruptionCount = 0;
    this.errors = [];
    this.onScrollHandler = event => this.callWorkflow({
      process: Process.scroll,
      status: ProcessStatus.start,
      payload: event
    });

    if (this.scroller.settings.initializeDelay) {
      setTimeout(() => this.init(), this.scroller.settings.initializeDelay);
    } else {
      this.init();
    }
  }

  init() {
    this.scroller.init();
    this.scroller.logger.stat('initialization');
    this.initListeners();
    this.isInitialized = true;
  }

  initListeners() {
    const scroller = this.scroller;
    scroller.logger.log(() => `uiScroll Workflow listeners are being initialized`);
    this.itemsSubscription = scroller.buffer.$items.subscribe(items => this.context.items = items);
    this.workflowSubscription = this.process$.subscribe(this.process.bind(this));
    this.initScrollEventListener();
  }

  initScrollEventListener() {
    let passiveSupported = false;
    try {
      window.addEventListener(
        'test', <EventListenerOrEventListenerObject>{}, Object.defineProperty({}, 'passive', {
          get: () => passiveSupported = true
        })
      );
    } catch (err) {
    }
    this.scrollEventOptions = passiveSupported ? { passive: false } : false;
    this.scroller.viewport.scrollEventElement.addEventListener(
      'scroll', this.onScrollHandler, this.scrollEventOptions
    );
  }

  detachScrollEventListener() {
    this.scroller.viewport.scrollEventElement.removeEventListener(
      'scroll', this.onScrollHandler, this.scrollEventOptions
    );
  }

  runProcess() {
    return (process: any) =>
      (...args: any[]) => {
        if (this.scroller.settings.logProcessRun) {
          this.scroller.logger.log(() => ['run', process.name, ...args]);
        }
        process.run(this.scroller, ...args);
      };
  }

  processError(process: Process, message: string) {
    this.errors.push({
      process,
      message,
      time: this.scroller.state.time,
      loop: this.scroller.state.loopNext
    });
    this.scroller.logger.logError(message);
  }

  process(data: ProcessSubject) {
    const { status, process, payload: pay } = data;
    if (this.scroller.settings.logProcessRun) {
      this.scroller.logger.log(() => [
        '%cfire%c', ...['color: #cc7777;', 'color: #000000;'], process, `"${status}"`, ...(pay ? [pay] : [])
      ]);
    }
    const { payload = {} } = data;
    const options = this.scroller.state.workflowOptions;
    const run = this.runProcess();
    this.scroller.logger.logProcess(data);
    if (status === Status.error) {
      this.processError(process, payload.error || '');
      run(End)(process, payload);
      return;
    }
    switch (process) {
      case Process.init:
        if (status === Status.start) {
          run(Init)();
        }
        if (status === Status.next) {
          run(Start)(payload);
        }
        break;
      case Process.scroll:
        if (status === Status.start) {
          run(Scroll)(payload);
        }
        if (status === Status.next) {
          if (!options.keepScroll) {
            run(Init)(process);
          } else {
            run(Start)(process);
          }
        }
        break;
      case Process.reload:
        if (status === Status.start) {
          run(Reload)(payload);
        }
        if (status === Status.next) {
          this.interrupt(process);
          if (payload.finalize) {
            run(End)(process);
          } else {
            run(Init)(process);
          }
        }
        break;
      case Process.append:
        if (status === Status.start) {
          run(Append)(payload);
        }
        if (status === Status.next) {
          run(Init)(process);
        }
        break;
      case Process.prepend:
        if (status === Status.start) {
          run(Append)({ ...payload, prepend: true });
        }
        if (status === Status.next) {
          run(Init)(process);
        }
        break;
      case Process.check:
        if (status === Status.start) {
          run(Check)();
        }
        if (status === Status.next) {
          run(Init)(process);
        }
        break;
      case Process.remove:
        if (status === Status.start) {
          run(Remove)(payload);
        }
        if (status === Status.next) {
          run(Init)(process);
        }
        break;
      case Process.userClip:
        if (status === Status.start) {
          run(UserClip)(payload);
        }
        if (status === Status.next) {
          run(Init)(process);
        }
        break;
      case Process.fix:
        if (status === Status.start) {
          run(Fix)(payload);
        }
        if (status === Status.next) {
          run(Init)(process);
        }
        break;
      case Process.start:
        if (status === Status.next) {
          switch (payload) {
            case Process.append:
            case Process.prepend:
            case Process.check:
              run(Render)();
              break;
            case Process.remove:
              run(Clip)();
              break;
            case Process.userClip:
              run(PreFetch)(payload);
              break;
            default:
              if (options.noFetch) {
                run(End)(process);
              } else {
                run(PreFetch)();
              }
          }
        }
        break;
      case Process.preFetch:
        const userClip = payload === Process.userClip;
        if (status === Status.done && !userClip) {
          run(End)(process);
        }
        if (status === Status.next && !userClip) {
          run(Fetch)();
        }
        if (userClip) {
          run(PreClip)();
        }
        break;
      case Process.fetch:
        if (status === Status.next) {
          run(PostFetch)();
        }
        break;
      case Process.postFetch:
        if (status === Status.next) {
          run(Render)();
        }
        if (status === Status.done) {
          run(End)(process);
        }
        break;
      case Process.render:
        if (status === Status.next) {
          if (payload.noClip) {
            run(Adjust)();
          } else {
            run(PreClip)();
          }
        }
        break;
      case Process.preClip:
        if (status === Status.next) {
          if (payload.doClip) {
            run(Clip)();
          } else {
            run(Adjust)();
          }
        }
        break;
      case Process.clip:
        if (status === Status.next) {
          if (payload === Process.end) {
            run(End)();
          } else {
            run(Adjust)();
          }
        }
        break;
      case Process.adjust:
        if (status === Status.done) {
          run(End)(process);
        }
        break;
      case Process.end:
        this.scroller.finalize();
        if (status === Status.next) {
          switch (payload) {
            case Process.reload:
              this.done();
              run(Init)(payload);
              break;
            default:
              if (options.keepScroll) {
                run(Scroll)();
              } else {
                run(Start)(process);
              }
          }
        } else if (status === Status.done) {
          this.done();
        }
        break;
    }
  }

  callWorkflow(processSubject: ProcessSubject) {
    // this.scroller.logger.log(() => {
    //   const { process, status, payload } = processSubject;
    //   return ['%ccall%c', ...['color: #77cc77;', 'color: #000000;'], process, `"${status}"`, ...(payload ? [payload] : [])];
    // });
    this.process$.next(processSubject);
  }

  interrupt(process?: Process) {
    const { scroller } = this;
    if (scroller.state.isLoading) {
      scroller.workflow.call = (p?: ProcessSubject) => scroller.logger.log('[skip wf call]');
      (<any>scroller.workflow.call).interrupted = true;
      scroller.workflow = <ScrollerWorkflow>{ call: <Function>this.callWorkflow };
      this.interruptionCount++;
      scroller.logger.log(() =>
        `workflow had been interrupted by the ${process} process (${this.interruptionCount})`
      );
    }
  }

  done() {
    const { state } = this.scroller;
    this.cyclesDone++;
    this.scroller.logger.logCycle(false);
    state.workflowCycleCount = this.cyclesDone + 1;
    state.isInitialWorkflowCycle = false;
    state.workflowPending = false;
    if (state.scrollState.scrollTimer === null) {
      state.isLoading = false;
    }
    this.finalize();
  }

  dispose() {
    this.detachScrollEventListener();
    this.process$.complete();
    this.workflowSubscription.unsubscribe();
    this.itemsSubscription.unsubscribe();
    this.scroller.dispose();
    this.isInitialized = false;
  }

  finalize() {
  }

}
