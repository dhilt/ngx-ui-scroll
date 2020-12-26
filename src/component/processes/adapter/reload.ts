import { getBaseAdapterProcess } from './_base';
import { Scroller } from '../../scroller';
import { AdapterProcess, ProcessStatus } from '../../interfaces/index';

export default class Reload extends getBaseAdapterProcess(AdapterProcess.reload) {

  static run(scroller: Scroller, reloadIndex: any) {
    const { viewport, state, buffer } = scroller;
    const scrollPosition = viewport.scrollPosition;

    const { params } = Reload.parseInput(scroller, { reloadIndex }, true);
    reloadIndex = params ? params.reloadIndex : void 0;

    buffer.reset(true, reloadIndex);
    viewport.reset(buffer.startIndex, scrollPosition);

    const payload: any = {};
    if (state.cycle.busy.get()) {
      state.scrollState.cleanupTimers();
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
