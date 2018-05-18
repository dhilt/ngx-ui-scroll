import { Subscription } from 'rxjs/Subscription';

import { Scroller } from './scroller';
import { Process, ProcessSubject, Proc } from './interfaces/index';
import {
  Init, Scroll, Reload, Start, PreFetch, Fetch, PostFetch, Render, PostRender, PreClip, Clip, End
} from './processes/index';

export class Workflow {

  readonly context;
  private onScrollUnsubscribe: Function;
  private itemsSubscription: Subscription;
  private workflowSubscription: Subscription;

  public scroller: Scroller;
  public cyclesDone: number;

  constructor(context) {
    this.context = context;
    this.scroller = new Scroller(this.context);
    this.cyclesDone = 0;
    this.subscribe();
    setTimeout(() => this.runWorkflow());
  }

  runWorkflow() {
    const scroller = this.scroller;
    this.workflowSubscription = scroller.process$.subscribe((data: ProcessSubject) => {
      scroller.log('process ' + data.process + ', ' + data.status);
      if (data.status === 'error') {
        End.run(scroller, true);
        return;
      }
      switch (data.process) {
        case Process.init:
          if (data.status === 'start') {
            Init.run(scroller);
          }
          if (data.status === 'next') {
            Start.run(scroller);
          }
          break;
        case Process.scroll:
          if (data.status === 'start') {
            Scroll.run(scroller);
          }
          if (data.status === 'next') {
            Start.run(scroller, data.payload);
          }
          break;
        case Process.reload:
          if (data.status === 'start') {
            Reload.run(scroller, data.payload);
          }
          if (data.status === 'next') {
            Init.run(scroller);
          }
          break;
        case Process.start:
          if (data.status === 'next') {
            PreFetch.run(scroller);
          }
          break;
        case Process.preFetch:
          if (data.status === 'next') {
            Fetch.run(scroller);
          }
          if (data.status === 'done') {
            End.run(scroller);
          }
          break;
        case Process.fetch:
          if (data.status === 'next') {
            PostFetch.run(scroller);
          }
          break;
        case Process.postFetch:
          if (data.status === 'next') {
            Render.run(scroller);
          }
          if (data.status === 'done') {
            End.run(scroller);
          }
          break;
        case Process.render:
          if (data.status === 'next') {
            PostRender.run(scroller);
          }
          break;
        case Process.postRender:
          if (data.status === 'next') {
            PreClip.run(scroller);
          }
          break;
        case Process.preClip:
          if (data.status === 'next') {
            Clip.run(scroller);
          }
          if (data.status === 'done') {
            End.run(scroller);
          }
          break;
        case Process.clip:
          if (data.status === 'next') {
            End.run(scroller);
          }
          break;
        case Process.end:
          if (data.status === 'next') {
            Start.run(scroller, data.payload);
          }
          if (data.status === 'done') {
            this.done();
          }
          break;
      }
    });
  }

  subscribe() {
    this.onScrollUnsubscribe =
      this.context.renderer.listen(this.scroller.viewport.scrollable, 'scroll', this.scroll.bind(this));
    this.itemsSubscription = this.scroller.buffer.$items.subscribe(items => this.context.items = items);
  }

  dispose() {
    this.onScrollUnsubscribe();
    this.itemsSubscription.unsubscribe();
    this.workflowSubscription.unsubscribe();
    this.scroller.dispose();
  }

  scroll() {
    const viewport = this.scroller.viewport;
    if (viewport.syntheticScrollPosition === viewport.scrollPosition) {
      const ssp = viewport.scrollPosition;
      setTimeout(() => {
        if (ssp === viewport.scrollPosition) {
          viewport.syntheticScrollPosition = null;
        }
      });
      return;
    }
    this.scroller.process$.next(<ProcessSubject>{
      process: Process.scroll,
      status: 'start'
    });
  }

  done() {
    this.cyclesDone++;
    this.scroller.log(`~~~~~~ WF Run ${this.cyclesDone} FINALIZED ~~~~~~`);
    this.finalize();
  }

  finalize() {
  }

}
