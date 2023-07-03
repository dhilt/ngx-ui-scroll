import { filter } from 'rxjs/operators';

import { makeTest, TestBedConfig, ItFuncConfig } from '../scaffolding/runner';
import { Direction, SizeStrategy } from '../miscellaneous/vscroll';
import { Misc } from '../miscellaneous/misc';
import { ItemsCounter, testItemsCounter } from '../miscellaneous/itemsCounter';
import {
  DatasourceLimiter,
  getLimitedDatasourceClass
} from '../scaffolding/datasources/class';
import {
  getAverageSize,
  getAverageSizeData,
  getDynamicSizeByIndex,
  getDynamicSumSize
} from '../miscellaneous/dynamicSize';

interface ICustom {
  getSize: (index: number) => number;
  shift: boolean;
}

const baseConfig: TestBedConfig<ICustom> = {
  datasourceSettings: { sizeStrategy: SizeStrategy.Average },
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' },
  custom: { getSize: i => getDynamicSizeByIndex(i), shift: false }
};
const common = {
  limits: {
    min: -50,
    max: 99
  }
};

const getCfg = (
  list: {
    ds: TestBedConfig['datasourceSettings'];
    tpl: TestBedConfig['templateSettings'];
    custom?: Partial<ICustom>;
  }[]
): TestBedConfig<ICustom>[] =>
  list
    .map(cfg => ({
      datasourceSettings: { ...baseConfig.datasourceSettings, ...cfg.ds },
      templateSettings: { ...baseConfig.templateSettings, ...cfg.tpl },
      custom: { ...baseConfig.custom, ...cfg.custom }
    }))
    .map(cfg => ({
      ...cfg,
      datasourceClass: getLimitedDatasourceClass({
        settings: cfg.datasourceSettings,
        // devSettings: { debug: true },
        common
      })
    }));

const configList = getCfg([
  {
    ds: { startIndex: 0, padding: 0.5, bufferSize: 5 },
    tpl: { viewportHeight: 100 }
  },
  {
    ds: {
      startIndex: 0,
      padding: 0.5,
      bufferSize: 5,
      minIndex: -20,
      maxIndex: 10
    },
    tpl: { viewportHeight: 100 }
  },
  {
    ds: { startIndex: -5, padding: 1.2, bufferSize: 1 },
    tpl: { viewportHeight: 250 }
  },
  {
    ds: { startIndex: 0, padding: 0.25, bufferSize: 10, windowViewport: true },
    tpl: { noViewportClass: true, viewportHeight: 0 }
  },
  {
    ds: { startIndex: 20, padding: 0.75, bufferSize: 15, horizontal: true },
    tpl: { viewportWidth: 300, horizontal: true }
  }
]);

const configListLack = getCfg([
  {
    ds: { startIndex: -25, padding: 1.2, bufferSize: 1, minIndex: -50 },
    tpl: { viewportHeight: 250 },
    custom: { shift: true }
  },
  {
    ds: { startIndex: 11, padding: 0.7, bufferSize: 7, minIndex: 1 },
    tpl: { viewportHeight: 350 },
    custom: { shift: true }
  },
  {
    ds: {
      startIndex: 1,
      padding: 0.15,
      bufferSize: 9,
      minIndex: -10,
      windowViewport: true
    },
    tpl: { noViewportClass: true, viewportHeight: 0 },
    custom: { shift: true }
  },
  {
    ds: {
      startIndex: -10,
      padding: 0.75,
      bufferSize: 4,
      minIndex: -20,
      horizontal: true
    },
    tpl: { viewportWidth: 300, horizontal: true },
    custom: { shift: true }
  }
]);

const configListScroll = configList.filter(
  (_, index) => index !== 2 && index !== 3
);

const getInitialItemsCounter = (
  _startIndex: number,
  misc: Misc,
  shift?: boolean
): ItemsCounter => {
  const { bufferSize, startIndex, minIndex, maxIndex } = misc.scroller.settings;
  const viewportSize = misc.getViewportSize();
  const firstFetchEndIndex = startIndex + bufferSize - 1;
  const firstFetchData = getAverageSizeData(startIndex, firstFetchEndIndex);
  const result = new ItemsCounter();
  result.average = firstFetchData.average;

  result.set(Direction.backward, {
    size: 0,
    count: 0,
    index: startIndex,
    padding: 0
  });
  if (isFinite(minIndex)) {
    result.backward.padding =
      (startIndex - Math.max(minIndex, common.limits.min)) * result.average;
  }

  result.set(Direction.forward, {
    size: firstFetchData.size,
    count: bufferSize,
    index: firstFetchEndIndex,
    padding: Math.max(
      0,
      viewportSize - firstFetchData.size - result.backward.padding
    )
  });
  if (isFinite(maxIndex)) {
    result.forward.padding =
      (Math.min(maxIndex, common.limits.max) - result.forward.index) *
      result.average;
  }

  // additional shift for the 1st inner loop if there are not enough items
  // https://github.com/dhilt/ngx-ui-scroll/issues/297
  if (shift) {
    const { buffer } = misc.scroller;
    const paddingShift =
      viewportSize -
      buffer.items.reduce(
        (acc, { $index }) => acc + buffer.getSizeByIndex($index),
        0
      ) -
      result.forward.padding;
    result.forward.paddingShift = Math.max(0, paddingShift);
  }

  testItemsCounter(_startIndex, misc, result);
  return result;
};

