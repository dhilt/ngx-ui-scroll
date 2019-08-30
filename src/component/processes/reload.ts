import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Reload {

  static run(scroller: Scroller, reloadIndex: any) {
    const { viewport, buffer, state } = scroller;
    const scrollPosition = viewport.scrollPosition;
    state.setCurrentStartIndex(reloadIndex);
    buffer.reset(true, state.startIndex);
    viewport.reset(scrollPosition);
    const payload: any = {};
    if (state.isLoading) {
      scroller.purgeScrollTimers();
      payload.finalize = true;
    }
    scroller.callWorkflow({
      process: Process.reload,
      status: ProcessStatus.next,
      payload
    });
  }

}
