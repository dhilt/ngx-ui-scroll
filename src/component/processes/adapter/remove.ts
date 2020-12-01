import { getBaseAdapterProcess } from './_base';
import { Scroller } from '../../scroller';
import { Direction, AdapterRemoveOptions, ItemsPredicate, AdapterProcess, ProcessStatus } from '../../interfaces/index';

export default class Remove extends getBaseAdapterProcess(AdapterProcess.remove) {

  static run(scroller: Scroller, options: AdapterRemoveOptions) {

    const { params } = Remove.parseInput(scroller, options);
    if (!params) {
      return;
    }

    const shouldRemove = Remove.removeBufferedItems(scroller, params);
    const shouldRemoveVirtual = Remove.removeVirtualItems(scroller, params);

    if (shouldRemove || shouldRemoveVirtual) {
      const { clip } = scroller.state;
      clip.simulate = true;
      clip.increase = !!params.increase;
      if (shouldRemove) {
        clip.doClip = true;
      } else {
        clip.virtual.only = true;
      }
    }

    scroller.workflow.call({
      process: Remove.process,
      status: shouldRemove || shouldRemoveVirtual ? ProcessStatus.next : ProcessStatus.done
    });
  }

  static removeBufferedItems(scroller: Scroller, options: AdapterRemoveOptions): boolean {
    const { predicate, indexes } = options;
    let result = false;
    if (predicate) {
      result = Remove.runPredicateOverBuffer(scroller, predicate);
    }
    if (indexes) {
      const indexPredicate: ItemsPredicate = ({ $index }) => indexes.indexOf($index) >= 0;
      result = Remove.runPredicateOverBuffer(scroller, indexPredicate);
    }
    return result;
  }

  static runPredicateOverBuffer(scroller: Scroller, predicate: ItemsPredicate): boolean {
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

  static removeVirtualItems(scroller: Scroller, options: AdapterRemoveOptions): boolean {
    const { indexes } = options;
    let result = false;
    if (!indexes) {
      return false;
    }
    const { state: { clip } } = scroller;
    const { finiteAbsMinIndex, firstIndex, finiteAbsMaxIndex, lastIndex } = scroller.buffer;
    for (let i = indexes.length - 1; i >= 0; i--) {
      const index = indexes[i];
      if (index >= finiteAbsMinIndex && firstIndex !== null && index < firstIndex) {
        clip.virtual.backward.push(index);
        result = true;
      }
      if (index <= finiteAbsMaxIndex && lastIndex !== null && index > lastIndex) {
        clip.virtual.forward.push(index);
        result = true;
      }
    }
    return result;
  }

}