const getNextItemsCounter = (
  _startIndex: number,
  misc: Misc,
  previous: ItemsCounter
): ItemsCounter | null => {
  const { bufferSize, startIndex, padding, minIndex, maxIndex } =
    misc.scroller.settings;
  const viewportSize = misc.getViewportSize();
  const backwardLimit = viewportSize * padding;
  const forwardLimit = viewportSize + backwardLimit;
  const itemsCounter = new ItemsCounter();

  const itemSize = previous.average;
  const bwdSizeToFill = backwardLimit - previous.backward.size;
  const _bwdItemsToFill = Math.ceil(bwdSizeToFill / itemSize);
  const bwdItemsToFill =
    _bwdItemsToFill > 0 ? Math.max(_bwdItemsToFill, bufferSize) : 0;
  const bwdIndex = Math.max(
    previous.backward.index - bwdItemsToFill,
    minIndex,
    common.limits.min
  );
  const fwdSizeToFill = forwardLimit - previous.forward.size;
  const _fwdItemsToFill = Math.ceil(fwdSizeToFill / itemSize);
  const fwdItemsToFill =
    _fwdItemsToFill > 0 ? Math.max(_fwdItemsToFill, bufferSize) : 0;
  const fwdIndex = Math.min(
    previous.forward.index + fwdItemsToFill,
    maxIndex,
    common.limits.max
  );

  itemsCounter.set(Direction.backward, previous.backward);
  itemsCounter.set(Direction.forward, previous.forward);
  if (
    _bwdItemsToFill > 0 &&
    (misc.innerLoopCount > 2 || _bwdItemsToFill > _fwdItemsToFill)
  ) {
    itemsCounter.set(Direction.backward, {
      count: startIndex - bwdIndex,
      index: bwdIndex,
      padding: 0,
      size: getDynamicSumSize(bwdIndex, startIndex - 1)
    });
  } else {
    itemsCounter.set(Direction.forward, {
      count: fwdIndex - startIndex + 1,
      index: fwdIndex,
      padding: 0,
      size: getDynamicSumSize(startIndex, fwdIndex)
    });
  }
  itemsCounter.average = getAverageSize(
    itemsCounter.backward.index,
    itemsCounter.forward.index
  );

  if (isFinite(minIndex)) {
    const count = Math.max(
      0,
      itemsCounter.backward.index - Math.max(minIndex, common.limits.min)
    );
    itemsCounter.backward.padding = count * itemsCounter.average;
  }
  if (isFinite(maxIndex)) {
    const count = Math.max(
      0,
      Math.min(maxIndex, common.limits.max) - itemsCounter.forward.index
    );
    itemsCounter.forward.padding = count * itemsCounter.average;
  }

  testItemsCounter(_startIndex, misc, itemsCounter);

  return JSON.stringify(itemsCounter) !== JSON.stringify(previous)
    ? itemsCounter
    : null;
};

const testInitialLoad: ItFuncConfig<ICustom> = config => misc => done => {
  (misc.datasource as DatasourceLimiter).setSizes(config.custom.getSize);
  const sub = misc.adapter.loopPending$.pipe(filter(v => !v)).subscribe(() => {
    let itemsCounter: ItemsCounter | null;
    const startIndex = config.datasourceSettings.startIndex as number;
    if (misc.innerLoopCount === 1) {
      itemsCounter = getInitialItemsCounter(
        startIndex,
        misc,
        config.custom.shift
      );
    } else {
      if (misc.innerLoopCount === 2) {
        (misc.shared.itemsCounter as ItemsCounter).forward.paddingShift = 0;
      }
      itemsCounter = getNextItemsCounter(
        startIndex,
        misc,
        misc.shared.itemsCounter as ItemsCounter
      );
    }
    if (itemsCounter) {
      misc.shared.itemsCounter = itemsCounter;
    } else {
      sub.unsubscribe();
      done();
    }
  });
};

const testScroll: ItFuncConfig<ICustom> = config => misc => done => {
  (misc.datasource as DatasourceLimiter).setSizes(config.custom.getSize);
  const sub = misc.adapter.isLoading$.pipe(filter(v => !v)).subscribe(() => {
    const buffer = misc.scroller.buffer;
    if (buffer.bof.get()) {
      getAverageSizeData(
        Math.max(common.limits.min, misc.scroller.settings.minIndex),
        Math.min(common.limits.max, misc.scroller.settings.maxIndex)
      );
      sub.unsubscribe();
      done();
      return;
    }
    if (buffer.eof.get()) {
      misc.shared.eof = true;
      misc.scrollMin();
      return;
    }
    if (!misc.shared.eof) {
      misc.scrollMax();
      return;
    }
    if (misc.shared.eof) {
      misc.scrollMin();
      return;
    }
  });
};

describe('Dynamic Size Spec for Average strategy', () => {
  describe('Initial load', () =>
    configList.forEach((config, i) =>
      makeTest({
        config,
        title: `should fill the viewport with paddings (${i})`,
        it: testInitialLoad(config)
      })
    ));

  describe('Lack of items on 1st fetch', () =>
    configListLack.forEach((config, i) =>
      makeTest({
        config,
        title: `should load with fwd padding shift (${i})`,
        it: testInitialLoad(config)
      })
    ));

  describe('After scroll', () =>
    configListScroll.forEach((config, i) =>
      makeTest({
        config,
        title: `should fill the viewport with paddings (${i})`,
        it: testScroll(config)
      })
    ));
});
