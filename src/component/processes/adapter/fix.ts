import { Scroller } from '../../scroller';
import { ADAPTER_METHODS, AdapterMethods, validate } from '../../inputs/index';
import {
  Process,
  ProcessStatus,
  ItemsPredicate,
  ItemsLooper,
  AdapterFixOptions,
  IValidatedData,
} from '../../interfaces/index';

const { Fix: FixParams } = AdapterMethods;

export default class Fix {

  static process = Process.fix;

  static run(scroller: Scroller, options: AdapterFixOptions) {
    const { workflow } = scroller;
    const methodData = validate(options, ADAPTER_METHODS.FIX);
    if (!methodData.isValid) {
      scroller.logger.log(() => methodData.showErrors());
      scroller.workflow.call({
        process: Process.fix,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "Adapter.fix" method call` }
      });
      return;
    }

    Object.entries(methodData.params).forEach(([key, value]) => {
      if (value.isSet && value.isValid) {
        Fix.runByType(scroller, key, value.value, methodData);
      }
    });

    workflow.call({
      process: Process.fix,
      status: ProcessStatus.done
    });
  }

  static runByType(scroller: Scroller, token: string, value: any, methodData: IValidatedData) {
    switch (token) {
      case FixParams.scrollPosition:
        return Fix.setScrollPosition(scroller, value);
      case FixParams.minIndex:
        return Fix.setMinIndex(scroller, value);
      case FixParams.maxIndex:
        return Fix.setMaxIndex(scroller, value);
      case FixParams.updater:
        return Fix.updateItems(scroller, value);
      case FixParams.scrollToItem:
        const scrollToItemOpt = methodData.params[FixParams.scrollToItemOpt];
        return Fix.scrollToItem(scroller, value, scrollToItemOpt ? scrollToItemOpt.value : void 0);
      case FixParams.scrollToItemOpt:
        return;
    }
  }

  static setScrollPosition({ state, viewport }: Scroller, value: any) {
    let result = value as number;
    if (value === -Infinity) {
      result = 0;
    } else if (value === Infinity) {
      result = viewport.getScrollableSize();
    }
    viewport.setPosition(result);
  }

  static setMinIndex({ buffer, settings }: Scroller, value: any) {
    settings.minIndex = value as number;
    buffer.absMinIndex = value as number;
  }

  static setMaxIndex({ buffer, settings }: Scroller, value: any) {
    settings.maxIndex = value as number;
    buffer.absMaxIndex = value as number;
  }

  static updateItems({ buffer }: Scroller, value: any) {
    buffer.items.forEach(item => (value as ItemsLooper)(item.get()));
  }

  static scrollToItem(scroller: Scroller, value: any, options?: any) {
    const found = scroller.buffer.items.find(item => (value as ItemsPredicate)(item.get()));
    if (!found) {
      scroller.logger.log(() => `scrollToItem cancelled, item not found`);
      return;
    }
    found.scrollTo(options);
  }

}
