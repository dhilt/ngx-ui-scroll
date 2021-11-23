import { makeTest, TestBedConfig, ItFuncConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { ItemsCounter, testItemsCounter } from './miscellaneous/itemsCounter';

const fixedItemSizeConfigList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 1, padding: 2, itemSize: 15 },
  templateSettings: { viewportHeight: 20, itemHeight: 15 }
}, {
  datasourceSettings: { startIndex: 1, padding: 0.5, itemSize: 20 },
  templateSettings: { viewportHeight: 120, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: -99, padding: 0.3, itemSize: 25 },
  templateSettings: { viewportHeight: 200, itemHeight: 25 }
}, {
  datasourceSettings: { startIndex: -77, padding: 0.62, itemSize: 100, horizontal: true },
  templateSettings: { viewportWidth: 450, itemWidth: 100, horizontal: true }
}, {
  datasourceSettings: { startIndex: 1, padding: 0.5, itemSize: 20, windowViewport: true },
  templateSettings: { noViewportClass: true, viewportHeight: 0, itemHeight: 20 }
}];

const fixedItemSizeAndBigBufferSizeConfigList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 100, padding: 0.1, itemSize: 20, bufferSize: 20 },
  templateSettings: { viewportHeight: 100, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: -50, padding: 0.1, itemSize: 100, bufferSize: 10, horizontal: true },
  templateSettings: { viewportWidth: 200, itemWidth: 100, horizontal: true }
}];

const tunedItemSizeConfigList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 1, bufferSize: 1, padding: 0.5, itemSize: 40 },
  templateSettings: { viewportHeight: 100, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: -50, bufferSize: 2, padding: 0.5, itemSize: 30 },
  templateSettings: { viewportHeight: 120, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: -77, padding: 0.82, itemSize: 200, horizontal: true },
  templateSettings: { viewportWidth: 450, itemWidth: 100, horizontal: true }
}, {
  datasourceSettings: { startIndex: -47, padding: 0.3, itemSize: 60, windowViewport: true },
  templateSettings: { noViewportClass: true, viewportHeight: 0, itemHeight: 40 }
}];

const tunedItemSizeAndBigBufferSizeConfigList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: -50, bufferSize: 7, padding: 0.5, itemSize: 30 },
  templateSettings: { viewportHeight: 120, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: 50, padding: 0.33, itemSize: 35, bufferSize: 20, windowViewport: true },
  templateSettings: { noViewportClass: true, viewportHeight: 0, itemHeight: 20 }
}];

const noItemSizeConfigList = tunedItemSizeConfigList.map(
  ({ datasourceSettings: { itemSize: _, ...restDatasourceSettings }, ...config }) => ({
    ...config, datasourceSettings: { ...restDatasourceSettings }
  })
);

const noItemSizeAndBigBufferConfigList = tunedItemSizeAndBigBufferSizeConfigList.map(
  ({ datasourceSettings: { itemSize: _, ...restDatasourceSettings }, ...config }) => ({
    ...config, datasourceSettings: { ...restDatasourceSettings }
  })
);

