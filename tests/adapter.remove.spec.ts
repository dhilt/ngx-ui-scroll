import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { removeItems } from './miscellaneous/items';
import { AdapterProcess, ItemsPredicate } from '../src/component/interfaces/index';

const baseConfig: TestBedConfig = {
  datasourceName: 'limited--99-100-processor',
  templateSettings: { viewportHeight: 100 }
};

const configList: TestBedConfig[] = [{
  ...baseConfig,
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.2, itemSize: 20 },
  custom: { remove: [3, 4, 5] }
}, {
  ...baseConfig,
  datasourceSettings: { startIndex: 55, bufferSize: 8, padding: 1, itemSize: 20 },
  custom: { remove: [54, 55, 56, 57, 58] }
}, {
  ...baseConfig,
  datasourceSettings: { startIndex: 10, bufferSize: 5, padding: 0.2, itemSize: 20 },
  custom: { remove: [7, 8, 9] }
}];

configList.forEach(config => config.datasourceSettings.adapter = true);

const configListInterrupted = [{
  ...configList[0],
  custom: {
    remove: [2, 3],
    interrupted: [2, 3, 5, 6]
  }
}, {
  ...configList[1],
  custom: {
    remove: [54],
    interrupted: [54, 56, 57, 58]
  }
}];

const configListIncrease = configList.map(config => ({
  ...config,
  custom: {
    ...config.custom,
    increase: true
  }
}));

const configListIndexes = [
  configList[0], configListInterrupted[1], configListIncrease[2]
].map(config => ({
  ...config,
  custom: {
    ...config.custom,
    useIndexes: true
  }
}));

const configListEmpty = [{
  ...configList[0],
  custom: { ...configList[0].custom, predicate: (({ $index }) => $index > 999) as ItemsPredicate }
}, {
  ...configList[1],
  custom: { ...configList[1].custom, indexes: [999] }
}];

const configListBad = [{
  ...configList[0],
  custom: { ...configList[0].custom, predicate: null }
}, {
  ...configList[1],
  custom: { ...configList[1].custom, predicate: () => null }
}, {
  ...configList[0],
  custom: { ...configList[0].custom, predicate: (x: any, y: any) => null }
}];

const baseConfigOut: TestBedConfig = {
  ...configList[0],
  datasourceSettings: {
    ...configList[0].datasourceSettings,
    startIndex: 1,
    minIndex: -99,
    maxIndex: 100
  }
};

const configListOutFixed: TestBedConfig[] = [{
  ...baseConfigOut, custom: {
    remove: [51, 52, 53, 54, 55],
    useIndexes: true,
    text: 'forward'
  }
}, {
  ...baseConfigOut, custom: {
    remove: [-51, -52, -53, -54, -55],
    useIndexes: true,
    text: 'backward'
  }
}, {
  ...baseConfigOut, custom: {
    removeBwd: [-51, -52, -53, -54, -55],
    removeFwd: [51, 52, 53, 54, 55],
    useIndexes: true,
    text: 'backward and forward'
  }
}];

const configListOutDynamic: TestBedConfig[] = [{
  datasourceName: 'limited--99-100-dynamic-size-processor',
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' },
  datasourceSettings: { startIndex: 1, maxIndex: 100, bufferSize: 10, padding: 0.2, adapter: true },
  custom: {
    remove: [100], // must be the last index in the datasource
    useIndexes: true
  }
}];

const doRemove = async (config: TestBedConfig, misc: Misc, byId = false) => {
  const { increase, useIndexes, remove, removeBwd, removeFwd } = config.custom;
  const indexList = remove || [...removeBwd, ...removeFwd];
  const indexListInterrupted = config.custom.interrupted;
  // remove item from the original datasource
  (misc.datasource as any).setProcessGet((result: any[]) =>
    [removeBwd, removeFwd, remove].forEach(list =>
      list && removeItems(result, list, -99, 100, increase)
    )
  );
  // remove items from the UiScroll
  if (useIndexes) {
    await misc.adapter.remove({
      indexes: indexListInterrupted || indexList,
      increase
    });
  } else {
    await misc.adapter.remove({
      predicate: item =>
        (indexListInterrupted || indexList).some((i: number) =>
          i === (byId ? item.data.id : item.$index)
        ),
      increase
    });
  }
};

const shouldRemove = (config: TestBedConfig, byId = false) => (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();
  const bufferSizeBeforeRemove = misc.scroller.buffer.size;
  const { remove: indexList, increase } = config.custom;
  const { minIndex, maxIndex } = misc.scroller.buffer;
  const viewportSizeBeforeRemove = misc.getScrollableSize();
  const sizeToRemove = indexList.length * misc.getItemSize();
  const deltaSize = viewportSizeBeforeRemove - sizeToRemove;

  const loopPendingSub = misc.adapter.loopPending$.subscribe(loopPending => {
    if (!loopPending) { // when the first loop after the Remove is done
      const len = indexList.length;
      const { minIndex: min, maxIndex: max, size } = misc.scroller.buffer;
      expect(size).toEqual(bufferSizeBeforeRemove - len);
      expect(min).toBe(minIndex + (increase ? len : 0));
      expect(max).toBe(maxIndex - (increase ? 0 : len));
      expect(deltaSize).toEqual(misc.getScrollableSize());
      loopPendingSub.unsubscribe();
    }
  });

  await doRemove(config, misc, byId);

  const { firstIndex, lastIndex, items } = misc.scroller.buffer;
  expect(misc.scroller.state.clip.callCount).toEqual(1);
  if (firstIndex !== null && lastIndex !== null) {
    // check all items contents
    items.forEach(({ $index, data: { id } }) => {
      const diff = indexList.reduce((acc: number, index: number) =>
        acc + (increase ? (id < index ? -1 : 0) : (id > index ? 1 : 0)), 0
      );
      expect(misc.checkElementContent($index, $index + diff)).toEqual(true);
    });
  }

  done();
};

