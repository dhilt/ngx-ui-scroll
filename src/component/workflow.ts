import { Subscription, BehaviorSubject } from 'rxjs';

import { UiScrollComponent } from '../ui-scroll.component';
import { Scroller } from './scroller';
import { Process, ProcessStatus as Status, ProcessSubject } from './interfaces/index';
import {
  Init, Scroll, Reload, Append, Check,
  Start, PreFetch, Fetch, PostFetch, Render, Clip, Adjust, End
} from './processes/index';

export class Workflow {

  scroller: Scroller;
  process$: BehaviorSubject<ProcessSubject>;
  cyclesDone: number;

  readonly context: UiScrollComponent;
  readonly onScrollHandler: EventListener;
  private itemsSubscription: Subscription;
  private workflowSubscription: Subscription;
  private scrollEventOptions: any;

  constructor(context: UiScrollComponent) {
    this.context = context;
    this.scroller = new Scroller(this.context, this.callWorkflow.bind(this));
    this.process$ = new BehaviorSubject(<ProcessSubject>{
      process: Process.init,
      status: Status.start
    });
    this.cyclesDone = 0;
    this.onScrollHandler = event => Scroll.run(this.scroller, event);

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

  process(data: ProcessSubject) {
    const scroller = this.scroller;
    const { status, payload = {} } = data;
    const options = scroller.state.workflowOptions;
    this.scroller.logger.logProcess(data);
    if (status === Status.error) {
      End.run(scroller, payload.error);
      return;
    }
    switch (data.process) {
      case Process.init:
        if (status === Status.start) {
          Init.run(scroller, true);
        }
        if (status === Status.next) {
          Start.run(scroller);
        }
        break;
      case Process.scroll:
        if (status === Status.next) {
          if (!options.keepScroll) {
            Init.run(scroller);
          } else {
            Start.run(scroller);
          }
        }
        break;
      case Process.reload:
        if (status === Status.start) {
          Reload.run(scroller, payload);
        }
        if (status === Status.next) {
          Init.run(scroller, true);
        }
        break;
      case Process.append:
        if (status === Status.start) {
          Append.run(scroller, payload);
        }
        if (status === Status.next) {
          Init.run(scroller);
        }
        break;
      case Process.prepend:
        if (status === Status.start) {
          Append.run(scroller, { ...payload, prepend: true });
        }
        if (status === Status.next) {
          Init.run(scroller);
        }
        break;
      case Process.check:
        if (status === Status.start) {
          Check.run(scroller);
        }
        if (status === Status.next) {
          Init.run(scroller);
        }
        break;
      case Process.start:
        if (status === Status.next) {
          if (payload.noFetch) {
            Render.run(scroller);
          } else {
            PreFetch.run(scroller);
          }
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
          if (payload.noClip) {
            Adjust.run(scroller);
          } else {
            Clip.run(scroller);
          }
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
          if (options.keepScroll) {
            Scroll.run(scroller);
          } else {
            Start.run(scroller);
          }
        }
        if (status === Status.done) {
          this.done();
        }
        break;
    }
  }

  callWorkflow(processSubject: ProcessSubject) {
    this.process$.next(processSubject);
  }

  done() {
    const { state } = this.scroller;
    this.cyclesDone++;
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
  }

  finalize() {
  }

}
