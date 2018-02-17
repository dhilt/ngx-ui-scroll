import { Direction } from '../src/component/interfaces/direction';
import { makeTest } from './scaffolding/runner';

const itemHeight = 20;

const singleForwardMaxScrollConfigList = [{
  datasourceSettings: { startIndex: 100, bufferSize: 4, padding: 0.22 },
  templateSettings: { viewportHeight: 71 },
  custom: { direction: Direction.forward }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.2 },
  templateSettings: { viewportHeight: 100 },
  custom: { direction: Direction.forward }
}, {
  datasourceSettings: { startIndex: -15, bufferSize: 12, padding: 0.98 },
  templateSettings: { viewportHeight: 66 },
  custom: { direction: Direction.forward }
}];

const singleBackwardMaxScrollConfigList =
  singleForwardMaxScrollConfigList.map(config => ({
    ...config,
    custom: {
      ...config.custom,
      direction: Direction.backward
    }
  }));

const shouldScrollOneTime = (config) => (misc) => (done) => {
  const bufferSize = config.datasourceSettings.bufferSize;
  const padding = config.datasourceSettings.padding;
  const viewportSize = config.templateSettings.viewportHeight;
  const direction = config.custom.direction;

  const _forward = direction === Direction.forward;
  const _count = misc.workflowRunner.count;
  const _paddingSize = misc.workflow.viewport.padding[direction].size;
  const _edgeItemIndex = misc.workflow.buffer.getEdgeVisibleItem(direction).$index;

  const sizeToFill = _paddingSize + padding * viewportSize;
  const itemsToFill = Math.ceil(sizeToFill / itemHeight);
  const fetchCount = Math.ceil(itemsToFill / bufferSize);
  const fetchedItemsCount = fetchCount * bufferSize;
  const itemsToClip = fetchedItemsCount - itemsToFill;
  const sizeToClip = itemsToClip * itemHeight;
  const edgeItemIndex = _edgeItemIndex + (_forward ? 1 : -1) * (fetchedItemsCount - itemsToClip);

  spyOn(misc.workflowRunner, 'finalize').and.callFake(() => {
    if (misc.workflowRunner.count === _count + 1) {
      const edgeItem = misc.workflow.buffer.getEdgeVisibleItem(direction);
      expect(misc.padding[direction].getSize()).toEqual(sizeToClip);
      expect(edgeItem.$index).toEqual(edgeItemIndex);
      done();
    }
  });

  if (_forward) {
    misc.scrollMax();
  } else {
    misc.scrollMin();
  }
};

describe('Basic Scroll Spec', () => {

  describe('Single max fwd scroll event', () =>
    singleForwardMaxScrollConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should process 1 forward max scroll',
        it: shouldScrollOneTime(config)
      })
    )
  );

  describe('Single max bwd scroll event', () =>
    singleBackwardMaxScrollConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should process 1 backward max scroll',
        it: shouldScrollOneTime(config)
      })
    )
  );

});
