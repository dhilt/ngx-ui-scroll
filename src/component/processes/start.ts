import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Start {

  static run(scroller: Scroller) {
    const { state, state: { workflowOptions, scrollState } } = scroller;

    state.loopPending = true;
    state.innerLoopCount++;
    if (!state.fetch.simulate) {
      state.fetch.reset();
    }
    state.doClip = false;
    scrollState.scroll = workflowOptions.scroll || false;
    scrollState.keepScroll = false;

    scroller.callWorkflow({
      process: Process.start,
      status: ProcessStatus.next
    });
  }

}
