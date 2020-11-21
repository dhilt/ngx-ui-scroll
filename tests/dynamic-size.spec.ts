import { Direction } from '../src/component/interfaces';

import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { ItemsCounter, testItemsCounter } from './miscellaneous/itemsCounter';
import {
  getDynamicAverage,
  getDynamicSizeData,
  getDynamicSumSize
} from './miscellaneous/dynamicSize';

const configList: TestBedConfig[] = [{
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: 0, padding: 0.5, bufferSize: 5 },
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' }
}, {
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: 0, padding: 0.5, bufferSize: 5, minIndex: -20, maxIndex: 10 },
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' }
}, {
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: -5, padding: 1.2, bufferSize: 1 },
  templateSettings: { viewportHeight: 250, dynamicSize: 'size' }
}, {
  datasourceName: 'limited--50-99-dynamic-size',
  datasourceSettings: { startIndex: -25, padding: 1.2, bufferSize: 1, minIndex: -50 },
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

const configListScroll = configList
  .map(config => ({
    ...config, datasourceSettings: { ...config.datasourceSettings, adapter: true }
  }))
  .filter((config, index) => index !== 2 && index !== 3);

const ABS_MIN_INDEX = -50;
const ABS_MAX_INDEX = 99;

const getInitialItemsCounter = (config: TestBedConfig, misc: Misc): ItemsCounter => {
  const { bufferSize, startIndex, minIndex, maxIndex } = misc.scroller.settings;
  const viewportSize = misc.getViewportSize(config);
  const firstFetchEndIndex = startIndex + bufferSize - 1;
  const firstFetchData = getDynamicSizeData(startIndex, firstFetchEndIndex);
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

  testItemsCounter(config, misc, result);
  return result;
};

const getNextItemsCounter = (config: TestBedConfig, misc: Misc, previous: ItemsCounter): ItemsCounter | null => {
  const { bufferSize, startIndex, padding, minIndex, maxIndex } = misc.scroller.settings;
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
  itemsCounter.average = getDynamicAverage(itemsCounter.backward.index, itemsCounter.forward.index);

  if (isFinite(minIndex)) {
    const count = itemsCounter.backward.index - Math.max(minIndex, ABS_MIN_INDEX);
    itemsCounter.backward.padding = count * itemsCounter.average;
  }
  if (isFinite(maxIndex)) {
    const count = Math.min(maxIndex, ABS_MAX_INDEX) - itemsCounter.forward.index;
    itemsCounter.forward.padding = count * itemsCounter.average;
  }

  testItemsCounter(config, misc, itemsCounter);

  return JSON.stringify(itemsCounter) !== JSON.stringify(previous) ? itemsCounter : null;
};

const testInitialLoad = (config: TestBedConfig, misc: Misc, done: Function) => {
  let itemsCounter: ItemsCounter | null;
  if (misc.innerLoopCount === 1) {
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

const testScroll = (config: TestBedConfig, misc: Misc, done: Function) => {
  const buffer = misc.scroller.buffer;
  if (buffer.bof) {
    getDynamicSizeData(
      Math.max(ABS_MIN_INDEX, misc.scroller.settings.minIndex),
      Math.min(ABS_MAX_INDEX, misc.scroller.settings.maxIndex)
    );
    done();
    return;
  }
  if (buffer.eof) {
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

  describe('After scroll', () => {
    configListScroll.forEach(config =>
      makeTest({
        config,
        title: 'should fill the viewport with paddings',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            testScroll(config, misc, done)
          )
      })
    );
  });

});

describe('Zero Size Spec', () => {

  const config = {
    datasourceName: 'limited-1-100-zero-size',
    datasourceSettings: { bufferSize: 5, minIndex: 1 },
    templateSettings: { dynamicSize: 'size', viewportHeight: 200 }
  };

  describe('Items with zero size', () =>
    makeTest({
      config,
      title: 'should stop the Workflow after the first loop',
      it: (misc: Misc) => (done: Function) =>
        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          expect(misc.innerLoopCount).toEqual(1);
          done();
        })
    })
  );

  describe('Items with zero size started from 2 pack', () =>
    makeTest({
      config: {
        ...config,
        datasourceName: 'limited-1-100-zero-size-started-from-6'
      },
      title: 'should stop the Workflow after the second loop',
      it: (misc: Misc) => (done: Function) =>
        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          expect(misc.innerLoopCount).toEqual(2);
          done();
        })
    })
  );

  describe('Items get non-zero size asynchronously', () =>
    makeTest({
      config: {
        ...config,
        datasourceName: 'limited-1-100-zero-size',
        datasourceSettings: { adapter: true }
      },
      title: 'should continue the Workflow after re-size and check',
      it: (misc: Misc) => (done: Function) =>
        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          const { scroller: { viewport }, adapter, datasource } = misc;
          if (misc.workflow.cyclesDone === 1) {
            expect(viewport.getScrollableSize()).toEqual(viewport.paddings.forward.size);
            (datasource as any).setProcessGet((result: any[]) =>
              result.forEach(item => item.size = 20)
            );
            adapter.fix({
              updater: ({ element, data }) => {
                data.size = 20;
                (element as any).children[0].style.height = '20px';
              }
            });
            adapter.check();
          } else {
            expect(viewport.getScrollableSize()).toBeGreaterThan(0);
            expect(viewport.paddings.forward.size).toEqual(0);
            done();
          }
        })
    })
  );

});
