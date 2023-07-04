import {
  makeTest,
  TestBedConfig,
  ItFuncConfig,
  ItFunc
} from '../scaffolding/runner';
import {
  DatasourceRemover,
  getDatasourceClassForRemovals
} from '../scaffolding/datasources/class';
import { Misc } from '../miscellaneous/misc';
import {
  getDynamicSumSize,
  getDynamicSizeByIndex
} from '../miscellaneous/dynamicSize';
import { ItemsPredicate, SizeStrategy } from '../miscellaneous/vscroll';

interface ICustom {
  remove: number[];
  predicate?: ItemsPredicate;
  indexes?: number[];
}

interface ICustomCommon {
  remove?: number[];
  removeBwd?: number[];
  removeFwd?: number[];
  useIndexes?: boolean;
  text?: string;
  indexToRemove?: number;
  size?: number;
  increase?: boolean;
  indexToReload?: number;
}

interface ICustomFlush {
  text: string;
  fixRight: boolean;
  first: number;
  last: number;
}

interface ICustomBreak {
  predicate: unknown;
}

interface ICustomBoth {
  text: string;
  toRemove: number[];
  increase?: boolean;
  result: {
    min: number;
    max: number;
  };
}

const configList: TestBedConfig<ICustom>[] = [
  {
    datasourceSettings: {
      startIndex: 1,
      bufferSize: 5,
      padding: 0.2,
      itemSize: 20
    },
    custom: { remove: [3, 4, 5] }
  },
  {
    datasourceSettings: {
      startIndex: 55,
      bufferSize: 8,
      padding: 1,
      itemSize: 20
    },
    custom: { remove: [54, 55, 56, 57, 58] }
  },
  {
    datasourceSettings: {
      startIndex: 10,
      bufferSize: 5,
      padding: 0.2,
      itemSize: 20
    },
    custom: { remove: [7, 8, 9] }
  }
].map(config => ({
  ...config,
  templateSettings: { viewportHeight: 100 },
  datasourceClass: getDatasourceClassForRemovals({
    settings: config.datasourceSettings,
    common: { limits: { min: -99, max: 100 } }
  })
}));

const configListInterrupted: TestBedConfig<ICustomCommon>[] = [
  {
    ...configList[0],
    custom: {
      remove: [2, 3, 5, 6]
    }
  },
  {
    ...configList[1],
    custom: {
      remove: [54, 56, 57, 58]
    }
  }
];

const configListIncrease = configList.map(config => ({
  ...config,
  custom: {
    ...config.custom,
    increase: true
  }
}));

const configListIndexes = [
  configList[0],
  configListInterrupted[1],
  configListIncrease[2]
].map(config => ({
  ...config,
  custom: {
    ...config.custom,
    useIndexes: true
  }
}));

const configListEmpty: TestBedConfig<ICustom>[] = [
  {
    ...configList[0],
    custom: { ...configList[0].custom, predicate: ({ $index }) => $index > 999 }
  },
  {
    ...configList[1],
    custom: { ...configList[1].custom, indexes: [999] }
  }
];

const configListBad: TestBedConfig<ICustomBreak>[] = [
  {
    ...configList[0],
    custom: { ...configList[0].custom, predicate: null }
  },
  {
    ...configList[1],
    custom: { ...configList[1].custom, predicate: () => null }
  },
  {
    ...configList[0],
    custom: {
      ...configList[0].custom,
      predicate: (_x: number, _y: number) => null
    }
  }
];

const baseConfigOut = {
  ...configList[0],
  datasourceSettings: {
    ...configList[0].datasourceSettings,
    startIndex: 1,
    minIndex: -99,
    maxIndex: 100
  }
};
baseConfigOut.datasourceClass = getDatasourceClassForRemovals({
  settings: baseConfigOut.datasourceSettings
});

