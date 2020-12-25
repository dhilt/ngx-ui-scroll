import eventBus, { Emitter, EVENTS } from './event-bus';
import { Scroller } from './scroller';
import { runStateMachine } from './workflow-transducer';
import { Item } from './classes/item';
import {
  IDatasource,
  CommonProcess,
  Process,
  ProcessStatus as Status,
  ProcessSubject,
  ProcessStatus,
  WorkflowError,
  InterruptParams,
  StateMachineMethods,
  ScrollerWorkflow,
} from './interfaces/index';

export class Workflow {

  isInitialized: boolean;
  events: Emitter;
  scroller: Scroller;
  cyclesDone: number;
  interruptionCount: number;
  errors: WorkflowError[];

  readonly propagateChanges: Function;
  private stateMachineMethods: StateMachineMethods;

  constructor(element: HTMLElement, datasource: IDatasource, version: string, run: Function) {
    this.isInitialized = false;
    this.events = eventBus();
    this.propagateChanges = run;
    this.scroller = new Scroller(element, datasource, version, this.getUpdater());
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
    this.scroller.init(this.events);
    this.isInitialized = true;

    // run the Workflow
    this.callWorkflow({
      process: CommonProcess.init,
      status: Status.start
    });

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
      this.events.all.clear();
      scrollEventReceiver.removeEventListener('scroll', onScrollHandler);
    });
  }

  changeItems(items: Item[]) {
    this.propagateChanges(items);
  }

  callWorkflow(processSubject: ProcessSubject) {
    if (!this.isInitialized) {
      return;
    }
    if (processSubject.process && processSubject.process.startsWith('adapter')) {
      this.events.emit(EVENTS.WORKFLOW.RUN_ADAPTER, processSubject);
    }
    this.process(processSubject);
  }

  getUpdater(): ScrollerWorkflow {
    return {
      call: this.callWorkflow.bind(this),
      onDataChanged: this.changeItems.bind(this),
    };
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
      this.scroller.workflow = this.getUpdater();
      this.interruptionCount++;
      logger.log(() => `workflow had been interrupted by the ${process} process (${this.interruptionCount})`);
    }
    if (datasource) { // Scroller re-initialization case
      this.scroller.adapter.relax(() => {
        this.scroller.logger.log('new Scroller instantiation');
        const { viewport: { element }, state: { version }, workflow } = this.scroller;
        const scroller = new Scroller(element, datasource, version, workflow, this.scroller);
        this.scroller.dispose();
        this.scroller = scroller;
        this.scroller.init(this.events);
      });
    }
  }

  done() {
    const { state, logger } = this.scroller;
    this.cyclesDone++;
    logger.logCycle(false);
    state.cycle.done(this.cyclesDone + 1);
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
