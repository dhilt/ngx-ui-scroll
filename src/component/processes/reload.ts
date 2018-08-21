import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces/index';

export default class Reload {

  static run(scroller: Scroller, reloadIndex: any) {
    const scrollPosition = scroller.viewport.scrollPosition;
    Reload.setCurrentStartIndex(scroller, reloadIndex);
    scroller.buffer.reset(true, scroller.state.startIndex);
    scroller.viewport.reset();
    scroller.viewport.syntheticScrollPosition =
      scrollPosition !== scroller.viewport.scrollPosition ? scroller.viewport.scrollPosition : null;
    scroller.purgeCycleSubscriptions();
    // todo: do we need to emit Process.end before?
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.reload,
      status: 'next'
    });
  }

  static setCurrentStartIndex(scroller: Scroller, startIndex: any) {
    const { state, settings } = scroller;
    startIndex = Number(startIndex);
    state.startIndex = !isNaN(startIndex) ? startIndex : settings.startIndex;
    if (state.startIndex < settings.minIndex) {
      state.startIndex = settings.minIndex;
    }
  }
}