const configListOutFixed: TestBedConfig<ICustomCommon>[] = [
  {
    ...baseConfigOut,
    custom: {
      remove: [51, 52, 53, 54, 55],
      useIndexes: true,
      text: 'forward'
    }
  },
  {
    ...baseConfigOut,
    custom: {
      remove: [-51, -52, -53, -54, -55],
      useIndexes: true,
      text: 'backward'
    }
  },
  {
    ...baseConfigOut,
    custom: {
      removeBwd: [-51, -52, -53, -54, -55],
      removeFwd: [51, 52, 53, 54, 55],
      useIndexes: true,
      text: 'backward and forward'
    }
  }
];

const configListDynamicBuffer: TestBedConfig<ICustomCommon>[] = [
  {
    datasourceSettings: {
      startIndex: 10,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.5,
      sizeStrategy: SizeStrategy.Average
    },
    custom: { indexToRemove: 11, size: 100, increase: false }
  },
  {
    datasourceSettings: {
      startIndex: 11,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.5,
      sizeStrategy: SizeStrategy.Frequent
    },
    custom: { indexToRemove: 9, size: 100, increase: false }
  },
  {
    datasourceSettings: {
      startIndex: 10,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.5,
      sizeStrategy: SizeStrategy.Average
    },
    custom: { indexToRemove: 11, size: 100, increase: true }
  },
  {
    datasourceSettings: {
      startIndex: 11,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.5,
      sizeStrategy: SizeStrategy.Frequent
    },
    custom: { indexToRemove: 9, size: 100, increase: true }
  }
].map(config => ({
  ...config,
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' },
  datasourceClass: getDatasourceClassForRemovals({
    settings: config.datasourceSettings
  })
}));

const configListDynamicVirtual: TestBedConfig<ICustomCommon>[] = [
  {
    datasourceSettings: {
      startIndex: 20,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.5,
      sizeStrategy: SizeStrategy.Average
    },
    datasourceDevSettings: { cacheOnReload: true },
    custom: { indexToReload: 2, indexToRemove: 20, size: 100, increase: false }
  },
  {
    datasourceSettings: {
      startIndex: 1,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.5,
      sizeStrategy: SizeStrategy.Frequent
    },
    datasourceDevSettings: { cacheOnReload: true },
    custom: { indexToReload: 15, indexToRemove: 1, size: 100, increase: false }
  },
  {
    datasourceSettings: {
      startIndex: 20,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.5,
      sizeStrategy: SizeStrategy.Average
    },
    datasourceDevSettings: { cacheOnReload: true },
    custom: { indexToReload: 2, indexToRemove: 20, size: 100, increase: true }
  },
  {
    datasourceSettings: {
      startIndex: 1,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.5,
      sizeStrategy: SizeStrategy.Frequent
    },
    datasourceDevSettings: { cacheOnReload: true },
    custom: { indexToReload: 15, indexToRemove: 1, size: 100, increase: true }
  }
].map(config => ({
  ...config,
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' },
  datasourceClass: getDatasourceClassForRemovals({
    settings: config.datasourceSettings,
    devSettings: config.datasourceDevSettings
  })
}));

const configListFlush: TestBedConfig<ICustomFlush>[] = [
  {
    datasourceSettings: {
      startIndex: 1,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.5
    },
    custom: { text: 'bof', fixRight: false, first: 1, last: 8 }
  },
  {
    datasourceSettings: {
      startIndex: 1,
      minIndex: 1,
      maxIndex: 15,
      bufferSize: 1,
      padding: 0.5
    },
    custom: { text: 'bof and 15 items', fixRight: true, first: 9, last: 15 }
  },
  {
    datasourceSettings: {
      startIndex: 1,
      minIndex: 1,
      maxIndex: 30,
      bufferSize: 1,
      padding: 0.5
    },
    custom: { text: 'bof and 30 items', fixRight: true, first: 9, last: 16 }
  },
  {
    datasourceSettings: {
      startIndex: 20,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.5
    },
    custom: { text: 'eof', fixRight: false, first: 5, last: 12 }
  },
  {
    datasourceSettings: {
      startIndex: 15,
      minIndex: 1,
      maxIndex: 15,
      bufferSize: 1,
      padding: 0.5
    },
    custom: { text: 'eof and 15 items', fixRight: true, first: 9, last: 15 }
  },
  {
    datasourceSettings: {
      startIndex: 15,
      minIndex: 1,
      maxIndex: 25,
      bufferSize: 1,
      padding: 0.5
    },
    custom: { text: 'eof and 25 items', fixRight: true, first: 18, last: 25 }
  }
].map(config => ({
  ...config,
  templateSettings: { viewportHeight: 100 },
  datasourceClass: getDatasourceClassForRemovals({
    settings: config.datasourceSettings
  })
}));

