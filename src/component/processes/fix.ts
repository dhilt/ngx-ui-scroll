import { Scroller } from '../scroller';
import {
  Process,
  ProcessStatus,
  ItemsLooper,
  AdapterFixOptions,
  IAdapterMethodParam as IParam
} from '../interfaces/index';
import { ADAPTER_METHODS_PARAMS, validate } from '../utils/index';

const { FIX } = ADAPTER_METHODS_PARAMS;

interface IFixCall {
  scroller: Scroller;
  params: IParam[];
  value: any;
}

export default class Fix {

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

    params.forEach((param: IParam) => {
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

  static getCallMethod(token: string): Function | null {
    const { scrollPosition, minIndex, maxIndex, updater } = FIX;
    switch (token) {
      case scrollPosition.name:
        return Fix.setScrollPosition;
      case minIndex.name:
        return Fix.setMinIndex;
      case maxIndex.name:
        return Fix.setMaxIndex;
      case updater.name:
        return Fix.updateItems;
    }
    return null;
  }

  static checkOptions(scroller: Scroller, options: AdapterFixOptions): IParam[] {
    if (!options || typeof options !== 'object') {
      return [];
    }
    return Object.keys(FIX).reduce((acc: IParam[], key: string) => {
      const param = FIX[key];
      const { name, validators } = param;
      const error = `failed: can't set ${name}`;
      if (options.hasOwnProperty(name)) {
        const parsed = validate((<any>options)[name], validators);
        if (parsed.isValid) {
          const call = Fix.getCallMethod(name);
          if (call) {
            return [...acc, { ...param, value: parsed.value, call }];
          } else {
            scroller.logger.log(() => `${error}, call method not found`);
          }
        } else {
          scroller.logger.log(() => `${error}, ${parsed.errors}`);
        }
      }
      return acc;
    }, []);
  }

}
