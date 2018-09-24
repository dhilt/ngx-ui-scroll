import { Direction } from '../src/component/interfaces';
import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { ItemsCounter } from './miscellaneous/itemsCounter';

interface Custom {
  direction: Direction;
  count: number;
  bouncing?: boolean;
  mass?: boolean;
}

const singleForwardMaxScrollConfigList = [{
  datasourceSettings: { startIndex: 100, bufferSize: 4, padding: 0.22, itemSize: 20 },
  templateSettings: { viewportHeight: 71, itemHeight: 20 },
  custom: { direction: Direction.forward, count: 1 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.2, itemSize: 20 },
  templateSettings: { viewportHeight: 100 },
  custom: { direction: Direction.forward, count: 1 }
}, {
  datasourceSettings: { startIndex: -15, bufferSize: 12, padding: 0.98, itemSize: 20 },
  templateSettings: { viewportHeight: 66, itemHeight: 20 },
  custom: { direction: Direction.forward, count: 1 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 1, horizontal: true, itemSize: 90 },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true },
  custom: { direction: Direction.forward, count: 1 }
}, {
  datasourceSettings: { startIndex: -74, bufferSize: 4, padding: 0.72, horizontal: true, itemSize: 75 },
  templateSettings: { viewportWidth: 300, itemWidth: 75, horizontal: true },
  custom: { direction: Direction.forward, count: 1 }
}];
//  .reduce((acc, item, j) => [...acc, ...(j === 0 ? [{...item, datasourceDevSettings: { debug: true }}] : [])], []);

const treatIndex = (index: number) => index <= 3 ? index : (3 * 2 - index);

const massBouncingScrollsConfigListExpected = [{
  expected: (direction: string) => ({
    paddingSizeOpposite: 220,
    edgeItemIndexOpposite: Direction.forward === direction ? 104 : 99,
    edgeItemIndex: Direction.forward === direction ? 109 : 94
  })
}, {
  expected: (direction: string) => ({
    paddingSizeOpposite: 300,
    edgeItemIndexOpposite: Direction.forward === direction ? 7 : -1,
    edgeItemIndex: Direction.forward === direction ? 13 : -7
  })
}, {
  expected: (direction: string) => ({
    paddingSizeOpposite: 1180,
    edgeItemIndexOpposite: Direction.forward === direction ? 8 : -35,
    edgeItemIndex: Direction.forward === direction ? 19 : -46
  })
}, {
  expected: (direction: string) => ({
    paddingSizeOpposite: 10170,
    edgeItemIndexOpposite: Direction.forward === direction ? 61 : -38,
    edgeItemIndex: Direction.forward === direction ? 75 : -52
  })
}, {
  expected: (direction: string) => ({
    paddingSizeOpposite: 5310,
    edgeItemIndexOpposite: Direction.forward === direction ? -42 : -92,
    edgeItemIndex: Direction.forward === direction ? -34 : -100
  })
}, {
  expected: (direction: string) => ({
    paddingSizeOpposite: 3000,
    edgeItemIndexOpposite: Direction.forward === direction ? 36 : -20,
    edgeItemIndex: Direction.forward === direction ? 114 : -98
  })
}];
const massTwoDirectionalScrollsConfigListExpected = [{
  expected: (direction: string) => ({
    paddingSizeOpposite: 420,
    edgeItemIndexOpposite: Direction.forward === direction ? 120 : 83,
    edgeItemIndex: Direction.forward === direction ? 128 : 75
  })
}, {
  expected: (direction: string) => ({
    paddingSizeOpposite: 720,
    edgeItemIndexOpposite: Direction.forward === direction ? 36 : -30,
    edgeItemIndex: Direction.forward === direction ? 46 : -40
  })
}, {
  expected: (direction: string) => ({
    paddingSizeOpposite: 2260,
    edgeItemIndexOpposite: Direction.forward === direction ? 94 : -121,
    edgeItemIndex: Direction.forward === direction ? 112 : -139
  })
}, {
  expected: (direction: string) => ({
    paddingSizeOpposite: 10170,
    edgeItemIndexOpposite: Direction.forward === direction ? 91 : -68,
    edgeItemIndex: Direction.forward === direction ? 105 : -82
  })
}, {
  expected: (direction: string) => ({
    paddingSizeOpposite: 6030,
    edgeItemIndexOpposite: Direction.forward === direction ? -18 : -116,
    edgeItemIndex: Direction.forward === direction ? -9 : -125
  })
}, {
  expected: (direction: string) => ({
    paddingSizeOpposite: 5220,
    edgeItemIndexOpposite: Direction.forward === direction ? 230 : -214,
    edgeItemIndex: Direction.forward === direction ? 327 : -311
  })
}];

