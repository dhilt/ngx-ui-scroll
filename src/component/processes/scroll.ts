import { Scroller } from '../scroller';
import { Process, ProcessSubject, Run } from '../interfaces/index';
import { calculateFlowDirection } from '../utils';

export default class Scroll {

  static run(scroller: Scroller) {
    scroller.log('is loading?', scroller.adapter.isLoading);
    if (scroller.adapter.isLoading) {
      return;
    }
    const direction = calculateFlowDirection(scroller.viewport);
    const run: Run = {
      scroll: true,
      direction
    };
    scroller.process$.next(<ProcessSubject>{
      process: Process.scroll,
      status: 'next',
      payload: run
    });
  }
}
