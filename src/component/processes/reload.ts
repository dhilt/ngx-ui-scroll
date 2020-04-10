import { Scroller } from '../scroller';
import { ADAPTER_METHODS, validate } from '../inputs/index';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Reload {

  static run(scroller: Scroller, reloadIndex: any) {
    const scrollPosition = scroller.viewport.scrollPosition;
    const methodData = validate({ reloadIndex }, ADAPTER_METHODS.RELOAD);
    const { reloadIndex: { value } } = methodData.params;
    scroller.state.setCurrentStartIndex(value);
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