const shouldSkip = (config: TestBedConfig) => (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();
  const innerLoopCount = misc.innerLoopCount;
  const { predicate, indexes } = config.custom;
  if (predicate) {
    await misc.adapter.remove({ predicate });
  } else if (indexes) {
    await misc.adapter.remove({ indexes });
  }
  expect(misc.workflow.cyclesDone).toEqual(1);
  expect(misc.innerLoopCount).toEqual(innerLoopCount);
  expect(misc.workflow.errors.length).toEqual(0);
  done();
};

const shouldBreak = (config: TestBedConfig) => (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();
  const innerLoopCount = misc.innerLoopCount;
  // call remove with wrong predicate
  await misc.adapter.remove({ predicate: config.custom.predicate });
  expect(misc.workflow.cyclesDone).toEqual(1);
  expect(misc.innerLoopCount).toEqual(innerLoopCount);
  expect(misc.workflow.errors.length).toEqual(1);
  expect(misc.workflow.errors[0].process).toEqual(AdapterProcess.remove);
  done();
};

const shouldRemoveOutOfViewFixed = (config: TestBedConfig) => (misc: Misc) => async (done: Function) => {
  const { datasourceSettings: { minIndex, maxIndex, itemSize } } = config;
  const { remove, removeBwd, removeFwd } = config.custom;
  const indexList = remove || [...removeBwd, ...removeFwd];
  await misc.relaxNext();
  await doRemove(config, misc);
  const size = (maxIndex - minIndex + 1 - indexList.length) * itemSize;
  expect(misc.scroller.viewport.getScrollableSize()).toBe(size);

  // let's scroll to the first row before the removed
  const min = Math.min(...(removeBwd || remove));
  const prev = min - 1;
  const scrollPosition = Math.abs(minIndex - prev) * itemSize;
  misc.adapter.fix({ scrollPosition });
  await misc.relaxNext();
  expect(misc.adapter.firstVisible.$index).toBe(prev);
  expect(misc.checkElementContent(prev, prev)).toBe(true);
  expect(misc.checkElementContent(min, min + (removeBwd || remove).length)).toBe(true);

  // check if the very last row had been shifted
  misc.adapter.fix({ scrollPosition: Infinity });
  await misc.relaxNext();
  expect(misc.adapter.lastVisible.$index).toBe(maxIndex - indexList.length);
  expect(misc.checkElementContent(maxIndex - indexList.length, maxIndex)).toBe(true);
  expect(misc.scroller.viewport.getScrollableSize()).toBe(size);
  done();
};

const shouldRemoveOutOfViewDynamic = (config: TestBedConfig) => (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();

  // scroll to the very bottom
  const position = misc.getScrollPosition();
  await misc.scrollDownRecursively();
  expect(misc.adapter.eof).toEqual(true);
  const indexToRemove = config.custom.remove[0];
  const { scroller: { viewport }, adapter } = misc;
  expect(adapter.lastVisible.$index).toBe(indexToRemove);
  const sizeToRemove = misc.routines.getSize(adapter.lastVisible.element as HTMLElement);
  expect(sizeToRemove).toBeGreaterThan(0);

  // scroll back to start item
  misc.scrollTo(position);
  await misc.relaxNext();
  const viewportSizeBeforeRemove = misc.getScrollableSize();

  // remove invisible lat row
  await doRemove(config, misc);
  const viewportSizeAfterRemove = viewportSizeBeforeRemove - sizeToRemove;
  expect(misc.getScrollableSize()).toBe(viewportSizeAfterRemove);

  // scroll to the very bottom again
  misc.scrollMax();
  await misc.relaxNext();
  expect(misc.getScrollableSize()).toBe(viewportSizeAfterRemove);
  expect(adapter.lastVisible.$index).toBe(indexToRemove - 1);
  expect(viewport.paddings.forward.size).toBe(0);

  done();
};

describe('Adapter Remove Spec', () => {

  describe('Buffer', () => {
    configList.forEach(config =>
      makeTest({
        config,
        title: 'should remove by index',
        it: shouldRemove(config)
      })
    );

    configList.forEach(config =>
      makeTest({
        config,
        title: 'should remove by id',
        it: shouldRemove(config, true)
      })
    );

    configListInterrupted.forEach(config =>
      makeTest({
        config,
        title: 'should remove only first uninterrupted portion',
        it: shouldRemove(config)
      })
    );

    configListIncrease.forEach(config =>
      makeTest({
        config,
        title: 'should increase indexes before removed items',
        it: shouldRemove(config)
      })
    );

    configListIndexes.forEach(config =>
      makeTest({
        config,
        title: 'should remove using "indexes" option',
        it: shouldRemove(config)
      })
    );
  });

  describe('Empty', () => {
    configListEmpty.forEach(config =>
      makeTest({
        config,
        title: `should not remove due to empty ${config.custom.predicate ? 'predicate' : 'indexes'}`,
        it: shouldSkip(config)
      })
    );

    configListBad.forEach(config =>
      makeTest({
        config,
        title: 'should break due to wrong predicate',
        it: shouldBreak(config)
      })
    );
  });

  describe('Virtual', () => {
    configListOutFixed.forEach(config =>
      makeTest({
        config,
        title: `should remove fix-sized items out of view (${config.custom.text})`,
        it: shouldRemoveOutOfViewFixed(config)
      })
    );

    configListOutDynamic.forEach(config =>
      makeTest({
        config,
        title: `should remove dynamic-sized items out of view`,
        it: shouldRemoveOutOfViewDynamic(config)
      })
    );
  });

});
