import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Start {

  static run(scroller: Scroller, process: Process, payload?: { process: Process }) {
    const { state, state: { workflowOptions, scrollState, fetch, clip, render }, adapter } = scroller;
    const processToPass = payload && payload.process || process;

    adapter.loopPending = true;
    if (!fetch.simulate) {
      fetch.reset();
    }
    if (!clip.simulate && !clip.force) {
      clip.reset();
    }
    render.reset();

    scroller.workflow.call({
      process: Process.start,
      status: ProcessStatus.next,
      payload: { process: processToPass, noFetch: workflowOptions.noFetch }
    });
  }

}
