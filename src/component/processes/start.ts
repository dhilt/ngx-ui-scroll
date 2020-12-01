import { getBaseProcess } from './_base';
import { Scroller } from '../scroller';
import { CommonProcess, ProcessStatus } from '../interfaces/index';

export default class Start extends getBaseProcess(CommonProcess.start) {

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
      process: Start.process,
      status: ProcessStatus.next,
      payload: { ...(cycle.innerLoop.first ? { process: cycle.initiator } : {}) }
    });
  }

}
