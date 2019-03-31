import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Start {

  static run(scroller: Scroller, process: Process) {
    const { state, state: { workflowOptions, scrollState, fetch } } = scroller;

    state.loopPending = true;
    state.innerLoopCount++;
    if (!fetch.simulate) {
      fetch.reset();
    }
    if (!state.simulateClip) {
      state.doClip = false;
    }
    scrollState.scroll = workflowOptions.scroll || false;
    scrollState.keepScroll = false;

    scroller.callWorkflow({
      process: Process.start,
      status: ProcessStatus.next,
      payload: process
    });
  }

}
