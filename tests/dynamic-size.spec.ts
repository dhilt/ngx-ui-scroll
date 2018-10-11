import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import {
  getDynamicAverage,
  getDynamicSizeByIndex,
  getDynamicSizeData,
  getDynamicSumSize
} from './miscellaneous/dynamicSize';
import { ItemsCounter, testItemsCounter } from './miscellaneous/itemsCounter';
import { configListDestructiveFilter } from './miscellaneous/common';
import { Direction } from '../src/component/interfaces';

const configList: TestBedConfig[] = [{
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: 0, padding: 0.5, bufferSize: 5 },
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' }
}, {
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: -5, padding: 1.2, bufferSize: 1 },
  templateSettings: { viewportHeight: 250, dynamicSize: 'size' }
}, {
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: 0, padding: 0.25, bufferSize: 10, windowViewport: true },
  templateSettings: { noViewportClass: true, viewportHeight: 0, dynamicSize: 'size' }
}, {
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: 20, padding: 0.75, bufferSize: 15, horizontal: true },
  templateSettings: { viewportWidth: 300, horizontal: true, dynamicSize: 'size' }
}];

const ABS_MIN_INDEX = -50;
const ABS_MAX_INDEX = 99;

const getInitialItemsCounter = (config: TestBedConfig, misc: Misc): ItemsCounter => {
  const { bufferSize, startIndex } = misc.scroller.settings;
  const viewportSize = misc.getViewportSize(config);
  const firstFetchEndIndex = startIndex + bufferSize - 1;
  const firstFetchData = getDynamicSizeData(startIndex, firstFetchEndIndex);
  const result = new ItemsCounter();
  result.average = firstFetchData.average;

  result.set(Direction.forward, {
    size: firstFetchData.size,
    count: bufferSize,
    index: firstFetchEndIndex,
    padding: Math.max(0, viewportSize - firstFetchData.size)
  });
  result.set(Direction.backward, {
    size: 0,
    count: 0,
    index: startIndex,
    padding: 0
  });

  testItemsCounter(config, misc, result);
  return result;
};

const getNextItemsCounter = (config: TestBedConfig, misc: Misc, previous: ItemsCounter): ItemsCounter | null => {
  const { bufferSize, startIndex, padding } = misc.scroller.settings;
  const loopCount = misc.scroller.state.innerLoopCount;
  const viewportSize = misc.getViewportSize(config);
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
  if (_bwdItemsToFill > 0 && (loopCount > 2 || _bwdItemsToFill > _fwdItemsToFill)) {
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
  itemsCounter.average = getDynamicAverage(itemsCounter.backward.index, itemsCounter.forward.index);

  testItemsCounter(config, misc, itemsCounter);

  return JSON.stringify(itemsCounter) !== JSON.stringify(previous) ? itemsCounter : null;
};

const testInitialLoad = (config: TestBedConfig, misc: Misc, done: Function) => {
  const loopCount = misc.scroller.state.innerLoopCount;

  let itemsCounter: ItemsCounter | null;
  if (loopCount === 1) {
    itemsCounter = getInitialItemsCounter(config, misc);
  } else {
    itemsCounter = getNextItemsCounter(config, misc, misc.shared.itemsCounter);
  }
  if (itemsCounter) {
    misc.shared.itemsCounter = itemsCounter;
  } else {
    done();
  }
};

describe('Dynamic Size Spec', () => {

  describe('Initial load', () => {
    configList.forEach(config =>
      makeTest({
        config,
        title: 'should fill the viewport with paddings',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.scroller, 'finalize').and.callFake(() =>
            testInitialLoad(config, misc, done)
          )
      })
    );
  });

});
