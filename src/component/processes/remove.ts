import { Scroller } from '../scroller';
import { Direction, ItemsPredicate, Process, ProcessStatus } from '../interfaces/index';

export default class Remove {

  static run(scroller: Scroller, predicate: ItemsPredicate) {
    if (!Remove.checkPredicate(predicate)) {
      scroller.workflow.call({
        process: Process.remove,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "Adapter.remove" method call` }
      });
      return;
    }

    scroller.buffer.items.forEach(item => {
      if (predicate(item.get())) {
        item.toRemove = true;
        item.removeDirection = Direction.backward; // inversion, will alway increase fwd padding
        scroller.state.clip.doClip = true;
        scroller.state.clip.simulate = true;
      }
    });

    if (!scroller.state.clip.doClip) {
      scroller.workflow.call({
        process: Process.remove,
        status: ProcessStatus.done
      });
      return;
    }

    scroller.workflow.call({
      process: Process.remove,
      status: ProcessStatus.next
    });
  }

  static checkPredicate(predicate: ItemsPredicate) {
    if (typeof predicate !== 'function') {
      return false;
    }
    return true;
  }

}
