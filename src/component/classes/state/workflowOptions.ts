import { WorkflowOptions as IWorkflowOptions } from '../../interfaces/index';
import { Settings } from '../settings';

export class WorkflowOptions implements IWorkflowOptions {
    empty: boolean;
    scroll: boolean;
    keepScroll: boolean;
    byTimer: boolean;
    noFetch: boolean;

    constructor(settings: Settings) {
      this.reset();
    }

    reset() {
      this.empty = false;
      this.scroll = false;
      this.keepScroll = false;
      this.byTimer = false;
      this.noFetch = false;
    }
  }
