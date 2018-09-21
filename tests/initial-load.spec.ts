import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

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

class ItemsCounter {
  backward: number;
  forward: number;
  total: number;
}

const testItemsCount = (settings: TestBedConfig, misc: Misc, itemsCounter: ItemsCounter) => {
  const { startIndex } = settings.datasourceSettings;
  const elements = misc.getElements();

  expect(elements.length).toEqual(itemsCounter.total);
  expect(misc.scroller.buffer.items.length).toEqual(itemsCounter.total);
  expect(misc.getElementIndex(elements[0])).toEqual(startIndex - itemsCounter.backward);
  expect(misc.getElementIndex(elements[elements.length - 1])).toEqual(startIndex + itemsCounter.forward - 1);
  expect(misc.getElementText(startIndex)).toEqual(`${startIndex} : item #${startIndex}`);
};

const getFixedAverageSizeItemsCounter = (settings: TestBedConfig, misc: Misc, itemSize: number): ItemsCounter => {
  const bufferSize = misc.scroller.settings.bufferSize;
  const viewportSize = misc.getViewportSize(settings);

  const backwardLimit = viewportSize * settings.datasourceSettings.padding;
  const forwardLimit = viewportSize + backwardLimit;
  const itemsCounter = new ItemsCounter();

  itemsCounter.backward = Math.ceil(backwardLimit / itemSize);
  itemsCounter.forward = Math.ceil(forwardLimit / itemSize);
  itemsCounter.total = itemsCounter.backward + itemsCounter.forward;

  // when bufferSize is big enough
  const bwdDiff = bufferSize - itemsCounter.backward;
  if (bwdDiff > 0) {
    itemsCounter.backward += bwdDiff;
    itemsCounter.total += bwdDiff;
  }
  const fwdDiff = bufferSize - itemsCounter.forward;
  if (fwdDiff > 0) {
    itemsCounter.forward += fwdDiff;
    itemsCounter.total += fwdDiff;
  }

  return itemsCounter;
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

const getNonFixedAverageSizeItemsCounter =
  (settings: TestBedConfig, misc: Misc, itemSize: number, previous?: ItemsCounter): ItemsCounter => {
    const bufferSize = misc.scroller.settings.bufferSize;
    const viewportSize = misc.getViewportSize(settings);
    const backwardLimit = viewportSize * settings.datasourceSettings.padding;
    const forwardLimit = viewportSize + backwardLimit;
    const itemsCounter = new ItemsCounter();
    let bwd, fwd;

    itemsCounter.backward = previous ? Math.ceil(backwardLimit / itemSize) : 0;
    itemsCounter.forward = Math.ceil(forwardLimit / itemSize);
    if (previous) {
      itemsCounter.backward = Math.max(itemsCounter.backward, previous.backward);
      itemsCounter.forward = Math.max(itemsCounter.forward, previous.forward);
    }

    // when bufferSize is big enough
    bwd = itemsCounter.backward - (previous ? previous.backward : 0);
    fwd = itemsCounter.forward - (previous ? previous.forward : 0);
    const bwdDiff = bwd > 0 ? bufferSize - bwd : 0;
    const fwdDiff = fwd > 0 ? bufferSize - fwd : 0;
    if (bwdDiff > 0 && bwd > fwd) {
      itemsCounter.backward += bwdDiff;
      itemsCounter.forward = previous ? previous.forward : itemsCounter.forward;
    }
    if (fwdDiff > 0 && fwd >= bwd) {
      itemsCounter.forward += fwdDiff;
      itemsCounter.backward = previous ? previous.backward : itemsCounter.backward;
    }

    if (previous) {
      bwd = itemsCounter.backward - previous.backward;
      fwd = itemsCounter.forward - previous.forward;
      if (bwd > 0 && bwd > fwd) {
        itemsCounter.backward = previous.backward + bwd;
        itemsCounter.forward = fwd > 0 ? previous.forward : itemsCounter.forward;
      }
      if (fwd > 0 && fwd >= bwd) {
        itemsCounter.forward = previous.forward + fwd;
        itemsCounter.backward = bwd > 0 ? previous.backward : itemsCounter.backward;
      }
    }

    itemsCounter.total = itemsCounter.backward + itemsCounter.forward;
    return itemsCounter;
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
        title: 'should make 2 big fetches to overflow padding limits (bufferSize is big enough)',
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