const singleBackwardMaxScrollConfigList =
  singleForwardMaxScrollConfigList.map((config, index) => ({
    ...config,
    custom: {
      ...config.custom,
      direction: Direction.backward
    }
  }));

const massForwardScrollsConfigList =
  singleForwardMaxScrollConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.backward,
      count: 3 + treatIndex(index) // 3-6 bwd scroll events per config
    }
  }));

const massBackwardScrollsConfigList =
  massForwardScrollsConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.backward,
      count: 3 + treatIndex(index) // 3-6 fwd scroll events per config
    }
  }));

const massBouncingScrollsConfigList_fwd =
  massForwardScrollsConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.forward,
      count: (3 + treatIndex(index)) * 2, // 3-6 (fwd + bwd) scroll events per config
      bouncing: true
    },
    expected: massBouncingScrollsConfigListExpected[index].expected(Direction.forward)
  }));

const massBouncingScrollsConfigList_bwd =
  massForwardScrollsConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.backward,
      count: (3 + treatIndex(index)) * 2, // 3-6 (fwd + bwd) scroll events per config
      bouncing: true
    },
    expected: massBouncingScrollsConfigListExpected[index].expected(Direction.backward)
  }));

const massTwoDirectionalScrollsConfigList_fwd =
  massForwardScrollsConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.forward,
      count: (3 + treatIndex(index)) * 2, // 3-6 fwd + 3-6 bwd scroll events per config
      mass: true
    },
    expected: massTwoDirectionalScrollsConfigListExpected[index].expected(Direction.forward)
  }));

const massTwoDirectionalScrollsConfigList_bwd =
  massForwardScrollsConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.backward,
      count: (3 + treatIndex(index)) * 2, // 3-6 fwd + 3-6 bwd scroll events per config
      mass: true
    },
    expected: massTwoDirectionalScrollsConfigListExpected[index].expected(Direction.backward)
  }));

const doScrollMax = (config: TestBedConfig, misc: Misc) => {
  if (config.custom.direction === Direction.forward) {
    misc.scrollMax();
  } else {
    misc.scrollMin();
  }
};

const invertDirection = (config: TestBedConfig) => {
  const _forward = config.custom.direction === Direction.forward;
  config.custom.direction = _forward ? Direction.backward : Direction.forward;
};

const getInitialItemsCounter = (misc: Misc): ItemsCounter => {
  misc.fixture.detectChanges();
  const { startIndex } = misc.scroller.settings;
  const edgeItem = misc.scroller.buffer.getEdgeVisibleItem(Direction.forward);
  const oppositeEdgeItem = misc.scroller.buffer.getEdgeVisibleItem(Direction.backward);
  const result = new ItemsCounter();
  result.set(Direction.forward, {
    count: (<any>edgeItem).$index - startIndex + 1,
    index: (<any>edgeItem).$index,
    padding: 0
  });
  result.set(Direction.backward, {
    count: startIndex - (<any>oppositeEdgeItem).$index,
    index: (<any>oppositeEdgeItem).$index,
    padding: 0
  });
  return result;
};

const getCurrentItemsCounter = (misc: Misc, direction: Direction, previous: ItemsCounter): ItemsCounter => {
  misc.fixture.detectChanges();
  const { bufferSize, padding } = misc.scroller.settings;
  const viewportSize = misc.scroller.viewport.getSize();
  const itemSize = misc.scroller.buffer.averageSize;
  const fwd = direction === Direction.forward;
  const opposite = fwd ? Direction.backward : Direction.forward;

  // handle direction (fetch)
  const delta = viewportSize * padding;
  const _singleFetchCount = Math.ceil(delta / itemSize);
  const singleFetchCount = Math.max(bufferSize, _singleFetchCount);
  const itemsToFetch = previous.direction && previous.direction !== direction ? _singleFetchCount : singleFetchCount;
  const newDirIndex = previous.get(direction).index + // previous edge index
    (previous.get(direction).padding / itemSize) + // how many items are needed to fill the padding
    (fwd ? 1 : -1) * itemsToFetch; // new pack of items

  // handle opposite (clip)
  const oppPadding = previous.get(opposite).padding;
  const previousTotalSize = previous.total * itemSize + previous.paddings;
  const sizeToClip = previousTotalSize - oppPadding - viewportSize - delta;
  const itemsToClip = Math.floor(sizeToClip / itemSize);
  const newOppIndex = previous.get(opposite).index + (fwd ? 1 : -1) * itemsToClip;
  const newOppPadding = itemsToClip * itemSize + oppPadding;

  const result = new ItemsCounter(direction);
  result.set(direction, {
    index: newDirIndex,
    padding: 0
  });
  result.set(opposite, {
    index: newOppIndex,
    padding: newOppPadding
  });
  return result;
};

