import { Scroller } from '../scroller';
import { Direction, Process, ProcessStatus } from '../interfaces/index';

export default class Clip {

  static process = Process.clip;

  static run(scroller: Scroller) {
    const { workflow } = scroller;

    Clip.doClip(scroller);
    workflow.call({
      process: Process.clip,
      status: ProcessStatus.next,
      payload: { process: scroller.state.cycle.initiator }
    });
  }

  static doClip(scroller: Scroller) {
    const { viewport, logger, state: { clip } } = scroller;
    const position = viewport.scrollPosition;

    logger.stat(`before clip (${++clip.callCount})`);

    if (!clip.virtual.only) {
      Clip.onBuffered(scroller);
    }
    if (clip.virtual.has) {
      Clip.onVirtual(scroller);
    }
    viewport.scrollPosition = position;

    logger.stat('after clip');
  }

  static onBuffered(scroller: Scroller) {
    const { buffer, viewport: { paddings }, logger, state: { clip } } = scroller;
    const size = { backward: 0, forward: 0 };
    const removeViaAdapter = clip.simulate && !clip.force;

    const itemsToRemove = buffer.items.filter(item => {
      if (!item.toRemove) {
        return false;
      }
      item.hide();
      size[item.removeDirection] += item.size;
      if (!removeViaAdapter) { // do not adjust paddings in case of Adapter remove
        const padding = paddings.byDirection(item.removeDirection);
        padding.size += item.size;
      }
      return true;
    });

    if (scroller.settings.onBeforeClip && itemsToRemove.length) {
      scroller.settings.onBeforeClip(itemsToRemove.map(item => item.get()));
    }

    const indexesToRemove = itemsToRemove.map(({ $index }) => $index);
    if (removeViaAdapter) {
      buffer.removeItems(indexesToRemove, !clip.increase, false);
    } else { // common clip case
      buffer.items = buffer.items.filter(({ toRemove }) => !toRemove);
    }

    logger.log(() => indexesToRemove.length
      ? [
        `clipped ${indexesToRemove.length} item(s) from Buffer` +
        (
          removeViaAdapter
            ? ` (via adapter), -${size.backward + size.forward}px`
            : (size.backward ? `, +${size.backward} fwd px` : '') + (size.forward ? `, +${size.forward} bwd px` : '')
        ) +
        `, range: [${indexesToRemove[0]}..${indexesToRemove[indexesToRemove.length - 1]}]`
      ]
      : 'clipped 0 items from Buffer');
  }

  static onVirtual(scroller: Scroller) {
    const { buffer, viewport: { paddings }, logger, state: { clip } } = scroller;
    const size = { backward: 0, forward: 0 };
    const virtualIndexesToRemove = clip.virtual.all;

    [Direction.backward, Direction.forward].forEach(dir => {
      size[dir] = clip.virtual[dir].reduce((acc, index) => acc + buffer.getSizeByIndex(index), 0);
      paddings[dir].size -= size[dir];
    });

    buffer.removeItems(virtualIndexesToRemove, !clip.increase, true);

    logger.log(() => [
      `clipped ${virtualIndexesToRemove.length} virtual item(s)` +
      (size.backward ? `, +${size.backward} fwd px` : '') +
      (size.forward ? `, +${size.forward} bwd px` : '') +
      `, [${virtualIndexesToRemove.join(' ')}]`
    ]);
  }

}
