import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { ItemsCounter, ItemsDirCounter } from './miscellaneous/itemsCounter';

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

[...fixedAverageSizeConfigList, ...fixedAverageSizeWithBigBufferSizeConfigList].forEach(config =>
  config.expect = { fetch: { callCount: 2 } }
);

const tunedAverageSizeConfigList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 1, bufferSize: 1, padding: 0.5, itemSize: 40 },
  templateSettings: { viewportHeight: 100, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: -50, bufferSize: 2, padding: 0.5, itemSize: 30 },
  templateSettings: { viewportHeight: 120, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: -77, padding: 0.82, itemSize: 200, horizontal: true },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true }
}, {
  datasourceSettings: { startIndex: -47, padding: 0.3, itemSize: 60, windowViewport: true },
  templateSettings: { noViewportClass: true, viewportHeight: 0, itemHeight: 40 }
}];

const tunedAverageSizeWithBigBufferSizeConfigList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: -50, bufferSize: 7, padding: 0.5, itemSize: 30 },
  templateSettings: { viewportHeight: 120, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: 50, padding: 0.33, itemSize: 35, bufferSize: 20, windowViewport: true },
  templateSettings: { noViewportClass: true, viewportHeight: 0, itemHeight: 20 }
}];

[...tunedAverageSizeConfigList, ...tunedAverageSizeWithBigBufferSizeConfigList].forEach(config =>
  config.expect = { fetch: { callCount: 3 } }
);

const getFixedAverageSizeItemsCounter = (settings: TestBedConfig, misc: Misc, itemSize: number): ItemsCounter => {
  const { bufferSize, startIndex, padding } = misc.scroller.settings;
  const viewportSize = misc.getViewportSize(settings);

  const backwardLimit = viewportSize * padding;
  const forwardLimit = viewportSize + backwardLimit;
  const itemsCounter = new ItemsCounter();
  const { backward, forward } = itemsCounter;

  backward.count = Math.ceil(backwardLimit / itemSize);
  forward.count = Math.ceil(forwardLimit / itemSize);

  // when bufferSize is big enough
  const bwdDiff = bufferSize - backward.count;
  if (bwdDiff > 0) {
    backward.count += bwdDiff;
  }
  const fwdDiff = bufferSize - forward.count;
  if (fwdDiff > 0) {
    forward.count += fwdDiff;
  }

  backward.index = startIndex - backward.count;
  forward.index = startIndex + forward.count - 1;
  return itemsCounter;
};

const getNonFixedAverageSizeItemsCounter =
  (settings: TestBedConfig, misc: Misc, itemSize: number, previous?: ItemsCounter): ItemsCounter => {
    const { bufferSize, startIndex, padding } = misc.scroller.settings;
    const viewportSize = misc.getViewportSize(settings);
    const backwardLimit = viewportSize * padding;
    const forwardLimit = viewportSize + backwardLimit;
    const itemsCounter = new ItemsCounter();
    const { backward, forward } = itemsCounter;
    const _backward = <ItemsDirCounter>(previous ? previous.backward : {});
    const _forward = <ItemsDirCounter>(previous ? previous.forward : {});
    let bwd, fwd;

    backward.count = previous ? Math.ceil(backwardLimit / itemSize) : 0;
    forward.count = Math.ceil(forwardLimit / itemSize);
    if (previous) {
      backward.count = Math.max(backward.count, _backward.count);
      forward.count = Math.max(forward.count, _forward.count);
    }

    // when bufferSize is big enough
    bwd = backward.count - (previous ? _backward.count : 0);
    fwd = forward.count - (previous ? _forward.count : 0);
    const bwdDiff = bwd > 0 ? bufferSize - bwd : 0;
    const fwdDiff = fwd > 0 ? bufferSize - fwd : 0;
    if (bwdDiff > 0 && bwd > fwd) {
      backward.count += bwdDiff;
      forward.count = previous ? _forward.count : forward.count;
    }
    if (fwdDiff > 0 && fwd >= bwd) {
      forward.count += fwdDiff;
      backward.count = previous ? _backward.count : backward.count;
    }

    if (previous) {
      bwd = backward.count - _backward.count;
      fwd = forward.count - _forward.count;
      if (bwd > 0 && bwd > fwd) {
        backward.count = _backward.count + bwd;
        forward.count = fwd > 0 ? _forward.count : forward.count;
      }
      if (fwd > 0 && fwd >= bwd) {
        forward.count = _forward.count + fwd;
        backward.count = bwd > 0 ? _backward.count : backward.count;
      }
    }

    backward.index = startIndex - backward.count;
    forward.index = startIndex + forward.count - 1;
    return itemsCounter;
  };

