import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const configList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 1, bufferSize: 1, padding: 2, itemSize: 15 },
  templateSettings: { viewportHeight: 20, itemHeight: 15 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 3, padding: 0.5, itemSize: 20 },
  templateSettings: { viewportHeight: 120, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: -99, bufferSize: 5, padding: 0.5, itemSize: 25 },
  templateSettings: { viewportHeight: 200, itemHeight: 25 }
}, {
  datasourceSettings: { startIndex: -77, bufferSize: 4, padding: 0.62, itemSize: 90, horizontal: true },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 1, padding: 0.5, itemSize: 20, windowViewport: true },
  // datasourceDevSettings: { debug: true },
  templateSettings: { noViewportClass: true, viewportHeight: 0, itemHeight: 20 }
}];

const _shouldNotClip = (settings: TestBedConfig, misc: Misc, done: Function) => {
  expect(misc.workflow.cyclesDone).toEqual(1);
  expect(misc.scroller.state.fetch.callCount).toEqual(1);
  expect(misc.scroller.state.cycleCount).toEqual(2);
  expect(misc.padding.backward.getSize()).toEqual(0);
  expect(misc.padding.forward.getSize()).toEqual(0);

  const { startIndex, padding, itemSize } = settings.datasourceSettings;
  const viewportSize = misc.getViewportSize(settings);
  const elements = misc.getElements();

  const backwardLimit = viewportSize * padding;
  const forwardLimit = viewportSize + backwardLimit;
  const backwardItemsCount = Math.ceil(backwardLimit / itemSize);
  const forwardItemsCount = Math.ceil(forwardLimit / itemSize);
  const itemsCount = backwardItemsCount + forwardItemsCount;

  expect(elements.length).toEqual(itemsCount);
  expect(misc.scroller.buffer.items.length).toEqual(itemsCount);
  expect(misc.getElementIndex(elements[0])).toEqual(startIndex - backwardItemsCount);
  expect(misc.getElementIndex(elements[elements.length - 1])).toEqual(startIndex + forwardItemsCount - 1);
  expect(misc.getElementText(startIndex)).toEqual(`${startIndex} : item #${startIndex}`);

  done();
};

describe('Initial Load Spec', () =>
  describe('Fixed average item size', () =>
    configList.forEach(config =>
      makeTest({
        config,
        title: 'should fetch some items with no clip',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            _shouldNotClip(config, misc, done)
          )
      })
    )
  )
);
