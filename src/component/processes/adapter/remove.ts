import { Scroller } from '../../scroller';
import { ADAPTER_METHODS, validate } from '../../inputs/index';
import { Direction, AdapterRemoveOptions, ItemsPredicate, Process, ProcessStatus } from '../../interfaces/index';

export default class Remove {

  static process = Process.remove;

  static run(scroller: Scroller, options: AdapterRemoveOptions) {
    const methodData = validate(options, ADAPTER_METHODS.REMOVE);
    if (!methodData.isValid) {
      scroller.logger.log(() => methodData.showErrors());
      scroller.workflow.call({
        process: Process.remove,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "Adapter.remove" method call` }
      });
      return;
    }

    const { predicate, increase } = methodData.params;
    const shouldRemove = Remove.runPredicateOverBuffer(scroller, predicate.value as ItemsPredicate);
    const { clip } = scroller.state;

    if (shouldRemove) {
      clip.doClip = true;
      clip.simulate = true;
      clip.increase = increase.value as boolean;
    }

    scroller.workflow.call({
      process: Process.remove,
      status: shouldRemove ? ProcessStatus.next : ProcessStatus.done
    });
  }

  static runPredicateOverBuffer(scroller: Scroller, predicate: ItemsPredicate): boolean {
    const { viewport, buffer: { items } } = scroller;
    let result = false;
    let firstVisibleIndex: null | number = null;

    // removing buffered (real) items
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
