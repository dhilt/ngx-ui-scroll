import { Scroller } from '../../scroller';
import { ADAPTER_METHODS, AdapterMethods, validateOne } from '../../inputs/index';
import {
  Process,
  ProcessStatus,
  ItemsPredicate,
  ItemsLooper,
  AdapterFixOptions,
  IValidator
} from '../../interfaces/index';

const { FIX } = ADAPTER_METHODS;
const { Fix: FixParams } = AdapterMethods;

interface IFixParam {
  validators: IValidator[];
  call?: Function;
  value?: any;
}

interface IFixCall {
  scroller: Scroller;
  params: IFixParam[];
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

  static scrollToItem({ scroller, value, params }: IFixCall) {
    const found = scroller.buffer.items.find(item => (<ItemsPredicate>value)(item.get()));
    if (!found) {
      scroller.logger.log(() => `scrollToItem cancelled, item not found`);
      return;
    }
    const scrollToItemOpt = params.find(({ name }) => name === FixParams.scrollToItemOpt);
    found.scrollTo(scrollToItemOpt ? scrollToItemOpt.value : void 0);
  }

  static getCallMethod(token: string): Function | null {
    switch (token) {
      case FixParams.scrollPosition:
        return Fix.setScrollPosition;
      case FixParams.minIndex:
        return Fix.setMinIndex;
      case FixParams.maxIndex:
        return Fix.setMaxIndex;
      case FixParams.updater:
        return Fix.updateItems;
      case FixParams.scrollToItem:
        return Fix.scrollToItem;
      case FixParams.scrollToItemOpt:
        return () => null;
    }
    return null;
  }

  static checkOptions(scroller: Scroller, options: AdapterFixOptions): IFixParam[] {
    if (!options || typeof options !== 'object') {
      return [];
    }
    return Object.entries(FIX).reduce((acc: IFixParam[], [key, prop]) => {
      const error = `failed: can't set ${key}`;
      if (options.hasOwnProperty(key)) {
        const parsed = validateOne(options, key, prop);
        if (parsed.isValid) {
          const call = Fix.getCallMethod(key);
          if (call) {
            return [...acc, { ...prop, value: parsed.value, call }];
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
