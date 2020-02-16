import { Scroller } from '../scroller';
import {
  Direction, ItemsPredicate, ItemsLooper, Process, ProcessStatus, FixOptions, ItemAdapter
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
  call?: Function;
  value?: any;
}

interface CallParams {
  scroller: Scroller;
  params: FixParam[];
  value: any;
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

    if (params.length !== Object.keys(options).length) {
      workflow.call({
        process: Process.fix,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "Adapter.fix" method call` }
      });
      return;
    }

    params.forEach((param: FixParam) => {
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

  static setScrollPosition({ scroller: { state, viewport }, value }: CallParams) {
    state.syntheticScroll.reset();
    viewport.setPosition(<number>value);
  }

  static setMinIndex({ scroller: { buffer, settings }, value }: CallParams) {
    settings.minIndex = <number>value;
    buffer.absMinIndex = <number>value;
  }

  static setMaxIndex({ scroller: { buffer, settings }, value }: CallParams) {
    settings.maxIndex = <number>value;
    buffer.absMaxIndex = <number>value;
  }

  static updateItems({ scroller: { buffer }, value }: CallParams) {
    buffer.items.forEach(item => (<ItemsLooper>value)(item.get()));
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
        scroller.logger.log(() => `failed: can't set ${token}, ${parsed.error}`);
      }
      return acc;
    }, []);
  }

}
