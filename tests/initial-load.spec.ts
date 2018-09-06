import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const threeFetchConfig = {
  fetch: { callCount: 3 }
};

const fixedAverageSizeConfigList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 1, padding: 2, itemSize: 15 },
  templateSettings: { viewportHeight: 20, itemHeight: 15 }
}, {
  datasourceSettings: { startIndex: 1, padding: 0.5, itemSize: 20 },
  templateSettings: { viewportHeight: 120, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: -99, padding: 0.3, itemSize: 25 },
  templateSettings: { viewportHeight: 200, itemHeight: 25 }
}, {
  datasourceSettings: { startIndex: -77, padding: 0.62, itemSize: 90, horizontal: true },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true }
}, {
  datasourceSettings: { startIndex: 1, padding: 0.5, itemSize: 20, windowViewport: true },
  templateSettings: { noViewportClass: true, viewportHeight: 0, itemHeight: 20 }
}];

const fixedAverageSizeWithBigBufferSizeConfigList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 100, padding: 0.1, itemSize: 20, bufferSize: 20 },
  templateSettings: { viewportHeight: 100, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: -50, padding: 0.1, itemSize: 90, bufferSize: 10, horizontal: true },
  templateSettings: { viewportWidth: 200, itemWidth: 90, horizontal: true }
}];

const tunedAverageSizeConfigList: TestBedConfig[] = [{
  // datasourceDevSettings: { debug: true },
  datasourceSettings: { startIndex: 1, bufferSize: 1, padding: 0.5, itemSize: 40 },
  templateSettings: { viewportHeight: 100, itemHeight: 20 },
  expect: threeFetchConfig
}, {
  datasourceSettings: { startIndex: -50, bufferSize: 2, padding: 0.5, itemSize: 30 },
  templateSettings: { viewportHeight: 120, itemHeight: 20 },
  expect: threeFetchConfig
}, {
  datasourceSettings: { startIndex: -77, padding: 0.82, itemSize: 200, horizontal: true },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true },
  expect: threeFetchConfig
}, {
  datasourceSettings: { startIndex: -47, padding: 0.3, itemSize: 60, windowViewport: true },
  templateSettings: { noViewportClass: true, viewportHeight: 0, itemHeight: 40 },
  expect: threeFetchConfig
}];

const tunedAverageSizeWithBigBufferSizeConfigList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: -50, bufferSize: 7, padding: 0.5, itemSize: 30 },
  templateSettings: { viewportHeight: 120, itemHeight: 20 },
  expect: threeFetchConfig
}, {
  datasourceSettings: { startIndex: 50, padding: 0.33, itemSize: 35, bufferSize: 20, windowViewport: true },
  templateSettings: { noViewportClass: true, viewportHeight: 0, itemHeight: 20 },
  expect: threeFetchConfig
}];

class ItemsCount {
  backward: number;
  forward: number;
  total: number;
}

const getItemsCount = (settings: TestBedConfig, misc: Misc, itemSize: number): ItemsCount => {
  const bufferSize = misc.scroller.settings.bufferSize;
  const viewportSize = misc.getViewportSize(settings);

  const backwardLimit = viewportSize * settings.datasourceSettings.padding;
  const forwardLimit = viewportSize + backwardLimit;
  const itemsCount = new ItemsCount();

  itemsCount.backward = Math.ceil(backwardLimit / itemSize);
  itemsCount.forward = Math.ceil(forwardLimit / itemSize);
  itemsCount.total = itemsCount.backward + itemsCount.forward;

  // when bufferSize is big enough
  if (itemsCount.total < bufferSize) {
    itemsCount.forward += bufferSize - itemsCount.total;
    itemsCount.total = bufferSize;
  }

  return itemsCount;
};

const _testItemsCount = (settings: TestBedConfig, misc: Misc, itemsCount: ItemsCount) => {
  const { startIndex } = settings.datasourceSettings;
  const elements = misc.getElements();

  expect(elements.length).toEqual(itemsCount.total);
  expect(misc.scroller.buffer.items.length).toEqual(itemsCount.total);
  expect(misc.getElementIndex(elements[0])).toEqual(startIndex - itemsCount.backward);
  expect(misc.getElementIndex(elements[elements.length - 1])).toEqual(startIndex + itemsCount.forward - 1);
  expect(misc.getElementText(startIndex)).toEqual(`${startIndex} : item #${startIndex}`);
};

