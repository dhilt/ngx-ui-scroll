import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Scroller } from './scroller';
import { runStateMachine } from './workflow-transducer';
import {
  IDatasource,
  Process,
  ProcessStatus as Status,
  ProcessSubject,
  ProcessStatus,
  WorkflowError,
  ScrollerWorkflow,
  InterruptParams,
  StateMachineMethods
} from './interfaces/index';

export class Workflow {

  isInitialized: boolean;
  scroller: Scroller;
  process$: BehaviorSubject<ProcessSubject>;
  cyclesDone: number;
  interruptionCount: number;
  errors: Array<WorkflowError>;

  readonly propagateChanges: Function;
  readonly onScrollHandler: EventListener;
  private stateMachineMethods: StateMachineMethods;
  private dispose$: Subject<void>;

  constructor(element: HTMLElement, datasource: IDatasource, version: string, run: Function) {
    this.isInitialized = false;
    this.dispose$ = new Subject();
    this.process$ = new BehaviorSubject(<ProcessSubject>{
      process: Process.init,
      status: Status.start
    });
    this.propagateChanges = run;
    this.callWorkflow = <any>this.callWorkflow.bind(this);
    this.scroller = new Scroller(element, datasource, version, this.callWorkflow);
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
    this.isInitialized = true;

    // propagate the item list to the view
    this.scroller.buffer.$items.pipe(
      takeUntil(this.dispose$)
    ).subscribe(items => this.propagateChanges(items));

    // run the workflow process
    this.process$.pipe(
      takeUntil(this.dispose$)
    ).subscribe(this.process.bind(this));

    this.initScrollEventListener();
  }

  initScrollEventListener() {
    let scrollEventOptions: any = false;
    try {
      window.addEventListener(
        'test', <EventListenerOrEventListenerObject>{}, Object.defineProperty({}, 'passive', {
          get: () => scrollEventOptions = { passive: false }
        })
      );
    } catch (err) {
    }
    this.scroller.viewport.scrollEventElement.addEventListener(
      'scroll', this.onScrollHandler, scrollEventOptions
    );
    this.dispose$.subscribe(() =>
      this.scroller.viewport.scrollEventElement.removeEventListener(
        'scroll', this.onScrollHandler, scrollEventOptions
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

  interrupt({ process, finalize, datasource }: InterruptParams) {
    if (finalize) {
      const { workflow, logger } = this.scroller;
      // we are going to create a new reference for the scroller.workflow object
      // calling the old version of the scroller.workflow by any outstanding async processes will be skipped
      workflow.call = (p?: ProcessSubject) => logger.log('[skip wf call]');
      (<any>workflow.call).interrupted = true;
      this.scroller.workflow = <ScrollerWorkflow>{ call: <Function>this.callWorkflow };
      this.interruptionCount++;
      logger.log(() =>
        `workflow had been interrupted by the ${process} process (${this.interruptionCount})`
      );
    }
    if (datasource) {
      this.scroller.logger.log('new Scroller instantiation');
      const {
        viewport: { element },
        state: { version, isLoading },
        workflow: { call },
        buffer: { $items }
      } = this.scroller;
      this.scroller = new Scroller(element, datasource, version, call, $items);
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
