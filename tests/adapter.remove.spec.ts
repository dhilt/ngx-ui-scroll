import { ItemsPredicate } from './miscellaneous/vscroll';

import { makeTest, TestBedConfig } from './scaffolding/runner';
import { getDatasourceClassForRemovals } from './scaffolding/datasources/class';
import { Misc } from './miscellaneous/misc';
import { IndexedItem, removeItems } from './miscellaneous/items';
import { getDynamicSumSize, getDynamicSizeByIndex } from './miscellaneous/dynamicSize';

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
  },
}, {
  ...baseConfigOut, custom: {
    removeBwd: [-51, -52, -53, -54, -55],
    removeFwd: [51, 52, 53, 54, 55],
    useIndexes: true,
    text: 'backward and forward'
  }
}];

const configListDynamicBuffer: TestBedConfig[] = [{
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' },
  datasourceSettings: { startIndex: 10, minIndex: 1, maxIndex: 20, bufferSize: 1, padding: 0.5, adapter: true },
  custom: { indexToRemove: 11, size: 100, increase: false }
}, {
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' },
  datasourceSettings: { startIndex: 11, minIndex: 1, maxIndex: 20, bufferSize: 1, padding: 0.5, adapter: true },
  custom: { indexToRemove: 9, size: 100, increase: false }
}, {
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' },
  datasourceSettings: { startIndex: 10, minIndex: 1, maxIndex: 20, bufferSize: 1, padding: 0.5, adapter: true },
  custom: { indexToRemove: 11, size: 100, increase: true }
}, {
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' },
  datasourceSettings: { startIndex: 11, minIndex: 1, maxIndex: 20, bufferSize: 1, padding: 0.5, adapter: true },
  custom: { indexToRemove: 9, size: 100, increase: true }
}].map(config => ({
  ...config,
  datasourceClass: getDatasourceClassForRemovals(config.datasourceSettings)
}));

const configListDynamicVirtual: TestBedConfig[] = [{
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' },
  datasourceSettings: { startIndex: 20, minIndex: 1, maxIndex: 20, bufferSize: 1, padding: 0.5, adapter: true },
  datasourceDevSettings: { cacheOnReload: true },
  custom: { indexToReload: 2, indexToRemove: 20, size: 100, increase: false }
}, {
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' },
  datasourceSettings: { startIndex: 1, minIndex: 1, maxIndex: 20, bufferSize: 1, padding: 0.5, adapter: true },
  datasourceDevSettings: { cacheOnReload: true },
  custom: { indexToReload: 15, indexToRemove: 1, size: 100, increase: false }
}, {
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' },
  datasourceSettings: { startIndex: 20, minIndex: 1, maxIndex: 20, bufferSize: 1, padding: 0.5, adapter: true },
  datasourceDevSettings: { cacheOnReload: true },
  custom: { indexToReload: 2, indexToRemove: 20, size: 100, increase: true }
}, {
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' },
  datasourceSettings: { startIndex: 1, minIndex: 1, maxIndex: 20, bufferSize: 1, padding: 0.5, adapter: true },
  datasourceDevSettings: { cacheOnReload: true },
  custom: { indexToReload: 15, indexToRemove: 1, size: 100, increase: true }
}].map(config => ({
  ...config,
  datasourceClass: getDatasourceClassForRemovals(config.datasourceSettings, config.datasourceDevSettings)
}));

