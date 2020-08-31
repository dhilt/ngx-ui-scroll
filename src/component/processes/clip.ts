import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Clip {

  static process = Process.clip;

  static run(scroller: Scroller) {
    const { workflow, state: { clip } } = scroller;
    if (clip.doClip) {
      Clip.doClip(scroller);
    } else {
      scroller.logger.log(() => 'no clip');
    }

    workflow.call({
      process: Process.clip,
      status: ProcessStatus.next,
      ...(clip.simulate ? { payload: { process: Process.end } } : {})
    });
  }

  static doClip(scroller: Scroller) {
    const { buffer, viewport: { paddings }, logger, state: { clip } } = scroller;
    const clipped: number[] = [];
    const size = { backward: 0, forward: 0 };
    clip.callCount++;
    logger.stat(`before clip (${clip.callCount})`);
    buffer.items = buffer.items.filter(item => {
      if (item.toRemove) {
        item.hide();
        size[item.removeDirection] += item.size;
        const padding = paddings.byDirection(item.removeDirection);
        padding.size += item.size;
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
