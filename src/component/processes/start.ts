import { Scroller } from '../scroller';
import { Process, ProcessSubject, ProcessRun } from '../interfaces/index';

export default class Start {

  static run(scroller: Scroller, options?: ProcessRun) {
    const { state } = scroller;
    state.startCycle(options);
    scroller.logger.log(() => {
      const logData = `${scroller.settings.instanceIndex}-${state.workflowCycleCount}-${state.cycleCount}`;
      return [`%c---=== Workflow ${logData} start`, 'color: #006600;'];
    });
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.start,
      status: 'next'
    });
  }

  // static setItemsToRemove(scroller: Scroller) {
  //   if (!scroller.buffer.size) {
  //     return;
  //   }
  //   const firstIndex = <number>scroller.state.fetch.firstIndex;
  //   const lastIndex = <number>scroller.state.fetch.lastIndex;
  //   scroller.buffer.items.forEach(item => {
  //     if (item.$index < firstIndex || item.$index > lastIndex) {
  //       item.toRemove = true;
  //       scroller.state.clip.shouldClip = true;
  //     }
  //   });
  // }
}
