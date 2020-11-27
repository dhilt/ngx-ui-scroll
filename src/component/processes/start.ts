import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Start {

  static process = Process.start;

  static run(scroller: Scroller) {
    const { state: { cycle, scrollState, fetch, clip, render }, adapter } = scroller;

    adapter.loopPending = true;
    scrollState.positionBeforeAsync = null;
    if (!fetch.simulate) {
      fetch.reset();
    }
    if (!clip.simulate) {
      clip.reset(clip.force);
    }
    render.reset();

    scroller.workflow.call({
      process: Process.start,
      status: ProcessStatus.next,
      payload: { ...(cycle.innerLoop.first ? { process: cycle.initiator } : {}) }
    });
  }

}
