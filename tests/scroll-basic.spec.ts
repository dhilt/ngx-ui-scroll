import { Direction } from '../src/component/interfaces';
import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

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
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 1, horizontal: true },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true },
  custom: { direction: Direction.forward, count: 1 }
}, {
  datasourceSettings: { startIndex: -74, bufferSize: 4, padding: 0.72, horizontal: true },
  templateSettings: { viewportWidth: 300, itemWidth: 90, horizontal: true },
  custom: { direction: Direction.forward, count: 1 }
}, {
  datasourceSettings: { startIndex: -15, bufferSize: 35, padding: 0.33, windowViewport: true },
  templateSettings: { noViewportClass: true, viewportHeight: 0 },
  custom: { direction: Direction.forward, count: 1 }
}];

const treatIndex = (index: number) => index <= 3 ? index : (3 * 2 - index);

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
    timeout: 5000
  }));

const massBouncingScrollsConfigList_bwd =
  massForwardScrollsConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.backward,
      count: (3 + treatIndex(index)) * 2, // 3-6 (fwd + bwd) scroll events per config
      bouncing: true
    },
    timeout: 5000
  }));

const massTwoDirectionalScrollsConfigList_fwd =
  massForwardScrollsConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.forward,
      count: (3 + treatIndex(index)) * 2, // 3-6 fwd + 3-6 bwd scroll events per config
      mass: true
    },
    timeout: 4000
  }));

const massTwoDirectionalScrollsConfigList_bwd =
  massForwardScrollsConfigList.map((config, index) => ({
    ...config,
    custom: {
      direction: Direction.backward,
      count: (3 + treatIndex(index)) * 2, // 3-6 fwd + 3-6 bwd scroll events per config
      mass: true
    },
    timeout: 4000
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

const calculateIt = (config: TestBedConfig, misc: Misc) => {
  // settings
  const bufferSize = config.datasourceSettings.bufferSize;
  const padding = config.datasourceSettings.padding;
  const viewportSize = misc.getViewportSize(config);
  const direction = config.custom.direction;
  const itemSize = misc.getItemSize();

  // current state calculations
  const delta = viewportSize * padding;
  const forward = direction === Direction.forward;
  const elements = misc.getElements();
  const _edgeElement = forward ? elements[elements.length - 1] : elements[0];
  const _edgeItemIndex = misc.getElementIndex(_edgeElement) || 0;
  const _edgePosition = misc.padding[Direction.backward].getSize() + (forward ? elements.length * itemSize : 0);

  // future state calculations (direct)
  const newScrollPosition = forward ? misc.getScrollableSize() : 0;
  const _edgeSize = Math.abs(newScrollPosition - _edgePosition);
  const _itemsToFill = Math.ceil(_edgeSize / itemSize);
  const _itemsFetches = Math.ceil(_itemsToFill / bufferSize);
  const _itemsToFetch = _itemsFetches * bufferSize;

  let _itemsToAdd = 0;
  const addSize = delta - Math.abs(_itemsToFetch * itemSize - _edgeSize);
  if (addSize > 0) {
    const itemsToFillAddSize = Math.ceil(addSize / itemSize);
    const fetchesToFillAddSize = Math.ceil(itemsToFillAddSize / bufferSize);
    _itemsToAdd = fetchesToFillAddSize * bufferSize;
  }

  const itemsToAdd = (forward ? 1 : -1) * (_itemsToFetch + _itemsToAdd);
  const edgeItemIndex = _edgeItemIndex + itemsToAdd;
  const paddingSize = 0;

  // future state calculations (opposite)
  const newEdgePosition = _edgePosition + itemsToAdd * itemSize;
  const sizeToFill = (Math.abs(newScrollPosition - newEdgePosition) + viewportSize + delta);
  const itemsToFill = Math.ceil(sizeToFill / itemSize);
  const fetchCount = Math.ceil(itemsToFill / bufferSize);
  const itemsToFetch = fetchCount * bufferSize;
  const fetchedItemsSize = itemsToFetch * itemSize;
  const outlet = Math.abs(fetchedItemsSize - sizeToFill);
  const itemsToClip = Math.floor(outlet / itemSize);
  const edgeItemIndexOpposite =
    edgeItemIndex + (forward ? -1 : 1) * itemsToFetch + (forward ? 1 : -1) * (itemsToClip + 1);

  const allItemsSize = (Math.abs(edgeItemIndex - edgeItemIndexOpposite) + 1) * itemSize;
  const itemsSizeOutOfNewScrollPosition = allItemsSize - Math.abs(newScrollPosition - newEdgePosition);
  const paddingSizeOpposite = Math.abs(misc.getScrollableSize() - itemsSizeOutOfNewScrollPosition);

  return {
    paddingSize,
    paddingSizeOpposite,
    edgeItemIndex,
    edgeItemIndexOpposite
  };
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
      // expectations
      const direction = config.custom.direction;
      const opposite = direction === Direction.forward ? Direction.backward : Direction.forward;
      const edgeItem = misc.scroller.buffer.getEdgeVisibleItem(direction);
      const oppositeEdgeItem = misc.scroller.buffer.getEdgeVisibleItem(opposite);
      expect((<any>misc.padding)[direction].getSize()).toEqual(result.paddingSize);
      expect((<any>misc.padding)[opposite].getSize()).toEqual(result.paddingSizeOpposite);
      expect(edgeItem ? edgeItem.$index : null).toEqual(result.edgeItemIndex);
      expect(oppositeEdgeItem ? oppositeEdgeItem.$index : null).toEqual(result.edgeItemIndexOpposite);
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
