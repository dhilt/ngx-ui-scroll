import { Scroller } from '../scroller';
import {
  Direction, ItemsPredicate, ItemsLooper, Process, ProcessStatus, AdapterFixOptions, ItemAdapter
} from '../interfaces/index';
import { InputValue, ValidatedValue, validate } from '../utils/index';

enum FixParamToken {
  scrollPosition = 'scrollPosition',
  minIndex = 'minIndex',
  maxIndex = 'maxIndex',
  updater = 'updater',
  scrollToItemTop = 'scrollToItemTop',
  scrollToItemBottom = 'scrollToItemBottom'
}

interface IFixParam {
  token: FixParamToken;
  type: InputValue;
  call?: Function;
  value?: any;
}

interface IFixCall {
  scroller: Scroller;
  params: IFixParam[];
  value: any;
}

export default class Fix {

  static params: IFixParam[] = [
    {
      token: FixParamToken.scrollPosition,
      type: InputValue.integerUnlimited,
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
    },
    {
      token: FixParamToken.scrollToItemTop,
      type: InputValue.iteratorCallback,
      call: Fix.scrollToItemTop
    },
    {
      token: FixParamToken.scrollToItemBottom,
      type: InputValue.iteratorCallback,
      call: Fix.scrollToItemBottom
    }
  ];

  static run(scroller: Scroller, options: AdapterFixOptions) {
    const { workflow } = scroller;
    const params = Fix.checkOptions(scroller, options);

    if (params.length !== Object.keys(options).length) {
      workflow.call({
        process: Process.fix,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "Adapter.fix" method call` }
      });
      return;
    }

    params.forEach((param: IFixParam) => {
      if (typeof param.call !== 'function') {
        return;
      }
      param.call({ scroller, params, value: param.value });
    });

    workflow.call({
      process: Process.fix,
      status: ProcessStatus.done
    });
  }

  static setScrollPosition({ scroller: { state, viewport }, value }: IFixCall) {
    state.syntheticScroll.reset();
    let result = <number>value;
    if (value === -Infinity) {
      result = 0;
    } else if (value === Infinity) {
      result = viewport.getScrollableSize();
    }
    viewport.setPosition(result);
  }

  static setMinIndex({ scroller: { buffer, settings }, value }: IFixCall) {
    settings.minIndex = <number>value;
    buffer.absMinIndex = <number>value;
  }

  static setMaxIndex({ scroller: { buffer, settings }, value }: IFixCall) {
    settings.maxIndex = <number>value;
    buffer.absMaxIndex = <number>value;
  }

  static updateItems({ scroller: { buffer }, value }: IFixCall) {
    buffer.items.forEach(item => (<ItemsLooper>value)(item.get()));
  }

  static scrollToItem({ scroller, value }: IFixCall, alignToTop: boolean) {
    const found = scroller.buffer.items.find(item => (<ItemsPredicate>value)(item.get()));
    if (!found) {
      scroller.logger.log(() => `scrollToItem cancelled, item not found`);
      return;
    }
    found.scrollTo(alignToTop);
  }

  static scrollToItemTop(params: IFixCall) {
    Fix.scrollToItem(params, true);
  }

  static scrollToItemBottom(params: IFixCall) {
    Fix.scrollToItem(params, false);
  }

  static checkOptions(scroller: Scroller, options: AdapterFixOptions): IFixParam[] {
    if (!options || typeof options !== 'object') {
      return [];
    }
    return Fix.params.reduce((acc: IFixParam[], param: IFixParam) => {
      const { token, type } = param;
      if (options.hasOwnProperty(token)) {
        const parsed = validate((<any>options)[token], type);
        if (parsed.isValid) {
          return [...acc, { ...param, value: parsed.value }];
        }
        scroller.logger.log(() => `failed: can't set ${token}, ${parsed.error}`);
      }
      return acc;
    }, []);
  }

}