const configListBufferAndVirtual: TestBedConfig<ICustomBoth>[] = [
  {
    datasourceSettings: {
      startIndex: 1,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.3
    },
    custom: {
      text: 'the bottom virtual item is not reached',
      toRemove: [1, 20],
      increase: false,
      result: { min: 1, max: 18 }
    }
  },
  {
    datasourceSettings: {
      startIndex: 1,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.3
    },
    custom: {
      text: 'the bottom virtual item is not reached (increase)',
      toRemove: [1, 20],
      increase: true,
      result: { min: 3, max: 20 }
    }
  },
  {
    datasourceSettings: {
      startIndex: 20,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.3
    },
    custom: {
      text: 'the top virtual item is not reached',
      toRemove: [1, 20],
      increase: false,
      result: { min: 1, max: 18 }
    }
  },
  {
    datasourceSettings: {
      startIndex: 20,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.3
    },
    custom: {
      text: 'the top virtual item is not reached (increase)',
      toRemove: [1, 20],
      increase: true,
      result: { min: 3, max: 20 }
    }
  },
  {
    datasourceSettings: {
      startIndex: 1,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.3
    },
    custom: {
      text: 'the bottom virtual item is not reached, v2',
      toRemove: [2, 3, 17, 18],
      increase: false,
      result: { min: 1, max: 16 }
    }
  },
  {
    datasourceSettings: {
      startIndex: 1,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.3
    },
    custom: {
      text: 'the bottom virtual item is not reached, v2 (increase)',
      toRemove: [2, 3, 17, 18],
      increase: true,
      result: { min: 5, max: 20 }
    }
  },
  {
    datasourceSettings: {
      startIndex: 20,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.3
    },
    custom: {
      text: 'the top virtual item is not reached, v2',
      toRemove: [2, 3, 17, 18],
      increase: false,
      result: { min: 1, max: 16 }
    }
  },
  {
    datasourceSettings: {
      startIndex: 20,
      minIndex: 1,
      maxIndex: 20,
      bufferSize: 1,
      padding: 0.3
    },
    custom: {
      text: 'the top virtual item is not reached (increase)',
      toRemove: [2, 3, 17, 18],
      increase: true,
      result: { min: 5, max: 20 }
    }
  }
].map(config => ({
  ...config,
  templateSettings: { viewportHeight: 100 },
  datasourceClass: getDatasourceClassForRemovals({
    settings: config.datasourceSettings
  })
}));

const doRemove = async (
  config: TestBedConfig<ICustomCommon>,
  misc: Misc,
  byId = false
) => {
  const { increase, useIndexes, remove, removeBwd, removeFwd } = config.custom;
  const indexList = remove || [...(removeBwd || []), ...(removeFwd || [])];
  const ds = misc.datasource as DatasourceRemover;
  // remove item from the original datasource
  ds.remove(indexList, !!increase);
  // remove items from the UiScroll
  if (useIndexes) {
    await misc.adapter.remove({
      indexes: indexList,
      increase
    });
  } else {
    await misc.adapter.remove({
      predicate: item =>
        indexList.some(
          (i: number) => i === (byId ? item.data.id : item.$index)
        ),
      increase
    });
  }
};

