import { Scroller } from '../scroller';
import { Process, ProcessSubject, ProcessRun, Direction } from '../interfaces/index';

export default class End {

  static run(scroller: Scroller, isFail?: boolean) {
    scroller.state.process = Process.end;

    const { state } = scroller;
    state.endCycle();
    state.lastPosition = scroller.viewport.scrollPosition;
    End.calculateParams(scroller);
    scroller.purgeCycleSubscriptions();
    scroller.finalize();

    let next: ProcessRun | null = null;
    scroller.logger.log(() => {
      const logData = `${scroller.settings.instanceIndex}-${state.workflowCycleCount}-${state.cycleCount}`;
      return isFail ?
        [`%c---=== Workflow ${logData} fail`, 'color: #006600;'] :
        [`%c---=== Workflow ${logData} done`, 'color: #006600;'];
    });
    if (!isFail) {
      next = state.fetch.hasNewItems && !state.scroll ? <ProcessRun> {
        scroll: state.scroll
      } : null;
    }

    // need to apply Buffer.items changes if clip
    if (state.clip) {
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
