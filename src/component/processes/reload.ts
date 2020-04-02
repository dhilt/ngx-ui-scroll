import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Reload {

  static run(scroller: Scroller, reloadIndex: any) {
    const scrollPosition = scroller.viewport.scrollPosition;
    scroller.state.setCurrentStartIndex(reloadIndex);
    scroller.buffer.reset(true, scroller.state.startIndex);
    const payload: any = {};
    if (scroller.adapter.isLoading) {
      scroller.purgeScrollTimers();
      payload.finalize = true;
    }
    scroller.viewport.reset(scrollPosition);
    scroller.workflow.call({
      process: Process.reload,
      status: ProcessStatus.next,
      payload
    });
  }

}
