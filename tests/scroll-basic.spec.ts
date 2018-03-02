import { Direction } from '../src/component/interfaces';
import { makeTest } from './scaffolding/runner';

const singleForwardMaxScrollConfigList = [{
  datasourceSettings: { startIndex: 100, bufferSize: 4, padding: 0.22 },
  templateSettings: { viewportHeight: 71 },
  custom: { direction: Direction.forward, count: 1 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.2 },
  templateSettings: { viewportHeight: 100 },
  custom: { direction: Direction.forward, count: 1 }
}, {
  datasourceSettings: { startIndex: -15, bufferSize: 12, padding: 0.98 },
  templateSettings: { viewportHeight: 66 },
  custom: { direction: Direction.forward, count: 1 }
}];

const singleBackwardMaxScrollConfigList =
  singleForwardMaxScrollConfigList.map(config => ({
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
      count: 3 + index // 3-5 bwd scroll events per config
    }
  }));

const massBackwardScrollsConfigList =
  massForwardScrollsConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.backward,
      count: 3 + index // 3-5 fwd scroll events per config
    }
  }));

const massBouncingScrollsConfigList_fwd =
  massForwardScrollsConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.forward,
      count: (3 + index) * 2, // 3-5 (fwd + bwd) scroll events per config
      bouncing: true
    }
  }));

const massBouncingScrollsConfigList_bwd =
  massForwardScrollsConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.backward,
      count: (3 + index) * 2, // 3-5 (fwd + bwd) scroll events per config
      bouncing: true
    }
  }));

const massTwoDirectionalScrollsConfigList_fwd =
  massForwardScrollsConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.forward,
      count: (3 + index) * 2, // 3-5 fwd + 3-5 bwd scroll events per config
      mass: true
    }
  }));

const massTwoDirectionalScrollsConfigList_bwd =
  massForwardScrollsConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.backward,
      count: (3 + index) * 2, // 3-5 fwd + 3-5 bwd scroll events per config
      mass: true
    }
  }));

const doScrollMax = (config, misc) => {
  if (config.custom.direction === Direction.forward) {
    misc.scrollMax();
  } else {
    misc.scrollMin();
  }
};

const calculateIt = (config, misc) => {
  const bufferSize = config.datasourceSettings.bufferSize;
  const padding = config.datasourceSettings.padding;
  const viewportSize = config.templateSettings.viewportHeight;
  const direction = config.custom.direction;

  const _forward = direction === Direction.forward;
  const _paddingSize = misc.workflow.viewport.padding[direction].size;
  const _edgeItemIndex = misc.workflow.buffer.getEdgeVisibleItem(direction).$index;

  const sizeToFill = _paddingSize + padding * viewportSize;
  const itemsToFill = Math.ceil(sizeToFill / misc.itemHeight);
  const fetchCount = Math.ceil(itemsToFill / bufferSize);
  const fetchedItemsCount = fetchCount * bufferSize;
  const itemsToClip = fetchedItemsCount - itemsToFill;
  const sizeToClip = itemsToClip * misc.itemHeight;
  const edgeItemIndex = _edgeItemIndex + (_forward ? 1 : -1) * (fetchedItemsCount - itemsToClip);

  return {
    sizeToClip,
    edgeItemIndex
  };
};

const shouldScroll = (config) => (misc) => (done) => {
  const scrollCount = config.custom.count;
  const count = misc.workflowRunner.count;
  let result = calculateIt(config, misc);

  spyOn(misc.workflowRunner, 'finalize').and.callFake(() => {
    if (misc.workflowRunner.count < count + scrollCount) {
      const _forward = config.custom.direction === Direction.forward;
      if (config.custom.bouncing) {
        config.custom.direction = _forward ? Direction.backward : Direction.forward;
      } else if (config.custom.mass) {
        if (misc.workflowRunner.count - count === (scrollCount / 2)) {
          config.custom.direction = _forward ? Direction.backward : Direction.forward;
        }
      }
      if (misc.workflowRunner.count === count + scrollCount - 1) {
        result = calculateIt(config, misc);
      }
      doScrollMax(config, misc);
    } else {
      // expectations
      const direction = config.custom.direction;
      const edgeItem = misc.workflow.buffer.getEdgeVisibleItem(direction);
      expect(misc.padding[direction].getSize()).toEqual(result.sizeToClip);
      expect(edgeItem.$index).toEqual(result.edgeItemIndex);
      done();
    }
  });
  doScrollMax(config, misc);
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

  describe('Bouncing max two-directional scroll events (fwd started)', () =>
    massBouncingScrollsConfigList_fwd.forEach(config =>
      makeTest({
        config,
        title: 'should process some bouncing scrolls',
        it: shouldScroll(config)
      })
    )
  );

  describe('Bouncing max two-directional scroll events (bwd started)', () =>
    massBouncingScrollsConfigList_bwd.forEach(config =>
      makeTest({
        config,
        title: 'should process some bouncing scrolls',
        it: shouldScroll(config)
      })
    )
  );

  describe('Mass max two-directional scroll events (fwd started)', () =>
    massTwoDirectionalScrollsConfigList_fwd.forEach(config =>
      makeTest({
        config,
        title: 'should process some two-directional scrolls',
        it: shouldScroll(config)
      })
    )
  );

  describe('Mass max two-directional scroll events (bwd started)', () =>
    massTwoDirectionalScrollsConfigList_bwd.forEach(config =>
      makeTest({
        config,
        title: 'should process some two-directional scrolls',
        it: shouldScroll(config)
      })
    )
  );

});
