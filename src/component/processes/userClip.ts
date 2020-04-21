import { Scroller } from '../scroller';
import { ADAPTER_METHODS, AdapterMethods, validate } from '../inputs/index';
import { AdapterClipOptions, Process, ProcessStatus } from '../interfaces/index';

export default class UserClip {

  static run(scroller: Scroller, options?: AdapterClipOptions) {
    const methodData = validate(options, ADAPTER_METHODS.CLIP);
    const { backwardOnly, forwardOnly } = methodData.params;

    scroller.state.clip.forceForward = !backwardOnly.value;
    scroller.state.clip.forceBackward = !forwardOnly.value;

    scroller.workflow.call({
      process: Process.userClip,
      status: ProcessStatus.next
    });
  }

}
