import { Scroller } from '../scroller';
import { Process, ProcessSubject, ProcessRun, Direction } from '../interfaces/index';

export default class End {

  static run(scroller: Scroller, isFail?: boolean) {
    scroller.state.endCycle();
    End.calculateParams(scroller);
    scroller.purgeCycleSubscriptions();
    scroller.finalize();

    let next: ProcessRun | null = null;
    const logData = `${scroller.settings.instanceIndex}-${scroller.state.wfCycleCount}-${scroller.state.cycleCount}`;
    if (isFail) {
      scroller.logger.log(`%c---=== Workflow ${logData} fail`, 'color: #006600;');
    } else {
      scroller.logger.log(`%c---=== Workflow ${logData} done`, 'color: #006600;');
      next = scroller.state.fetch.hasNewItems ? <ProcessRun> {
        scroll: scroller.state.scroll
      } : null;
    }

    // clip with no fetch, need to apply Buffer.items changes
    if (scroller.state.clip.shouldClip && !scroller.state.fetch.hasNewItems) {
      scroller.runChangeDetector();
    }

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.end,
      status: next ? 'next' : 'done',
      payload: next
    });
  }

  static calculateParams(scroller: Scroller) {
    const items = scroller.buffer.items;
    const length = items.length;
    const viewportBackwardEdge = scroller.viewport.getEdge(Direction.backward);
    const viewportForwardEdge = scroller.viewport.getEdge(Direction.forward);
    let index = null;
    for (let i = 0; i < length; i++) {
      const edge = scroller.viewport.getElementEdge(items[i].element, Direction.backward, true);
      if (edge > viewportBackwardEdge) {
        index = i;
        break;
      }
    }
    scroller.state.firstVisibleItem = index !== null ? {
      $index: items[index].$index,
      data: items[index].data,
      element: items[index].element
    } : {};

    index = null;
    for (let i = length - 1; i >= 0; i--) {
      const edge = scroller.viewport.getElementEdge(items[i].element, Direction.forward, true);
      if (edge < viewportForwardEdge) {
        index = i;
        break;
      }
    }
    scroller.state.lastVisibleItem = index !== null ? {
      $index: items[index].$index,
      data: items[index].data,
      element: items[index].element
    } : {};
  }
}