const shouldScroll = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const wfCount = config.custom.count + 1;
  let itemsCounter: ItemsCounter;

  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycles = misc.workflow.cyclesDone;
    if (cycles === 1) {
      itemsCounter = getInitialItemsCounter(misc);
    } else {
      itemsCounter = getCurrentItemsCounter(misc, config.custom.direction, itemsCounter);
    }
    if (cycles < wfCount) {
      if (config.custom.bouncing) {
        invertDirection(config);
      } else if (config.custom.mass) {
        if (cycles === (wfCount / 2)) {
          invertDirection(config);
        }
      }
      doScrollMax(config, misc);
    } else {
      // expectations
      const direction = config.custom.direction;
      const opposite = direction === Direction.forward ? Direction.backward : Direction.forward;
      const edgeItem = misc.scroller.buffer.getEdgeVisibleItem(direction);
      const oppositeEdgeItem = misc.scroller.buffer.getEdgeVisibleItem(opposite);
      const edgeItemIndex = itemsCounter.get(direction).index;
      const edgeOppositeItemIndex = itemsCounter.get(opposite).index;
      expect(edgeItem && edgeItem.$index).toEqual(edgeItemIndex);
      expect(oppositeEdgeItem && oppositeEdgeItem.$index).toEqual(edgeOppositeItemIndex);
      expect((<any>misc.padding)[direction].getSize()).toEqual(itemsCounter.get(direction).padding);
      expect((<any>misc.padding)[opposite].getSize()).toEqual(itemsCounter.get(opposite).padding);
      expect(misc.checkElementContentByIndex(edgeItemIndex)).toEqual(true);
      expect(misc.checkElementContentByIndex(edgeOppositeItemIndex)).toEqual(true);
      done();
    }
  });
};

describe('Basic Scroll Spec', () => {

  describe('Single max fwd scroll event', () =>
    singleForwardMaxScrollConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should process 1 forward max scroll',
        it: shouldScroll(config)
      })
    )
  );

  describe('Single max bwd scroll event', () =>
    singleBackwardMaxScrollConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should process 1 backward max scroll',
        it: shouldScroll(config)
      })
    )
  );

  describe('Mass max fwd scroll events', () =>
    massForwardScrollsConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should process some forward scrolls',
        it: shouldScroll(config)
      })
    )
  );

  describe('Mass max bwd scroll events', () =>
    massBackwardScrollsConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should process some backward scrolls',
        it: shouldScroll(config)
      })
    )
  );

  // describe('Bouncing max two-directional scroll events (fwd started)', () =>
  //   massBouncingScrollsConfigList_fwd.forEach(config =>
  //     makeTest({
  //       config,
  //       title: 'should process some bouncing scrolls',
  //       it: shouldScroll(config)
  //     })
  //   )
  // );
  //
  // describe('Bouncing max two-directional scroll events (bwd started)', () =>
  //   massBouncingScrollsConfigList_bwd.forEach(config =>
  //     makeTest({
  //       config,
  //       title: 'should process some bouncing scrolls',
  //       it: shouldScroll(config)
  //     })
  //   )
  // );
  //
  // describe('Mass max two-directional scroll events (fwd started)', () =>
  //   massTwoDirectionalScrollsConfigList_fwd.forEach(config =>
  //     makeTest({
  //       config,
  //       title: 'should process some two-directional scrolls',
  //       it: shouldScroll(config)
  //     })
  //   )
  // );
  //
  // describe('Mass max two-directional scroll events (bwd started)', () =>
  //   massTwoDirectionalScrollsConfigList_bwd.forEach(config =>
  //     makeTest({
  //       config,
  //       title: 'should process some two-directional scrolls',
  //       it: shouldScroll(config)
  //     })
  //   )
  // );

});
