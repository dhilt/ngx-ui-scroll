import { WorkflowOptions as IWorkflowOptions } from '../../interfaces/index';
import { Settings } from '../settings';

export class WorkflowOptions implements IWorkflowOptions {
    keepScroll: boolean;
    byTimer: boolean;
    noFetch: boolean;

    constructor(settings: Settings) {
      this.reset();
    }

    reset() {
      this.keepScroll = false;
      this.byTimer = false;
      this.noFetch = false;
    }
  }
