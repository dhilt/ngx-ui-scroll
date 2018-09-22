import { Direction } from '../src/component/interfaces';
import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { ItemsCounter, ItemsDirCounter } from './miscellaneous/itemsCounter';
import { getFixedAverageSizeItemsCounter } from './initial-load.spec';

const singleForwardMaxScrollConfigList = [{
  datasourceSettings: { startIndex: 100, bufferSize: 4, padding: 0.22, itemSize: 20 },
  templateSettings: { viewportHeight: 71, itemHeight: 20 },
  custom: { direction: Direction.forward, count: 1 },
  expected: {
    paddingSizeOpposite: 20,
    edgeItemIndexOpposite: 100
  }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.2, itemSize: 20 },
  templateSettings: { viewportHeight: 100 },
  custom: { direction: Direction.forward, count: 1 },
  expected: {
    paddingSizeOpposite: 20,
    edgeItemIndexOpposite: 1
  }
}, {
  datasourceSettings: { startIndex: -15, bufferSize: 12, padding: 0.98, itemSize: 20 },
  templateSettings: { viewportHeight: 66, itemHeight: 20 },
  custom: { direction: Direction.forward, count: 1 },
  expected: {
    paddingSizeOpposite: 100,
    edgeItemIndexOpposite: -14
  }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 1, horizontal: true, itemSize: 90 },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true },
  custom: { direction: Direction.forward, count: 1 },
  expected: {
    paddingSizeOpposite: 5220,
    edgeItemIndexOpposite: 36
  }
}, {
  datasourceSettings: { startIndex: -74, bufferSize: 4, padding: 0.72, horizontal: true, itemSize: 75 },
  templateSettings: { viewportWidth: 300, itemWidth: 75, horizontal: true },
  custom: { direction: Direction.forward, count: 1 },
  expected: {
    paddingSizeOpposite: 2790,
    edgeItemIndexOpposite: -54
  }
}];

const treatIndex = (index: number) => index <= 3 ? index : (3 * 2 - index);

const singleBackwardMaxScrollExpected = [{
  expected: {
    paddingSizeOpposite: 20,
    edgeItemIndexOpposite: 103
  }
}, {
  expected: {
    paddingSizeOpposite: 20,
    edgeItemIndexOpposite: 5
  }
}, {
  expected: {
    paddingSizeOpposite: 100,
    edgeItemIndexOpposite: -13
  }
}, {
  expected: {
    paddingSizeOpposite: 5220,
    edgeItemIndexOpposite: -13
  }
}, {
  expected: {
    paddingSizeOpposite: 2790,
    edgeItemIndexOpposite: -80
  }
}, {
  expected: {
    paddingSizeOpposite: 320,
    edgeItemIndexOpposite: 31
  }
}];
const massForwardScrollsExpected = [{
  expected: {
    paddingSizeOpposite: 180,
    edgeItemIndexOpposite: 95
  }
}, {
  expected: {
    paddingSizeOpposite: 320,
    edgeItemIndexOpposite: -10
  }
}, {
  expected: {
    paddingSizeOpposite: 1060,
    edgeItemIndexOpposite: -61
  }
}, {
  expected: {
    paddingSizeOpposite: 7470,
    edgeItemIndexOpposite: -38
  }
}, {
  expected: {
    paddingSizeOpposite: 4230,
    edgeItemIndexOpposite: -96
  }
}, {
  expected: {
    paddingSizeOpposite: 2420,
    edgeItemIndexOpposite: -74
  }
}];
const massBackwardScrollsExpected = [{
  expected: {
    paddingSizeOpposite: 180,
    edgeItemIndexOpposite: 95
  }
}, {
  expected: {
    paddingSizeOpposite: 320,
    edgeItemIndexOpposite: -10
  }
}, {
  expected: {
    paddingSizeOpposite: 1060,
    edgeItemIndexOpposite: -61
  }
}, {
  expected: {
    paddingSizeOpposite: 7470,
    edgeItemIndexOpposite: -38
  }
}, {
  expected: {
    paddingSizeOpposite: 4230,
    edgeItemIndexOpposite: -96
  }
}, {
  expected: {
    paddingSizeOpposite: 2420,
    edgeItemIndexOpposite: -74
  }
}];
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
    },
    expected: singleBackwardMaxScrollExpected[index].expected
  }));

