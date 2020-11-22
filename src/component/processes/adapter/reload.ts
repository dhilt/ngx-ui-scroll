import { Scroller } from '../../scroller';
import { Process, ProcessStatus } from '../../interfaces/index';

export default class Reload {

  static process = Process.reload;

  static run(scroller: Scroller, reloadIndex: any) {
    const { viewport, state, buffer } = scroller;
    const scrollPosition = viewport.scrollPosition;

    state.setCurrentStartIndex(reloadIndex);
    buffer.reset(true, state.startIndex);
    viewport.reset(scrollPosition);

    const payload: any = {};
    if (scroller.adapter.isLoading) {
      scroller.scrollCleanup();
      payload.finalize = true;
      state.cycle.interrupter = Process.reload;
    }

    scroller.workflow.call({
      process: Process.reload,
      status: ProcessStatus.next,
      payload
    });
  }

}
