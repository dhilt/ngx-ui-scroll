import { Scroller } from '../scroller';
import { Item } from '../classes/item';
import { Direction, ItemsPredicate, Process, ProcessStatus } from '../interfaces/index';

export default class Remove {

  static run(scroller: Scroller, predicate: ItemsPredicate) {
    if (!Remove.checkPredicate(predicate)) {
      scroller.callWorkflow({
        process: Process.remove,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "Adapter.remove" method call` }
      });
      return;
    }

    scroller.buffer.items.forEach(item => {
      if (predicate(item)) {
        item.toRemove = true;
        item.removeDirection = Direction.backward;
        scroller.state.doClip = true;
      }
    });

    if (!scroller.state.doClip) {
      scroller.callWorkflow({
        process: Process.remove,
        status: ProcessStatus.done
      });
      return;
    }

    scroller.callWorkflow({
      process: Process.remove,
      status: ProcessStatus.next
    });
  }

  static checkPredicate(predicate: ItemsPredicate) {
    return true;
  }

}
