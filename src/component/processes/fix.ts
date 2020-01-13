import { Scroller } from '../scroller';
import { Direction, ItemsPredicate, Process, ProcessStatus, FixOptions } from '../interfaces/index';

interface IFix {
  scrollPosition: (value: number) => void;
  minIndex: (value: number) => void;
  maxIndex: (value: number) => void;
}

function setFix(scroller: Scroller): IFix {
  const { state, buffer, viewport, settings } = scroller;
  return <IFix>{
    scrollPosition: (value: number) => {
      state.syntheticScroll.reset();
      viewport.setPosition(value);
    },
    minIndex: (value: number) => {
      settings.minIndex = value;
      buffer.absMinIndex = value;
    },
    maxIndex: (value: number) => {
      settings.maxIndex = value;
      buffer.absMaxIndex = value;
    }
  };
}

export default class Fix {

  static run(scroller: Scroller, options: FixOptions) {
    if (!Fix.checkOptions(options)) {
      scroller.callWorkflow({
        process: Process.fix,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "Adapter.fix" method call` }
      });
      return;
    }

    const doFix = setFix(scroller);

    ['scrollPosition', 'minIndex', 'maxIndex'].forEach((token: string) => {
      if (options.hasOwnProperty(token)) {
        const value = Number((<any>options)[token]);
        const parsedValue = parseInt((<any>options)[token], 10);
        if (value !== parsedValue) {
          scroller.logger.log(() => `can't set ${token}; argument must be an integer`);
        } else {
          (<any>doFix)[token](value);
        }
      }
    });

    scroller.callWorkflow({
      process: Process.fix,
      status: ProcessStatus.next
    });
  }

  static checkOptions(options: FixOptions) {
    if (!options || typeof options !== 'object') {
      return false;
    }
    return true;
  }

}
