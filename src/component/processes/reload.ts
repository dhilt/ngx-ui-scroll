import { Scroller } from '../scroller';
import { Process, ProcessStatus, ProcessSubject } from '../interfaces/index';

export default class Reload {

  static run(scroller: Scroller, reloadIndex: any) {
    scroller.state.process = Process.reload;

    const scrollPosition = scroller.viewport.scrollPosition;
    Reload.setCurrentStartIndex(scroller, reloadIndex);
    scroller.buffer.reset(true, scroller.state.startIndex);
    scroller.viewport.reset(scrollPosition);
    scroller.purgeCycleSubscriptions();
    // todo: do we need to emit Process.end before?
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.reload,
      status: ProcessStatus.next
    });
  }

  static setCurrentStartIndex(scroller: Scroller, newStartIndex: any) {
    const { state, settings: { startIndex, minIndex, maxIndex } } = scroller;
    let index = Number(newStartIndex);
    if (isNaN(index)) {
      scroller.logger.log(() =>
        `fallback startIndex to settings.startIndex (${startIndex}) because ${newStartIndex} is not a number`);
      index = startIndex;
    }
    if (index < minIndex) {
      scroller.logger.log(() => `setting startIndex to settings.minIndex (${minIndex}) because ${index} < ${minIndex}`);
      index = minIndex;
    }
    if (index > maxIndex) {
      scroller.logger.log(() => `setting startIndex to settings.maxIndex (${maxIndex}) because ${index} > ${maxIndex}`);
      index = maxIndex;
    }
    state.startIndex = index;
  }

}
