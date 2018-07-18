import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces/index';

export default class Reload {

  static run(scroller: Scroller, reloadIndex: any) {
    const scrollPosition = scroller.viewport.scrollPosition;
    scroller.buffer.reset(true);
    scroller.viewport.reset();
    scroller.viewport.syntheticScrollPosition = scrollPosition > 0 ? 0 : null;
    scroller.purgeCycleSubscriptions();
    Reload.setCurrentStartIndex(scroller, reloadIndex);
    // todo: do we need to emit Process.end before?
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.reload,
      status: 'next'
    });
  }

  static setCurrentStartIndex(scroller: Scroller, startIndex: any) {
    startIndex = Number(startIndex);
    scroller.state.startIndex = !isNaN(startIndex) ? startIndex : scroller.settings.startIndex;
    if (scroller.state.startIndex < scroller.settings.minIndex) {
      scroller.state.startIndex = scroller.settings.minIndex;
    }
  }
}
