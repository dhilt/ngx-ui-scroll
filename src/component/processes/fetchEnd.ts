import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces/index';

export default class FetchEnd {

  static run(scroller: Scroller) {
    let status = 'next', payload;
    if (scroller.settings.infinite) {
      status = 'done';
      payload = 'no clip because of infinite mode';
    } else if (!scroller.state.fetch.hasNewItems && scroller.settings.clipAfterFetchOnly) {
      status = 'done';
      payload = 'no clip because no fetch (clipAfterFetchOnly is true)';
    } else if (!scroller.state.scroll && scroller.settings.clipAfterScrollOnly) {
      status = 'done';
      payload = 'no clip because no scroll (clipAfterScrollOnly is true)';
    }
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.fetchEnd,
      status,
      ...payload && { payload }
    });
  }
}
