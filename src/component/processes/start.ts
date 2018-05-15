import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject, Run } from '../interfaces/index';

export default class Start {

  static run(scroller: Scroller, options: Run = {}) {
    if (!options.direction) {
      options.direction = scroller.state.direction || Direction.forward;
    }
    scroller.state.startCycle(options);
    scroller.adapter.isLoading = true;
    scroller.log(`---=== Workflow ${scroller.state.cycleCount} start`, options);
    scroller.process$.next(<ProcessSubject>{
      process: Process.start,
      status: 'next'
    });
  }
}
