import { Scroller } from '../../scroller';
import { ADAPTER_METHODS, validate } from '../../inputs/index';
import { Direction, ItemsPredicate, Process, ProcessStatus } from '../../interfaces/index';

export default class Remove {

  static process = Process.remove;

  static run(scroller: Scroller, predicate: ItemsPredicate) {
    const methodData = validate({ predicate }, ADAPTER_METHODS.REMOVE);
    if (!methodData.isValid) {
      scroller.logger.log(() => methodData.showErrors());
      scroller.workflow.call({
        process: Process.remove,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "Adapter.remove" method call` }
      });
      return;
    }

    const shouldRemove = Remove.runPredicate(scroller, predicate);

    if (shouldRemove) {
      const { clip } = scroller.state;
      clip.doClip = true;
      clip.simulate = true;
    }

    scroller.workflow.call({
      process: Process.remove,
      status: shouldRemove ? ProcessStatus.next : ProcessStatus.done
    });
  }

  static runPredicate(scroller: Scroller, predicate: ItemsPredicate): boolean {
    const { viewport, buffer: { items } } = scroller;
    let result = false;
    let firstVisibleIndex: null | number = null;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (predicate(item.get())) {
        item.toRemove = true;
        if (firstVisibleIndex === null) {
          const firstVisible = viewport.getEdgeVisibleItem(items, Direction.backward);
          firstVisibleIndex = firstVisible.item ? firstVisible.item.get().$index : null;
        }
        item.removeDirection = firstVisibleIndex !== null && item.$index < firstVisibleIndex
          ? Direction.backward
          : Direction.forward;
        result = true;
      } else if (result === true) {
        // allow only first strict uninterrupted sequence
        break;
      }
    }
    return result;
  }

}
