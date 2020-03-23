import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Start {

  static run(scroller: Scroller, process: Process) {
    const { state, state: { workflowOptions, scrollState, fetch, clip, render }, adapter } = scroller;

    adapter.loopPending = true;
    if (!fetch.simulate) {
      fetch.reset();
    }
    if (!clip.simulate && !clip.force) {
      clip.reset();
    }
    render.reset();
    scrollState.scroll = workflowOptions.scroll || false;
    scrollState.keepScroll = false;

    scroller.workflow.call({
      process: Process.start,
      status: ProcessStatus.next,
      payload: { process, noFetch: workflowOptions.noFetch }
    });
  }

}
