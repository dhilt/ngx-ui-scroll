import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces/index';

export default class Reload {

  static run(scroller: Scroller, reloadIndex: any) {
    const scrollPosition = scroller.viewport.scrollPosition;
    scroller.buffer.reset(true);
    scroller.viewport.reset();
    scroller.viewport.syntheticScrollPosition = scrollPosition > 0 ? 0 : null;
    scroller.state.direction = null;
    scroller.purgeCycleSubscriptions();
    scroller.purgeScrollDelaySubscription();
    scroller.settings.setCurrentStartIndex(reloadIndex);
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.reload,
      status: 'next'
    });
  }
}
