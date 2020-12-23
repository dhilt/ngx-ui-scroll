import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import eventBus, { Emitter, EVENTS } from './event-bus';
import { Scroller } from './scroller';
import { runStateMachine } from './workflow-transducer';
import {
  IDatasource,
  CommonProcess,
  Process,
  ProcessStatus as Status,
  ProcessSubject,
  ProcessStatus,
  WorkflowError,
  InterruptParams,
  StateMachineMethods
} from './interfaces/index';

export class Workflow {

  isInitialized: boolean;
  events: Emitter;
  scroller: Scroller;
  process$: BehaviorSubject<ProcessSubject>;
  cyclesDone: number;
  interruptionCount: number;
  errors: WorkflowError[];

  readonly propagateChanges: Function;
  private stateMachineMethods: StateMachineMethods;

  constructor(element: HTMLElement, datasource: IDatasource, version: string, run: Function) {
    this.isInitialized = false;
    this.events = eventBus();
    this.process$ = new BehaviorSubject({
      process: CommonProcess.init,
      status: Status.start
    } as ProcessSubject);
    this.propagateChanges = run;
    this.callWorkflow = this.callWorkflow.bind(this);
    this.scroller = new Scroller(element, datasource, version, this.callWorkflow);
    this.cyclesDone = 0;
    this.interruptionCount = 0;
    this.errors = [];
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
    const onAdapterRun$ = this.process$.pipe(
      filter(({ process }) => process.startsWith('adapter'))
    );

    this.scroller.init(this.events, onAdapterRun$);
    this.isInitialized = true;

    // propagate item list to the view
    const itemsSub = this.scroller.buffer.$items.subscribe(items =>
      this.propagateChanges(items)
    );

    // run the workflow process
    const processSub = this.process$.subscribe(this.process.bind(this));

    // set up scroll event listener
    const { scrollEventReceiver } = this.scroller.viewport;
    const onScrollHandler: EventListener =
      event => this.callWorkflow({
        process: CommonProcess.scroll,
        status: ProcessStatus.start,
        payload: { event }
      });
    scrollEventReceiver.addEventListener('scroll', onScrollHandler);

    // disposing
    this.events.on(EVENTS.WORKFLOW.DISPOSE, () => {
      itemsSub.unsubscribe();
      processSub.unsubscribe();
      scrollEventReceiver.removeEventListener('scroll', onScrollHandler);
    });
  }

  callWorkflow(processSubject: ProcessSubject) {
    if (!this.isInitialized) {
      return;
    }
    this.process$.next(processSubject);
  }

  process(data: ProcessSubject) {
    const { status, process, payload } = data;
    if (this.scroller.settings.logProcessRun) {
      this.scroller.logger.log(() => [
        '%cfire%c', ...['color: #cc7777;', 'color: #000000;'],
        process, `"${status}"`, ...(payload !== void 0 ? [payload] : [])
      ]);
    }
    this.scroller.logger.logProcess(data);

    if (process === CommonProcess.end) {
      this.scroller.finalize();
    }
    runStateMachine({
      input: data,
      methods: this.stateMachineMethods
    });
  }

  runProcess() {
    return ({ run, process, name }: any) =>
      (...args: any[]) => {
        if (this.scroller.settings.logProcessRun) {
          this.scroller.logger.log(() => [
            '%crun%c', ...['color: #333399;', 'color: #000000;'],
            process || name, ...args
          ]);
        }
        run(this.scroller, ...args);
      };
  }

  onError(process: Process, payload: any) {
    const message: string = payload && payload.error || '';
    const { time, cycle } = this.scroller.state;
    this.errors.push({
      process,
      message,
      time,
      loop: cycle.loopIdNext
    });
    this.scroller.logger.logError(message);
  }

  interrupt({ process, finalize, datasource }: InterruptParams) {
    if (finalize) {
      const { workflow, logger } = this.scroller;
      // we are going to create a new reference for the scroller.workflow object
      // calling the old version of the scroller.workflow by any outstanding async processes will be skipped
      workflow.call = (p: ProcessSubject) => logger.log('[skip wf call]');
      workflow.call.interrupted = true;
      this.scroller.workflow = { call: this.callWorkflow };
      this.interruptionCount++;
      logger.log(() => `workflow had been interrupted by the ${process} process (${this.interruptionCount})`);
    }
    if (datasource) { // Scroller re-initialization case
      this.scroller.adapter.relax(() => {
        this.scroller.logger.log('new Scroller instantiation');
        const { viewport: { element }, state: { version }, workflow: { call } } = this.scroller;
        const scroller = new Scroller(element, datasource, version, call, this.scroller);
        this.scroller.dispose();
        this.scroller = scroller;
        this.scroller.init(this.events);
      });
    }
  }

  done() {
    const { state, adapter } = this.scroller;
    this.cyclesDone++;
    this.scroller.logger.logCycle(false);
    state.cycle.done(this.cyclesDone + 1);
    adapter.isLoading = false;
    this.finalize();
  }

  dispose() {
    this.events.emit(EVENTS.WORKFLOW.DISPOSE);
    this.scroller.dispose(true);
    this.isInitialized = false;
  }

  finalize() {
  }

}
