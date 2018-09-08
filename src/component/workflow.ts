import { Subscription, BehaviorSubject } from 'rxjs';

import { UiScrollComponent } from '../ui-scroll.component';
import { Scroller } from './scroller';
import { ScrollHelper } from './classes/scrollHelper';
import { Process, ProcessStatus as Status, ProcessSubject } from './interfaces/index';
import { Init, Reload, Start, PreFetch, Fetch, PostFetch, Render, Clip, Adjust, End } from './processes/index';

export class Workflow {

  scroller: Scroller;
  process$: BehaviorSubject<ProcessSubject>;
  cyclesDone: number;

  readonly context: UiScrollComponent;
  readonly scrollHelper: ScrollHelper;
  private itemsSubscription: Subscription;
  private workflowSubscription: Subscription;

  constructor(context: UiScrollComponent) {
    this.context = context;
    this.scroller = new Scroller(this.context, this.callWorkflow.bind(this));
    this.scrollHelper = new ScrollHelper(this);
    this.process$ = new BehaviorSubject(<ProcessSubject>{
      process: Process.init,
      status: Status.start
    });
    this.cyclesDone = 0;
    setTimeout(() => {
      this.scroller.logger.log(() => `uiScroll Workflow listeners are being initialized`);
      this.initListeners();
    });
  }

  initListeners() {
    const scroller = this.scroller;
    this.itemsSubscription = scroller.buffer.$items.subscribe(items => this.context.items = items);
    this.workflowSubscription = this.process$.subscribe(this.process.bind(this));
    this.scrollHelper.addScrollHandler();
  }

  dispose() {
    this.scrollHelper.purgeProcesses();
    this.scrollHelper.removeScrollHandler();
    this.process$.complete();
    this.workflowSubscription.unsubscribe();
    this.itemsSubscription.unsubscribe();
    this.scroller.dispose();
  }

  callWorkflow(processSubject: ProcessSubject) {
    this.process$.next(processSubject);
  }

  process(data: ProcessSubject) {
    const scroller = this.scroller;
    const { status } = data;
    scroller.logger.log(() => [
      `process ${data.process}, ${status}` +
      (data.payload && typeof data.payload !== 'object' ? ',' : ''),
      ...(data.payload ? [data.payload] : [])
    ]);
    if (status === Status.error) {
      End.run(scroller, true);
      return;
    }
    switch (data.process) {
      case Process.init:
        if (status === Status.start) {
          Init.run(scroller);
        }
        if (status === Status.next) {
          Start.run(scroller, data.payload);
        }
        break;
      case Process.reload:
        if (status === Status.start) {
          Reload.run(scroller, data.payload);
        }
        if (status === Status.next) {
          Init.run(scroller);
        }
        break;
      case Process.scroll:
        if (status === Status.next) {
          Init.run(scroller, data.payload);
        }
        break;
      case Process.start:
        if (status === Status.next) {
          PreFetch.run(scroller);
        }
        break;
      case Process.preFetch:
        if (status === Status.done) {
          End.run(scroller);
        }
        if (status === Status.next) {
          Fetch.run(scroller);
        }
        break;
      case Process.fetch:
        if (status === Status.next) {
          PostFetch.run(scroller);
        }
        break;
      case Process.postFetch:
        if (status === Status.next) {
          Render.run(scroller);
        }
        if (status === Status.done) {
          End.run(scroller);
        }
        break;
      case Process.render:
        if (status === Status.next) {
          Clip.run(scroller);
        }
        break;
      case Process.clip:
        if (status === Status.next) {
          Adjust.run(scroller);
        }
        break;
      case Process.adjust:
        if (status === Status.done) {
          End.run(scroller);
        }
        break;
      case Process.end:
        if (status === Status.next) {
          Start.run(scroller, data.payload);
        }
        if (status === Status.done) {
          this.done();
        }
        break;
    }
  }

  done() {
    this.cyclesDone++;
    this.scroller.state.workflowCycleCount = this.cyclesDone + 1;
    this.scroller.state.isInitialWorkflowCycle = false;
    this.scroller.logger.log(() => {
      const logData = `${this.scroller.settings.instanceIndex}-${this.cyclesDone}`;
      const logStyles = 'color: #0000aa; border: solid #555 1px; border-width: 0 0 1px 1px; margin-left: -2px';
      return [`%c   ~~~ WF Run ${logData} FINALIZED ~~~  `, logStyles];
    });
    this.finalize();
  }

  finalize() {
  }

}
