import { Scroller } from '../scroller';
import { ADAPTER_METHODS_PARAMS, validateOne } from '../utils/index';
import {
  Process,
  ProcessStatus,
  ItemsLooper,
  AdapterFixOptions,
  IAdapterMethodParam as IParam
} from '../interfaces/index';

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
    let result = value as number;
    if (value === -Infinity) {
      result = 0;
    } else if (value === Infinity) {
      result = viewport.getScrollableSize();
    }
    viewport.setPosition(result);
  }

  static setMinIndex({ scroller: { buffer, settings }, value }: IFixCall) {
    settings.minIndex = value as number;
    buffer.absMinIndex = value as number;
  }

  static setMaxIndex({ scroller: { buffer, settings }, value }: IFixCall) {
    settings.maxIndex = value as number;
    buffer.absMaxIndex = value as number;
  }

  static updateItems({ scroller: { buffer }, value }: IFixCall) {
    buffer.items.forEach(item => (value as ItemsLooper)(item.get()));
  }

  static getCallMethod(token: string): Function | null {
    switch (token) {
      case 'scrollPosition':
        return Fix.setScrollPosition;
      case 'minIndex':
        return Fix.setMinIndex;
      case 'maxIndex':
        return Fix.setMaxIndex;
      case 'updater':
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
      const { validators } = param;
      const error = `failed: can't set ${key}`;
      if (options.hasOwnProperty(key)) {
        const parsed = validateOne(options, key, validators);
        if (parsed.isValid) {
          const call = Fix.getCallMethod(key);
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
