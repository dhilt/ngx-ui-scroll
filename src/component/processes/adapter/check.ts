import { Scroller } from '../../scroller';
import { Process, ProcessStatus, Direction } from '../../interfaces/index';
import End from '../end';

export default class Check {

  static process = Process.check;

  static run(scroller: Scroller) {
    const { workflow, buffer, state: { fetch }, viewport } = scroller;
    let min = Infinity, max = -Infinity;

    buffer.items.forEach(item => {
      const size = item.size;
      item.setSize();
      if (item.size !== size) {
        buffer.cache.add(item);
        min = Math.min(min, item.$index);
        max = Math.max(max, item.$index);
      }
    });

    if (Number.isFinite(min)) {
      scroller.state.clip.noClip = true;
      fetch.first.indexBuffer = buffer.firstIndex;
      fetch.last.indexBuffer = buffer.lastIndex;
      const { item: first, diff } = End.getEdgeVisibleItem(scroller, Direction.backward);
      fetch.firstVisibleIndex = first ? first.get().$index : null;
      if (fetch.firstVisibleIndex !== null) {
        fetch.firstVisibleItemDelta = - buffer.getSizeByIndex(fetch.firstVisibleIndex) + diff;
      }
      fetch.replace(
        buffer.items.filter(item => item.$index >= min && item.$index <= max)
      );
    }

    scroller.logger.stat('check');

    workflow.call({
      process: Process.check,
      status: Number.isFinite(min) ? ProcessStatus.next : ProcessStatus.done
    });
  }

}