const massForwardScrollsConfigList =
  singleForwardMaxScrollConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.backward,
      count: 3 + treatIndex(index) // 3-6 bwd scroll events per config
    },
    expected: massForwardScrollsExpected[index].expected
  }));

const massBackwardScrollsConfigList =
  massForwardScrollsConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.backward,
      count: 3 + treatIndex(index) // 3-6 fwd scroll events per config
    },
    expected: massBackwardScrollsExpected[index].expected
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

const calculateIt = (config: TestBedConfig, misc: Misc, current?: ItemsCounter): ItemsCounter => {
  // settings
  const { bufferSize, padding, itemSize } = config.datasourceSettings;
  const viewportSize = misc.getViewportSize(config);
  const direction = config.custom.direction;
  const fwd = direction === Direction.forward;
  const opposite = fwd ? Direction.backward : Direction.forward;

  // current state calculations
  current = current || getFixedAverageSizeItemsCounter(config, misc, itemSize);

  // handle direction (fetch)
  const delta = viewportSize * padding;
  const _fetchCount = Math.ceil(delta / itemSize);
  const fetchCount = Math.max(bufferSize, _fetchCount);
  const newDirectionCount = current.get(direction).count + fetchCount;
  const newDirectionIndex = current.get(direction).index + fetchCount;

  // handle opposite (clip)
  const totalItemsSize = current.total * itemSize;
  const sizeToClip = totalItemsSize - viewportSize - delta;
  const clipCount = Math.floor(sizeToClip / itemSize);
  const newOppositeCount = current.get(opposite).count - clipCount;
  const newOppositeIndex = current.get(opposite).index + clipCount;
  const newOppositePadding = clipCount * itemSize;

  const result = new ItemsCounter();
  result.set(direction, {
    count: newDirectionCount,
    index: newDirectionIndex,
    padding: 0
  });
  result.set(opposite, {
    count: newOppositeCount,
    index: newOppositeIndex,
    padding: newOppositePadding
  });

  return result;
};

const shouldScroll = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const wfCount = config.custom.count + 1;
  let result: any;

  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycles = misc.workflow.cyclesDone;
    if (cycles < wfCount) {
      if (config.custom.bouncing) {
        invertDirection(config);
      } else if (config.custom.mass) {
        if (cycles === (wfCount / 2)) {
          invertDirection(config);
        }
      }
      if (cycles === wfCount - 1) {
        result = calculateIt(config, misc);
      }
      doScrollMax(config, misc);
    } else {
      if (misc.scroller.state.clipCall > 0) {
        misc.fixture.detectChanges();
      }
      // expectations
      const direction = config.custom.direction;
      const opposite = direction === Direction.forward ? Direction.backward : Direction.forward;
      const edgeItem = misc.scroller.buffer.getEdgeVisibleItem(direction);
      const oppositeEdgeItem = misc.scroller.buffer.getEdgeVisibleItem(opposite);
      expect(edgeItem && edgeItem.$index).toEqual(result.get(direction).index);
      expect(oppositeEdgeItem && oppositeEdgeItem.$index).toEqual(result.get(opposite).index);
      expect((<any>misc.padding)[direction].getSize()).toEqual(result.get(direction).padding);
      expect((<any>misc.padding)[opposite].getSize()).toEqual(result.get(opposite).padding);
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

  // describe('Single max bwd scroll event', () =>
  //   singleBackwardMaxScrollConfigList.forEach(config =>
  //     makeTest({
  //       config,
  //       title: 'should process 1 backward max scroll',
  //       it: shouldScroll(config)
  //     })
  //   )
  // );

  // describe('Mass max fwd scroll events', () =>
  //   massForwardScrollsConfigList.forEach(config =>
  //     makeTest({
  //       config,
  //       title: 'should process some forward scrolls',
  //       it: shouldScroll(config)
  //     })
  //   )
  // );
  //
  // describe('Mass max bwd scroll events', () =>
  //   massBackwardScrollsConfigList.forEach(config =>
  //     makeTest({
  //       config,
  //       title: 'should process some backward scrolls',
  //       it: shouldScroll(config)
  //     })
  //   )
  // );
  //
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
