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

const invertDirection = (config) => {
  const _forward = config.custom.direction === Direction.forward;
  config.custom.direction = _forward ? Direction.backward : Direction.forward;
};

const calculateIt = (config, misc) => {
  const bufferSize = config.datasourceSettings.bufferSize;
  const padding = config.datasourceSettings.padding;
  const viewportSize = config.templateSettings.viewportHeight;
  const direction = config.custom.direction;
  const delta = viewportSize * padding;

  const _forward = direction === Direction.forward;
  const _opposite = _forward ? Direction.backward : Direction.forward;
  const _elements = misc.getElements();
  const _edgeElement = _forward ? _elements[_elements.length - 1] : _elements[0];
  const _oppositeEdgeElement = !_forward ? _elements[_elements.length - 1] : _elements[0];
  const _edgeItemIndex = misc.getElementIndex(_edgeElement);
  const _oppositeEdgeItemIndex = misc.getElementIndex(_oppositeEdgeElement);
  const _paddingSize = misc.padding[direction].getSize();
  const _oppositePaddingSize = misc.padding[_opposite].getSize();

  const newScrollPosition = _forward ? misc.getScrollableSize() : 0;
  const edgePosition = misc.padding[Direction.backward].getSize() + (_forward ? _elements.length * misc.itemHeight : 0);
  const diffEdgeSize = Math.abs(newScrollPosition - edgePosition);
  const diffItems = Math.ceil(diffEdgeSize / misc.itemHeight);
  const diffItemsFetches = Math.ceil(diffItems / bufferSize);
  const itemsToFetch = diffItemsFetches * bufferSize;
  let edgeItemIndex = _edgeItemIndex + (_forward ? 1 : -1) * itemsToFetch;

  const sizeToFill = itemsToFetch * misc.itemHeight;
  const diff = Math.abs(sizeToFill - diffEdgeSize);
  const addSize = delta - diff;
  if (addSize > 0) {
    const itemsToFillAddSize = Math.ceil(addSize / misc.itemHeight);
    const addFetches = Math.ceil(itemsToFillAddSize / bufferSize);
    const addItems = addFetches * bufferSize;
    edgeItemIndex = edgeItemIndex + (_forward ? 1 : -1) * addItems;
  }

  const paddingSize = 0;

  return {
    paddingSize,
    //oppositePaddingSize,
    edgeItemIndex,
    //oppositeEdgeItemIndex
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
        invertDirection(config);
      } else if (config.custom.mass) {
        if (misc.workflowRunner.count - count === (scrollCount / 2)) {
          invertDirection(config);
        }
      }
      if (misc.workflowRunner.count === count + scrollCount - 1) {
        result = calculateIt(config, misc);
      }
      doScrollMax(config, misc);
    } else {
      // expectations
      const direction = config.custom.direction;
      const opposite = direction === Direction.forward ? Direction.backward : Direction.forward;
      const edgeItem = misc.workflow.buffer.getEdgeVisibleItem(direction);
      const oppositeEdgeItem = misc.workflow.buffer.getEdgeVisibleItem(opposite);
      expect(misc.padding[direction].getSize()).toEqual(result.paddingSize);
      //expect(misc.padding[opposite].getSize()).toEqual(result.oppositePaddingSize);
      expect(edgeItem.$index).toEqual(result.edgeItemIndex);
      //expect(oppositeEdgeItem.$index).toEqual(result.oppositeEdgeItemIndex);
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
