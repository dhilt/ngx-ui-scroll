import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Start {

  static run(scroller: Scroller) {
    const { state, state: { workflowOptions, scrollState, fetch } } = scroller;

    state.loopPending = true;
    state.innerLoopCount++;
    if (!fetch.simulate) {
      fetch.reset();
    }
    state.doClip = false;
    scrollState.scroll = workflowOptions.scroll || false;
    scrollState.keepScroll = false;

    scroller.callWorkflow({
      process: Process.start,
      status: ProcessStatus.next,
      payload: { noFetch: fetch.simulate }
    });
  }

}
