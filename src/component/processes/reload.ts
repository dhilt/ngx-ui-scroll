import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Reload {

  static run(scroller: Scroller, reloadIndex: any) {
    const scrollPosition = scroller.viewport.scrollPosition;
    scroller.state.setCurrentStartIndex(reloadIndex);
    scroller.buffer.reset(true, scroller.state.startIndex);
    scroller.viewport.reset(scrollPosition);
    let payload: any = {};
    if (scroller.state.isLoading) {
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
