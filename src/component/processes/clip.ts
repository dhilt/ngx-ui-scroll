import { Scroller } from '../scroller';
import { Process, ProcessStatus, Direction } from '../interfaces/index';

export default class Clip {

  static run(scroller: Scroller) {
    const { clip } = scroller.state;
    if (clip.doClip) {
      Clip.doClip(scroller);
    } else {
      scroller.logger.log(() => 'no clip');
    }

    scroller.callWorkflow({
      process: Process.clip,
      status: ProcessStatus.next,
      ...(clip.simulate ? { payload: Process.end } : {})
    });
  }

  static doClip(scroller: Scroller) {
    const { buffer, viewport: { paddings }, logger, state: { clip } } = scroller;
    const clipped: Array<number> = [];
    const size = { backward: 0, forward: 0 };
    clip.callCount++;
    logger.stat(`before clip (${clip.callCount})`);
    buffer.items = buffer.items.filter(item => {
      if (item.toRemove) {
        item.hide();
        size[item.removeDirection] += item.size;
        if (item.removeDirection === Direction.backward) {
          paddings.forward.size += item.size;
        }
        if (item.removeDirection === Direction.forward) {
          paddings.backward.size += item.size;
        }
        clipped.push(item.$index);
        if (clip.simulate && !clip.force) {
          buffer.removeItem(item);
        }
        return false;
      }
      return true;
    });
    logger.log(() => [
      `clipped ${clipped.length} items` +
      (size.backward ? `, +${size.backward} fwd px` : '') +
      (size.forward ? `, +${size.forward} bwd px` : '') +
      `, range: [${clipped[0]}..${clipped[clipped.length - 1]}]`
    ]);
    logger.stat('after clip');
  }

}