const doRemove = async (config: TestBedConfig, misc: Misc, byId = false) => {
  const { increase, useIndexes, remove, removeBwd, removeFwd } = config.custom;
  const indexList = remove || [...removeBwd, ...removeFwd];
  const indexListInterrupted = config.custom.interrupted;
  // remove item from the original datasource
  misc.setDatasourceProcessor((result: IndexedItem[]) =>
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
  const { size: bufferSizeBeforeRemove, minIndex, maxIndex, absMinIndex, absMaxIndex } = misc.scroller.buffer;
  const { remove: indexList, increase } = config.custom;
  const viewportSizeBeforeRemove = misc.getScrollableSize();
  const sizeToRemove = indexList.length * misc.getItemSize();
  const deltaSize = viewportSizeBeforeRemove - sizeToRemove;

  const loopPendingSub = misc.adapter.loopPending$.subscribe(loopPending => {
    if (!loopPending) { // when the first loop after the Remove is done
      const len = indexList.length;
      const { size, minIndex: min, maxIndex: max, absMinIndex: absMin, absMaxIndex: absMax } = misc.scroller.buffer;
      expect(size).toEqual(bufferSizeBeforeRemove - len);
      expect(min).toBe(minIndex + (increase ? len : 0));
      expect(max).toBe(maxIndex - (increase ? 0 : len));
      expect(absMin).toBe(absMinIndex + (increase ? len : 0));
      expect(absMax).toBe(absMaxIndex - (increase ? 0 : len));
      expect(deltaSize).toEqual(misc.getScrollableSize());
      loopPendingSub.unsubscribe();
    }
  });

  await doRemove(config, misc, byId);

  const { firstIndex, lastIndex, items } = misc.scroller.buffer;
  if (!isNaN(firstIndex) && !isNaN(lastIndex)) {
    // check all items contents
    (items as IndexedItem[]).forEach(({ $index, data: { id } }) => {
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
  expect(misc.workflow.errors[0].process).toContain('remove');
  done();
};

const shouldRemoveVirtual = (config: TestBedConfig) => (misc: Misc) => async (done: Function) => {
  const { datasourceSettings: { minIndex, maxIndex, itemSize } } = config;
  const { remove, removeBwd, removeFwd } = config.custom;
  const indexList: number[] = remove || [...removeBwd, ...removeFwd];
  await misc.relaxNext();
  const { $index: indexFirst, data: { id: idFirst } } = misc.adapter.firstVisible;
  await doRemove(config, misc);
  const size = (maxIndex - minIndex + 1 - indexList.length) * itemSize;
  const shift = indexList.reduce((acc: number, i) => acc + (i < indexFirst ? 1 : 0), 0);
  expect(misc.scroller.viewport.getScrollableSize()).toBe(size);
  expect(misc.adapter.firstVisible.$index).toBe(indexFirst - shift);
  expect(misc.adapter.firstVisible.data.id).toBe(idFirst);

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

type DS = InstanceType<ReturnType<typeof getDatasourceClassForRemovals>>;

const scrollDownToIndex = async (misc: Misc, index: number) => {
  const { adapter } = misc;
  while (adapter.bufferInfo.lastIndex < index) {
    adapter.fix({ scrollToItem: ({ $index }) => $index === adapter.bufferInfo.lastIndex });
    await misc.relaxNext();
  }
};

const shouldRemoveDynamicSize = (config: TestBedConfig) => (misc: Misc) => async (done: Function) => {
  const { custom: { indexToReload, indexToRemove, size, increase } } = config;
  const { datasourceSettings: { minIndex, maxIndex, startIndex } } = config;
  const ds = misc.datasource as DS;
  const finalSize = getDynamicSumSize(minIndex, maxIndex) - getDynamicSizeByIndex(indexToRemove);

  // set DS sizes
  ds.data.forEach(item => item.size = getDynamicSizeByIndex(item.id));
  ds.data[indexToRemove - minIndex].size = size;
  await misc.relaxNext();

  if (Number.isInteger(indexToReload)) {
    await misc.adapter.reload(indexToReload);
  }

  // remove item from DS and Scroller
  const { $index, data: { id } } = misc.adapter.firstVisible;
  const { averageSize } = misc.scroller.buffer;
  ds.remove([indexToRemove], increase);
  await misc.adapter.remove({ indexes: [indexToRemove], increase });
  let shift = 0;
  if (increase && indexToRemove > $index) {
    shift = 1;
  } else if (!increase && indexToRemove < $index) {
    shift = -1;
  }
  expect(misc.adapter.firstVisible.$index).toBe($index + shift);
  expect(misc.adapter.firstVisible.data.id).toBe(id);
  expect(misc.scroller.buffer.averageSize).not.toBe(averageSize);

  misc.scrollMin();
  await misc.relaxNext();
  await scrollDownToIndex(misc, maxIndex - (increase ? 0 : 1));
  expect(misc.getScrollableSize()).toBe(finalSize);

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
        title: `should remove fix-sized items out of buffer (${config.custom.text})`,
        it: shouldRemoveVirtual(config)
      })
    );
  });

  describe('Dynamic size', () => {
    configListDynamicBuffer.forEach(config =>
      makeTest({
        config,
        title: `should remove dynamic-sized items from buffer` + (config.custom.increase ? ' (increase)' : ''),
        it: shouldRemoveDynamicSize(config)
      })
    );

    configListDynamicVirtual.forEach(config =>
      makeTest({
        config,
        title: `should remove dynamic-sized items out of buffer`,
        it: shouldRemoveDynamicSize(config)
      })
    );
  });

});