const getSetItemSizeCounter = (settings: TestBedConfig, misc: Misc, itemSize: number): ItemsCounter => {
  const { bufferSize, startIndex, padding } = misc.scroller.settings;
  const viewportSize = misc.getViewportSize();

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

const getNotSetItemSizeCounter =
  (settings: TestBedConfig, misc: Misc, itemSize: number, previous?: ItemsCounter): ItemsCounter => {
    const { bufferSize, startIndex, padding, minIndex } = misc.scroller.settings;
    const viewportSize = misc.getViewportSize();
    const backwardLimit = viewportSize * padding;
    const forwardLimit = viewportSize + backwardLimit;
    const itemsCounter = new ItemsCounter();
    const { backward, forward } = itemsCounter;
    const countB = previous ? previous.backward.count : 0;
    const countF = previous ? previous.forward.count : 0;
    let bwd, fwd;

    // 1) fetch only in forward direction if this is the first fetch
    // 2) fetch bufferSize items if Settings.itemSize value hasn't been set up
    backward.count = previous ? (itemSize ? Math.ceil(backwardLimit / itemSize) : bufferSize) : 0;
    forward.count = itemSize ? Math.ceil(forwardLimit / itemSize) : bufferSize;
    if (previous) {
      backward.count = Math.max(backward.count, countB);
      forward.count = Math.max(forward.count, countF);
    }

    // when bufferSize is big enough
    bwd = backward.count - (previous ? countB : 0);
    fwd = forward.count - (previous ? countF : 0);
    const bwdDiff = bwd > 0 ? bufferSize - bwd : 0;
    const fwdDiff = fwd > 0 ? bufferSize - fwd : 0;
    if (bwdDiff > 0 && bwd > fwd) {
      backward.count += bwdDiff;
      forward.count = previous ? countF : forward.count;
    }
    if (fwdDiff > 0 && fwd >= bwd) {
      forward.count += fwdDiff;
      backward.count = previous ? countB : backward.count;
    }

    if (previous) {
      bwd = backward.count - countB;
      fwd = forward.count - countF;
      if (bwd > 0 && bwd > fwd) {
        backward.count = countB + bwd;
        forward.count = fwd > 0 ? countF : forward.count;
      }
      if (fwd > 0 && fwd >= bwd) {
        forward.count = countF + fwd;
        backward.count = bwd > 0 ? countB : backward.count;
      }
    }

    backward.index = startIndex - backward.count;
    forward.index = startIndex + forward.count - 1;

    const { defaultSize } = misc.scroller.buffer;
    backward.padding = 0;
    forward.padding = Math.max(0, viewportSize - forward.count * defaultSize);

    return itemsCounter;
  };

const testSetItemSizeCase: ItFuncConfig = settings => misc => done =>
  misc.scroller.state.cycle.busy.on(pending => {
    if (pending) {
      return;
    }
    const { fetch, clip } = misc.scroller.state;
    expect(misc.workflow.cyclesDone).toEqual(1);
    expect(fetch.callCount).toEqual(2);
    expect(misc.innerLoopCount).toEqual(3);
    expect(clip.callCount).toEqual(0);
    expect(misc.padding.backward.getSize()).toEqual(0);
    expect(misc.padding.forward.getSize()).toEqual(0);

    const startIndex = settings.datasourceSettings.startIndex as number;
    const tplSettings = settings.templateSettings || {};
    const itemSize = tplSettings[misc.horizontal ? 'itemWidth' : 'itemHeight'] as number;
    const itemsCounter = getSetItemSizeCounter(settings, misc, itemSize);
    testItemsCounter(startIndex, misc, itemsCounter);
    done();
  });

const testNotSetItemSizeCase: ItFuncConfig = settings => misc => done =>
  misc.scroller.state.cycle.innerLoop.busy.on(loopPending => {
    if (loopPending) {
      return;
    }
    const loopCount = misc.innerLoopCount;
    if (loopCount === 4) {
      expect(misc.workflow.cyclesDone).toEqual(0);
      expect(misc.scroller.state.fetch.callCount).toEqual(3);
      expect(misc.scroller.state.clip.callCount).toEqual(0);
      done();
      return;
    }
    let itemsCounter;
    const initialItemSize = settings.datasourceSettings.itemSize as number;
    const startIndex = settings.datasourceSettings.startIndex as number;
    const tplSettings = settings.templateSettings || {};
    const itemSize = tplSettings[misc.horizontal ? 'itemWidth' : 'itemHeight'] as number;
    if (loopCount === 1) {
      itemsCounter = getNotSetItemSizeCounter(settings, misc, initialItemSize);
    } else {
      itemsCounter = getNotSetItemSizeCounter(settings, misc, itemSize, misc.shared.itemsCounter as ItemsCounter);
    }
    testItemsCounter(startIndex, misc, itemsCounter);
    misc.shared.itemsCounter = itemsCounter;
  });

describe('Initial Load Spec', () => {

  describe('Fixed itemSize', () => {
    fixedItemSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should make 2 fetches to satisfy padding limits',
        it: testSetItemSizeCase(config)
      })
    );
    fixedItemSizeAndBigBufferSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should make 2 fetches to overflow padding limits (bufferSize is big enough)',
        it: testSetItemSizeCase(config)
      })
    );
  });

  describe('Tuned itemSize', () => {
    tunedItemSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should make 3 fetches to satisfy padding limits',
        it: testNotSetItemSizeCase(config)
      })
    );
    tunedItemSizeAndBigBufferSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should make 3 fetches to overflow padding limits (bufferSize is big enough)',
        it: testNotSetItemSizeCase(config)
      })
    );
  });

  describe('No itemSize', () => {
    noItemSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should make 3 fetches to satisfy padding limits',
        it: testNotSetItemSizeCase(config)
      })
    );
    noItemSizeAndBigBufferConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should make 3 fetches to overflow padding limits (bufferSize is big enough)',
        it: testNotSetItemSizeCase(config)
      })
    );
  });

});
