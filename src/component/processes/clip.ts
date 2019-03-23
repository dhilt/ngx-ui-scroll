import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Clip {

  static run(scroller: Scroller) {
    if (scroller.state.doClip) {
      Clip.doClip(scroller);
    }

    scroller.callWorkflow({
      process: Process.clip,
      status: ProcessStatus.next
    });
  }

  static doClip(scroller: Scroller) {
    const { buffer, viewport: { paddings }, logger } = scroller;
    const clipped: Array<number> = [];
    const size = { backward: 0, forward: 0 };
    scroller.state.clipCall++;
    logger.stat(`before clip (${scroller.state.clipCall})`);
    buffer.items = buffer.items.filter(item => {
      if (item.toRemove) {
        size[item.removeDirection] += item.size;
        item.hide();
        clipped.push(item.$index);
        return false;
      }
      return true;
    });
    if (size.backward) {
      paddings.forward.size += size.backward;
    }
    if (size.forward) {
      paddings.backward.size += size.forward;
    }
    logger.log(() => [
      `clipped ${clipped.length} items` +
      (size.backward ? `, +${size.backward} fwd px,` : '') +
      (size.forward ? `, +${size.forward} bwd px,` : ''),
      `range: [${clipped[0]}..${clipped[clipped.length - 1]}]`
    ]);
    logger.stat('after clip');
  }

}
