import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Start {

  static process = Process.start;

  static run(scroller: Scroller, process: Process, payload?: { process: Process }) {
    const { state, state: { scrollState, fetch, clip, render, adjust }, adapter } = scroller;
    const processToPass = payload && payload.process || process;

    adapter.loopPending = true;
    scrollState.positionBeforeAsync = null;
    if (!fetch.simulate) {
      fetch.reset();
    }
    if (!clip.simulate && !clip.force) {
      clip.reset();
    }
    render.reset();
    adjust.reset();

    scroller.workflow.call({
      process: Process.start,
      status: ProcessStatus.next,
      payload: { process: processToPass }
    });
  }

}
