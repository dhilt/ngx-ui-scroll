import { Scroller } from '../scroller';
import {
  Direction, ItemsPredicate, ItemsIteratorCallBack, Process, ProcessStatus, FixOptions, ItemAdapter
} from '../interfaces/index';
import { InputValue, ValidatedValue, validate } from '../utils/index';

enum FixParamToken {
  scrollPosition = 'scrollPosition',
  minIndex = 'minIndex',
  maxIndex = 'maxIndex',
  updater = 'updater'
}

interface FixParam {
  token: FixParamToken;
  type: InputValue;
  call: Function;
  value?: any;
}

export default class Fix {

  static params: FixParam[] = [
    {
      token: FixParamToken.scrollPosition,
      type: InputValue.integer,
      call: Fix.setScrollPosition
    },
    {
      token: FixParamToken.minIndex,
      type: InputValue.integerUnlimited,
      call: Fix.setMinIndex
    },
    {
      token: FixParamToken.maxIndex,
      type: InputValue.integerUnlimited,
      call: Fix.setMaxIndex
    },
    {
      token: FixParamToken.updater,
      type: InputValue.iteratorCallback,
      call: Fix.updateItems
    }
  ];

  static run(scroller: Scroller, options: FixOptions) {
    const { workflow } = scroller;
    const params = Fix.checkOptions(scroller, options);

    if (!params.length) {
      workflow.call({
        process: Process.fix,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "Adapter.fix" method call` }
      });
      return;
    }

    params.forEach((param: FixParam) => {
      param.call(scroller, param.value);
    });

    workflow.call({
      process: Process.fix,
      status: ProcessStatus.done
    });
  }

  static setScrollPosition(scroller: Scroller, value: number) {
    const { state, viewport } = scroller;
    state.syntheticScroll.reset();
    viewport.setPosition(value);
  }

  static setMinIndex(scroller: Scroller, value: number) {
    const { buffer, settings } = scroller;
    settings.minIndex = value;
    buffer.absMinIndex = value;
  }

  static setMaxIndex(scroller: Scroller, value: number) {
    const { buffer, settings } = scroller;
    settings.maxIndex = value;
    buffer.absMaxIndex = value;
  }

  static updateItems(scroller: Scroller, iteratorCallback: ItemsIteratorCallBack) {
    scroller.buffer.items.forEach(item => iteratorCallback(item.get()));
  }

  static checkOptions(scroller: Scroller, options: FixOptions): FixParam[] {
    if (!options || typeof options !== 'object') {
      return [];
    }
    return Fix.params.reduce((acc: FixParam[], param: FixParam) => {
      const { token, type } = param;
      if (options.hasOwnProperty(token)) {
        const parsed = validate((<any>options)[token], type);
        if (parsed.isValid) {
          return [...acc, { ...param, value: parsed.value }];
        }
        scroller.logger.log(() => `can't set ${token}, ${parsed.error}`);
      }
      return acc;
    }, []);
  }

}
