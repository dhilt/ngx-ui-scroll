import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UiScrollComponent } from '../ui-scroll.component';
import { Scroller } from './scroller';
import { runStateMachine } from './workflow-transducer';
import {
  Process, ProcessStatus as Status, ProcessSubject, WorkflowError, ScrollerWorkflow, ProcessStatus
} from './interfaces/index';

export class Workflow {

  isInitialized: boolean;
  scroller: Scroller;
  process$: BehaviorSubject<ProcessSubject>;
  cyclesDone: number;
  interruptionCount: number;
  errors: Array<WorkflowError>;

  readonly context: UiScrollComponent;
  readonly onScrollHandler: EventListener;
  private stateMachineMethods: any;
  private scrollEventOptions: any;
  private dispose$: Subject<void>;

  constructor(context: UiScrollComponent) {
    this.isInitialized = false;
    this.context = context;
    this.dispose$ = new Subject();
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
      payload: { event }
    });
    this.stateMachineMethods = {
      run: this.runProcess(),
      interrupt: this.interrupt.bind(this),
      done: this.done.bind(this),
      onError: this.onError.bind(this)
    };

    if (this.scroller.settings.initializeDelay) {
      setTimeout(() => this.init(), this.scroller.settings.initializeDelay);
    } else {
      this.init();
    }
  }

  init() {
    this.scroller.init();
    this.scroller.logger.stat('initialization');
    this.isInitialized = true;
    this.initWorkflowListeners();
    this.initScrollEventListener();
  }

  initWorkflowListeners() {
    this.scroller.logger.log(() => `uiScroll Workflow listeners initialization`);

    // propagate the item list to the view
    this.scroller.buffer.$items.pipe(
      takeUntil(this.dispose$)
    ).subscribe(items => this.context.items = items);

    // run the workflow
    this.process$.pipe(
      takeUntil(this.dispose$)
    ).subscribe(this.process.bind(this));
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
    this.dispose$.subscribe(() =>
      this.scroller.viewport.scrollEventElement.removeEventListener(
        'scroll', this.onScrollHandler, this.scrollEventOptions
      )
    );
  }

  callWorkflow(processSubject: ProcessSubject) {
    if (!this.isInitialized) {
      return;
    }
    // this.scroller.logger.log(() => {
    //   const { process, status, payload } = processSubject;
    //   return ['%ccall%c', ...['color: #77cc77;', 'color: #000000;'], process, `"${status}"`, ...(payload ? [payload] : [])];
    // });
    this.process$.next(processSubject);
  }

  process(data: ProcessSubject) {
    const { status, process, payload } = data;
    if (this.scroller.settings.logProcessRun) {
      this.scroller.logger.log(() => [
        '%cfire%c', ...['color: #cc7777;', 'color: #000000;'], process, `"${status}"`, ...(payload ? [payload] : [])
      ]);
    }
    this.scroller.logger.logProcess(data);
    if (process === Process.end) {
      this.scroller.finalize();
    }
    runStateMachine({
      input: data,
      methods: this.stateMachineMethods
    });
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

  onError(process: Process, payload: any) {
    const message: string = payload && payload.error || '';
    this.errors.push({
      process,
      message,
      time: this.scroller.state.time,
      loop: this.scroller.state.loopNext
    });
    this.scroller.logger.logError(message);
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
    this.dispose$.next();
    this.dispose$.complete();
    this.scroller.dispose();
    this.isInitialized = false;
  }

  finalize() {
  }

}
