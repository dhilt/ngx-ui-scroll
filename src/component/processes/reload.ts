import { Scroller } from '../scroller';
import { Process, ProcessStatus, ProcessSubject } from '../interfaces/index';

export default class Reload {

  static run(scroller: Scroller, reloadIndex: any) {
    const scrollPosition = scroller.viewport.scrollPosition;
    scroller.state.setCurrentStartIndex(reloadIndex);
    scroller.buffer.reset(true, scroller.state.startIndex);
    scroller.viewport.reset(scrollPosition);
    scroller.purgeCycleSubscriptions();
    scroller.purgeTimers();
    // todo: do we need to have Process.end before?
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.reload,
      status: ProcessStatus.next
    });
  }

}