const shouldRemove =
  (config: TestBedConfig<ICustomCommon>, byId = false): ItFunc =>
  misc =>
  async done => {
    await misc.relaxNext();
    const {
      size: bufferSizeBeforeRemove,
      minIndex,
      maxIndex,
      absMinIndex,
      absMaxIndex
    } = misc.scroller.buffer;
    const { remove, increase } = config.custom;
    const indexList = remove as number[];
    const viewportSizeBeforeRemove = misc.getScrollableSize();
    const sizeToRemove = indexList.length * misc.getItemSize();
    const deltaSize = viewportSizeBeforeRemove - sizeToRemove;

    const loopPendingSub = misc.adapter.loopPending$.subscribe(loopPending => {
      if (!loopPending) {
        // when the first loop after the Remove is done
        const len = indexList.length;
        const {
          size,
          minIndex: min,
          maxIndex: max,
          absMinIndex: absMin,
          absMaxIndex: absMax
        } = misc.scroller.buffer;
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
      items.forEach(({ $index, data: { id } }) => {
        const diff = indexList.reduce(
          (acc: number, index: number) =>
            acc + (increase ? (id < index ? -1 : 0) : id > index ? 1 : 0),
          0
        );
        expect(misc.checkElementContent($index, $index + diff)).toEqual(true);
      });
    }

    done();
  };

const shouldSkip: ItFuncConfig<ICustom> = config => misc => async done => {
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

const shouldBreak: ItFuncConfig<ICustomBreak> =
  config => misc => async done => {
    await misc.relaxNext();
    const innerLoopCount = misc.innerLoopCount;
    const predicate = config.custom.predicate as ItemsPredicate;
    // call remove with wrong predicate
    await misc.adapter.remove({ predicate });
    expect(misc.workflow.cyclesDone).toEqual(1);
    expect(misc.innerLoopCount).toEqual(innerLoopCount);
    expect(misc.workflow.errors.length).toEqual(1);
    expect(misc.workflow.errors[0].process).toContain('remove');
    done();
  };

const shouldRemoveVirtual: ItFuncConfig<ICustomCommon> =
  config => misc => async done => {
    const minIndex = config.datasourceSettings.minIndex as number;
    const maxIndex = config.datasourceSettings.maxIndex as number;
    const itemSize = config.datasourceSettings.itemSize as number;
    const { remove, removeBwd, removeFwd } = config.custom;
    const indexList: number[] = remove || [
      ...(removeBwd || []),
      ...(removeFwd || [])
    ];
    await misc.relaxNext();
    const {
      $index: indexFirst,
      data: { id: idFirst }
    } = misc.adapter.firstVisible;
    await doRemove(config, misc);
    const size = (maxIndex - minIndex + 1 - indexList.length) * itemSize;
    const shift = indexList.reduce(
      (acc: number, i) => acc + (i < indexFirst ? 1 : 0),
      0
    );
    expect(misc.scroller.viewport.getScrollableSize()).toBe(size);
    expect(misc.adapter.firstVisible.$index).toBe(indexFirst - shift);
    expect(misc.adapter.firstVisible.data.id).toBe(idFirst);

    // let's scroll to the first row before the removed
    const min = Math.min(...(removeBwd || remove || []));
    const prev = min - 1;
    const scrollPosition = Math.abs(minIndex - prev) * itemSize;
    misc.adapter.fix({ scrollPosition });
    await misc.relaxNext();
    expect(misc.adapter.firstVisible.$index).toBe(prev);
    expect(misc.checkElementContent(prev, prev)).toBe(true);
    expect(
      misc.checkElementContent(min, min + (removeBwd || remove || []).length)
    ).toBe(true);

    // check if the very last row had been shifted
    misc.adapter.fix({ scrollPosition: Infinity });
    await misc.relaxNext();
    expect(misc.adapter.lastVisible.$index).toBe(maxIndex - indexList.length);
    expect(
      misc.checkElementContent(maxIndex - indexList.length, maxIndex)
    ).toBe(true);
    expect(misc.scroller.viewport.getScrollableSize()).toBe(size);

    done();
  };

const shouldRemoveDynamicSize: ItFuncConfig<ICustomCommon> =
  config => misc => async done => {
    const { indexToReload, size, increase } = config.custom;
    const indexToRemove = config.custom.indexToRemove as number;
    const minIndex = config.datasourceSettings.minIndex as number;
    const maxIndex = config.datasourceSettings.maxIndex as number;
    const ds = misc.datasource as DatasourceRemover;
    const finalSize =
      getDynamicSumSize(minIndex, maxIndex) -
      getDynamicSizeByIndex(indexToRemove);

    // set DS sizes
    ds.setSizes(getDynamicSizeByIndex);
    ds.data[indexToRemove - minIndex].size = size;
    await misc.relaxNext();

    if (Number.isInteger(indexToReload)) {
      await misc.adapter.reload(indexToReload);
    }

    // remove item from DS and Scroller
    const {
      $index,
      data: { id }
    } = misc.adapter.firstVisible;
    const { defaultSize } = misc.scroller.buffer;
    ds.remove([indexToRemove], !!increase);
    await misc.adapter.remove({ indexes: [indexToRemove], increase });
    let shift = 0;
    if (increase && indexToRemove > $index) {
      shift = 1;
    } else if (!increase && indexToRemove < $index) {
      shift = -1;
    }
    expect(misc.adapter.firstVisible.$index).toBe($index + shift);
    expect(misc.adapter.firstVisible.data.id).toBe(id);
    if (misc.scroller.settings.sizeStrategy === SizeStrategy.Average) {
      expect(misc.scroller.buffer.defaultSize).not.toBe(defaultSize);
    }

    await misc.scrollMinRelax();
    await misc.scrollToIndexRecursively(maxIndex - (increase ? 0 : 1));
    expect(misc.getScrollableSize()).toBe(finalSize);

    done();
  };

const shouldFlush: ItFuncConfig<ICustomFlush> =
  config => misc => async done => {
    const {
      adapter,
      scroller: { state, buffer }
    } = misc;
    const { first, last, fixRight } = config.custom;
    await misc.relaxNext();

    const ds = misc.datasource as DatasourceRemover;
    ds.remove(
      buffer.items.map(({ $index }) => $index),
      fixRight
    );
    await adapter.remove({ predicate: _item => true, increase: fixRight });

    expect(misc.workflow.cyclesDone).toEqual(2);
    expect(state.cycle.innerLoop.count).toBeGreaterThan(1);
    expect(buffer.firstIndex).toEqual(first);
    expect(buffer.lastIndex).toEqual(last);

    done();
  };

const shouldRemoveInBufferAndVirtual: ItFuncConfig<ICustomBoth> =
  config => misc => async done => {
    const {
      adapter,
      scroller: { buffer }
    } = misc;
    const { toRemove, increase, result } = config.custom;
    const ds = misc.datasource as DatasourceRemover;
    await misc.relaxNext();
    ds.remove(toRemove, !!increase);
    await adapter.remove({ indexes: toRemove, increase });
    expect(buffer.absMinIndex).toEqual(result.min);
    expect(buffer.absMaxIndex).toEqual(result.max);
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
        title: 'should remove portion of non-continuous indexes',
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
        title: `should not remove due to empty ${
          config.custom.predicate ? 'predicate' : 'indexes'
        }`,
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
        title:
          'should remove dynamic-sized items from buffer' +
          (config.custom.increase ? ' (increase)' : ''),
        it: shouldRemoveDynamicSize(config)
      })
    );

    configListDynamicVirtual.forEach(config =>
      makeTest({
        config,
        title: 'should remove dynamic-sized items out of buffer',
        it: shouldRemoveDynamicSize(config)
      })
    );
  });

  describe('Flush', () => {
    configListFlush.forEach(config =>
      makeTest({
        config,
        title: `should continue the Workflow if ${config.custom.text}${
          config.custom.fixRight ? ' (increase)' : ''
        }`,
        it: shouldFlush(config)
      })
    );
  });

  describe('Buffer and Virtual', () => {
    configListBufferAndVirtual.forEach(config =>
      makeTest({
        config,
        title: `should remove in-buffer and virtual items when ${config.custom.text}`,
        it: shouldRemoveInBufferAndVirtual(config)
      })
    );
  });
});