const testItemsCount = (settings: TestBedConfig, misc: Misc, itemSize: number) => {
  const itemsCount = getItemsCount(settings, misc, itemSize);
  _testItemsCount(settings, misc, itemsCount);
};

const _testFixedAverageSize = (settings: TestBedConfig, misc: Misc, done: Function) => {
  const fetchCallCount = misc.scroller.state.fetch.callCount;
  const fetchCallCountExpected = settings.expect ? settings.expect.fetch.callCount : 1;
  expect(misc.workflow.cyclesDone).toEqual(1);
  expect(fetchCallCount).toEqual(fetchCallCountExpected);
  expect(misc.scroller.state.cycleCount).toEqual(fetchCallCount + 1);
  expect(misc.padding.backward.getSize()).toEqual(0);
  expect(misc.padding.forward.getSize()).toEqual(0);

  const itemSize = <number>settings.templateSettings[misc.horizontal ? 'itemWidth' : 'itemHeight'];
  testItemsCount(settings, misc, itemSize);
  done();
};

const _testTunedAverageSize = (settings: TestBedConfig, misc: Misc, done: Function) => {
  const cycleCount = misc.scroller.state.cycleCount;
  if (cycleCount > 3) {
    done();
    return;
  }
  if (cycleCount === 1) {
    testItemsCount(settings, misc, settings.datasourceSettings.itemSize);
    return;
  }
  const itemSize = settings.datasourceSettings.itemSize;
  const _itemSize = <number>settings.templateSettings[misc.horizontal ? 'itemWidth' : 'itemHeight'];
  const itemsCount = getItemsCount(settings, misc, itemSize);
  const _itemsCount = getItemsCount(settings, misc, _itemSize);
  const fwdDiff = _itemsCount.forward - itemsCount.forward;
  const bwdDiff = _itemsCount.backward - itemsCount.backward;
  const bufferSize = misc.scroller.settings.bufferSize;
  if (cycleCount === 2 || cycleCount === 3) {
    const diff = Math.max(fwdDiff, bwdDiff);
    const buffDiff = Math.max(0, bufferSize - diff);
    if (fwdDiff > bwdDiff) {
      itemsCount.forward += diff + buffDiff;
      itemsCount.total += diff + buffDiff;
    } else if (fwdDiff < bwdDiff) {
      itemsCount.backward += diff + buffDiff;
      itemsCount.total += diff + buffDiff;
    }
  }
  if (cycleCount === 3) {
    const diff = Math.min(fwdDiff, bwdDiff);
    const buffDiff = Math.max(0, bufferSize - diff);
    if (fwdDiff > bwdDiff) {
      itemsCount.backward += diff + buffDiff;
      itemsCount.total += diff + buffDiff;
    } else if (fwdDiff < bwdDiff) {
      itemsCount.forward += diff + buffDiff;
      itemsCount.total += diff + buffDiff;
    }
  }
  _testItemsCount(settings, misc, itemsCount);
};

describe('Initial Load Spec', () => {

  describe('Fixed average item size', () => {
    fixedAverageSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should make 1 fetch to satisfy padding limits',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            _testFixedAverageSize(config, misc, done)
          )
      })
    );
    fixedAverageSizeWithBigBufferSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should make 1 big fetch to overflow padding limits (bufferSize is big enough)',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            _testFixedAverageSize(config, misc, done)
          )
      })
    );
  });

  describe('Tuned average item size', () => {
    tunedAverageSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should make 3 fetches to satisfy padding limits',
        it: (misc: Misc) => (done: Function) => {
          spyOn(misc.scroller, 'finalize').and.callFake(() =>
            _testTunedAverageSize(config, misc, done)
          );
        }
      })
    );
    tunedAverageSizeWithBigBufferSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should make 3 fetches to overflow padding limits (bufferSize is big enough)',
        it: (misc: Misc) => (done: Function) => {
          spyOn(misc.scroller, 'finalize').and.callFake(() =>
            _testTunedAverageSize(config, misc, done)
          );
        }
      })
    );
  });

});