const testItemsCount = (settings: TestBedConfig, misc: Misc, itemsCounter: ItemsCounter) => {
  const { startIndex } = settings.datasourceSettings;
  const elements = misc.getElements();

  expect(elements.length).toEqual(itemsCounter.total);
  expect(misc.scroller.buffer.items.length).toEqual(itemsCounter.total);
  expect(misc.getElementIndex(elements[0])).toEqual(itemsCounter.backward.index);
  expect(misc.getElementIndex(elements[elements.length - 1])).toEqual(itemsCounter.forward.index);
  expect(misc.checkElementContentByIndex(startIndex)).toEqual(true);
};

const testFixedAverageSizeCase = (settings: TestBedConfig, misc: Misc, done: Function) => {
  expect(misc.workflow.cyclesDone).toEqual(1);
  expect(misc.scroller.state.fetch.callCount).toEqual(2);
  expect(misc.scroller.state.innerLoopCount).toEqual(3);
  expect(misc.scroller.state.clipCall).toEqual(0);
  expect(misc.padding.backward.getSize()).toEqual(0);
  expect(misc.padding.forward.getSize()).toEqual(0);

  const itemSize = <number>settings.templateSettings[misc.horizontal ? 'itemWidth' : 'itemHeight'];
  const itemsCounter = getFixedAverageSizeItemsCounter(settings, misc, itemSize);
  testItemsCount(settings, misc, itemsCounter);
  done();
};

const testNonFixedAverageSize = (settings: TestBedConfig, misc: Misc, done: Function) => {
  const loopCount = misc.scroller.state.innerLoopCount;
  if (loopCount === 4) {
    expect(misc.scroller.state.workflowCycleCount).toEqual(1);
    expect(misc.scroller.state.fetch.callCount).toEqual(3);
    expect(misc.scroller.state.clipCall).toEqual(0);
    expect(misc.padding.backward.getSize()).toEqual(0);
    expect(misc.padding.forward.getSize()).toEqual(0);
    done();
    return;
  }
  let itemsCounter;
  if (loopCount === 1) {
    const initialItemSize = settings.datasourceSettings.itemSize;
    itemsCounter = getNonFixedAverageSizeItemsCounter(settings, misc, initialItemSize);
  } else {
    const itemSize = <number>settings.templateSettings[misc.horizontal ? 'itemWidth' : 'itemHeight'];
    itemsCounter = getNonFixedAverageSizeItemsCounter(settings, misc, itemSize, misc.shared.itemsCounter);
  }
  testItemsCount(settings, misc, itemsCounter);
  misc.shared.itemsCounter = itemsCounter;
};

describe('Initial Load Spec', () => {

  describe('Fixed average item size', () => {
    fixedAverageSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should make 2 fetches to satisfy padding limits',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            testFixedAverageSizeCase(config, misc, done)
          )
      })
    );
    fixedAverageSizeWithBigBufferSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should make 2 fetches to overflow padding limits (bufferSize is big enough)',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            testFixedAverageSizeCase(config, misc, done)
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
            testNonFixedAverageSize(config, misc, done)
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
            testNonFixedAverageSize(config, misc, done)
          );
        }
      })
    );
  });

});
