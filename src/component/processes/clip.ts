import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Clip {

  static process = Process.clip;

  static run(scroller: Scroller) {
    const { workflow, state: { clip } } = scroller;

    Clip.doClip(scroller);

    workflow.call({
      process: Process.clip,
      status: ProcessStatus.next,
      ...(clip.simulate ? { payload: { process: Process.end } } : {})
    });
  }

  static doClip(scroller: Scroller) {
    const { buffer, viewport, logger, state: { clip } } = scroller;
    const size = { backward: 0, forward: 0 };
    const { paddings, scrollPosition: position } = viewport;
    const isAdapterRemove = clip.simulate && !clip.force;

    logger.stat(`before clip (${++clip.callCount})`);

    const itemsToRemove = buffer.items.filter(item => {
      if (!item.toRemove) {
        return false;
      }
      item.hide();
      size[item.removeDirection] += item.size;
      const padding = paddings.byDirection(item.removeDirection);
      padding.size += item.size;
      return true;
    });

    if (scroller.settings.onBeforeClip) {
      scroller.settings.onBeforeClip(itemsToRemove);
    }

    if (isAdapterRemove) { // with indexes shifting
      buffer.removeItems(itemsToRemove);
    } else { // common clip
      buffer.items = buffer.items.filter(({ toRemove }) => !toRemove);
    }

    logger.log(() => itemsToRemove.length
      ? [
        `clipped ${itemsToRemove.length} items` +
        (size.backward ? `, +${size.backward} fwd px` : '') +
        (size.forward ? `, +${size.forward} bwd px` : '') +
        `, range: [${itemsToRemove[0].$index}..${itemsToRemove[itemsToRemove.length - 1].$index}]`
      ]
      : 'clipped 0 items');

    viewport.scrollPosition = position;

    logger.stat('after clip');
  }

}
