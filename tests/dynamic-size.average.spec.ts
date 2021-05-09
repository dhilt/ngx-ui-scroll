import { filter } from 'rxjs/operators';

import { makeTest, TestBedConfig, ItFuncConfig } from './scaffolding/runner';
import { Direction, SizeStrategy } from './miscellaneous/vscroll';
import { Misc } from './miscellaneous/misc';
import { ItemsCounter, testItemsCounter } from './miscellaneous/itemsCounter';
import { getAverageSize, getAverageSizeData, getDynamicSumSize } from './miscellaneous/dynamicSize';

const sizeStrategy = SizeStrategy.Average;

const configList: TestBedConfig[] = [{
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: 0, padding: 0.5, bufferSize: 5, sizeStrategy },
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' }
}, {
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: 0, padding: 0.5, bufferSize: 5, minIndex: -20, maxIndex: 10, sizeStrategy },
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' }
}, {
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: -5, padding: 1.2, bufferSize: 1, sizeStrategy },
  templateSettings: { viewportHeight: 250, dynamicSize: 'size' }
}, {
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: -25, padding: 1.2, bufferSize: 1, minIndex: -50, sizeStrategy },
  templateSettings: { viewportHeight: 250, dynamicSize: 'size' }
}, {
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: 0, padding: 0.25, bufferSize: 10, windowViewport: true, sizeStrategy },
  templateSettings: { noViewportClass: true, viewportHeight: 0, dynamicSize: 'size' }
}, {
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: 20, padding: 0.75, bufferSize: 15, horizontal: true, sizeStrategy },
  templateSettings: { viewportWidth: 300, horizontal: true, dynamicSize: 'size' }
}];

const configListScroll = configList
  .map(config => ({
    ...config, datasourceSettings: { ...config.datasourceSettings, adapter: true }
  }))
  .filter((config, index) => index !== 2 && index !== 3);

const ABS_MIN_INDEX = -50;
const ABS_MAX_INDEX = 99;

const getInitialItemsCounter = (_startIndex: number, misc: Misc): ItemsCounter => {
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
    result.backward.padding = (startIndex - Math.max(minIndex, ABS_MIN_INDEX)) * result.average;
  }
  result.set(Direction.forward, {
    size: firstFetchData.size,
    count: bufferSize,
    index: firstFetchEndIndex,
    padding: Math.max(0, viewportSize - firstFetchData.size - result.backward.padding)
  });
  if (isFinite(maxIndex)) {
    result.forward.padding = (Math.min(maxIndex, ABS_MAX_INDEX) - result.forward.index) * result.average;
  }

  testItemsCounter(_startIndex, misc, result);
  return result;
};

const getNextItemsCounter = (_startIndex: number, misc: Misc, previous: ItemsCounter): ItemsCounter | null => {
  const { bufferSize, startIndex, padding, minIndex, maxIndex } = misc.scroller.settings;
  const viewportSize = misc.getViewportSize();
  const backwardLimit = viewportSize * padding;
  const forwardLimit = viewportSize + backwardLimit;
  const itemsCounter = new ItemsCounter();

  const itemSize = previous.average;
  const bwdSizeToFill = backwardLimit - previous.backward.size;
  const _bwdItemsToFill = Math.ceil(bwdSizeToFill / itemSize);
  const bwdItemsToFill = _bwdItemsToFill > 0 ? Math.max(_bwdItemsToFill, bufferSize) : 0;
  const bwdIndex = Math.max(previous.backward.index - bwdItemsToFill, ABS_MIN_INDEX);
  const fwdSizeToFill = forwardLimit - previous.forward.size;
  const _fwdItemsToFill = Math.ceil(fwdSizeToFill / itemSize);
  const fwdItemsToFill = _fwdItemsToFill > 0 ? Math.max(_fwdItemsToFill, bufferSize) : 0;
  const fwdIndex = Math.min(previous.forward.index + fwdItemsToFill, ABS_MAX_INDEX);

  itemsCounter.set(Direction.backward, previous.backward);
  itemsCounter.set(Direction.forward, previous.forward);
  if (_bwdItemsToFill > 0 && (misc.innerLoopCount > 2 || _bwdItemsToFill > _fwdItemsToFill)) {
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
  itemsCounter.average = getAverageSize(itemsCounter.backward.index, itemsCounter.forward.index);

  if (isFinite(minIndex)) {
    const count = itemsCounter.backward.index - Math.max(minIndex, ABS_MIN_INDEX);
    itemsCounter.backward.padding = count * itemsCounter.average;
  }
  if (isFinite(maxIndex)) {
    const count = Math.min(maxIndex, ABS_MAX_INDEX) - itemsCounter.forward.index;
    itemsCounter.forward.padding = count * itemsCounter.average;
  }

  testItemsCounter(_startIndex, misc, itemsCounter);

  return JSON.stringify(itemsCounter) !== JSON.stringify(previous) ? itemsCounter : null;
};

const testInitialLoad: ItFuncConfig = config => misc => done =>
  misc.adapter.loopPending$.pipe(filter(v => !v)).subscribe(() => {
    let itemsCounter: ItemsCounter | null;
    const startIndex = config.datasourceSettings.startIndex as number;
    if (misc.innerLoopCount === 1) {
      itemsCounter = getInitialItemsCounter(startIndex, misc);
    } else {
      itemsCounter = getNextItemsCounter(startIndex, misc, misc.shared.itemsCounter as ItemsCounter);
    }
    if (itemsCounter) {
      misc.shared.itemsCounter = itemsCounter;
    } else {
      done();
    }
  });

const testScroll: ItFuncConfig = () => misc => done =>
  misc.adapter.isLoading$.pipe(filter(v => !v)).subscribe(() => {
    const buffer = misc.scroller.buffer;
    if (buffer.bof.get()) {
      getAverageSizeData(
        Math.max(ABS_MIN_INDEX, misc.scroller.settings.minIndex),
        Math.min(ABS_MAX_INDEX, misc.scroller.settings.maxIndex)
      );
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

describe('Dynamic Size Spec for SizeStrategy.Average', () => {

  describe('Initial load', () => {
    configList.forEach(config =>
      makeTest({
        config,
        title: 'should fill the viewport with paddings',
        it: testInitialLoad(config)
      })
    );
  });

  describe('After scroll', () => {
    configListScroll.forEach(config =>
      makeTest({
        config,
        title: 'should fill the viewport with paddings',
        it: testScroll(config)
      })
    );
  });

});

