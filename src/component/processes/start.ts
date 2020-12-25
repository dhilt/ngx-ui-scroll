import { getBaseProcess } from './_base';
import { Scroller } from '../scroller';
import { CommonProcess, ProcessStatus } from '../interfaces/index';

export default class Start extends getBaseProcess(CommonProcess.start) {

  static run(scroller: Scroller) {
    const { state } = scroller;

    state.startInnerLoop();

    scroller.workflow.call({
      process: Start.process,
      status: ProcessStatus.next,
      payload: { ...(state.cycle.innerLoop.first ? { process: state.cycle.initiator } : {}) }
    });
  }

}
