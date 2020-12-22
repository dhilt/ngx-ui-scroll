import { getBaseAdapterProcess } from './_base';
import { Scroller } from '../../scroller';
import { AdapterMethods } from '../../inputs/index';
import {
  AdapterProcess,
  ProcessStatus,
  ItemsPredicate,
  ItemsLooper,
  AdapterFixOptions,
  IValidatedData,
} from '../../interfaces/index';

const { [AdapterProcess.fix]: FixParams } = AdapterMethods;

export default class Fix extends getBaseAdapterProcess(AdapterProcess.fix) {

  static run(scroller: Scroller, options: AdapterFixOptions) {
    const { workflow } = scroller;

    const { data, params } = Fix.parseInput(scroller, options);
    if (!params) {
      return;
    }

    Object.entries(data.params).forEach(([key, value]) => {
      if (value.isSet && value.isValid) {
        Fix.runByType(scroller, key, value.value, data);
      }
    });

    workflow.call({
      process: Fix.process,
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
    settings.minIndex = value;
    buffer.absMinIndex = value;
  }

  static setMaxIndex({ buffer, settings }: Scroller, value: any) {
    settings.maxIndex = value;
    buffer.absMaxIndex = value;
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
