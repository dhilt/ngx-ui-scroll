import { Scroller } from '../scroller';
import { ClipOptions, Process, ProcessStatus } from '../interfaces/index';

export default class UserClip {

  static run(scroller: Scroller, options?: ClipOptions) {
    const _options = UserClip.checkOptions(options);

    scroller.state.clip.forceForward = !_options.backwardOnly;
    scroller.state.clip.forceBackward = !_options.forwardOnly;

    scroller.workflow.call({
      process: Process.userClip,
      status: ProcessStatus.next
    });
  }

  static checkOptions(options?: ClipOptions): ClipOptions {
    const result: ClipOptions = {
      forwardOnly: false,
      backwardOnly: false
    };
    if (options !== null && typeof options === 'object') {
      result.backwardOnly = !!options.backwardOnly;
      result.forwardOnly = !!options.forwardOnly;
    }
    return result;
  }

}
