import { getBaseAdapterProcess } from './_base';
import { Scroller } from '../../scroller';
import { AdapterProcess, ProcessStatus } from '../../interfaces/index';

export default class Reload extends getBaseAdapterProcess(AdapterProcess.reload) {

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
      state.cycle.interrupter = Reload.process;
    }

    scroller.workflow.call({
      process: Reload.process,
      status: ProcessStatus.next,
      payload
    });
  }

}
