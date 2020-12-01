import { getBaseAdapterProcess } from './_base';
import { Scroller } from '../../scroller';
import { AdapterClipOptions, AdapterProcess, ProcessStatus } from '../../interfaces/index';

export default class UserClip extends getBaseAdapterProcess(AdapterProcess.clip) {

  static run(scroller: Scroller, options?: AdapterClipOptions) {
    const { params } = UserClip.parseInput(scroller, options);

    scroller.state.clip.forceForward = !(params && params.backwardOnly);
    scroller.state.clip.forceBackward = !(params && params.forwardOnly);

    scroller.workflow.call({
      process: UserClip.process,
      status: ProcessStatus.next
    });
  }

}
