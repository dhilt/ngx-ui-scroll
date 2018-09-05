import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const fixedAverageSizeConfigList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 1, padding: 2, itemSize: 15 },
  templateSettings: { viewportHeight: 20, itemHeight: 15 }
}, {
  datasourceSettings: { startIndex: 1, padding: 0.5, itemSize: 20 },
  templateSettings: { viewportHeight: 120, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: -99, padding: 0.3, itemSize: 25 },
  templateSettings: { viewportHeight: 200, itemHeight: 25 }
}, {
  datasourceSettings: { startIndex: -77, padding: 0.62, itemSize: 90, horizontal: true },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true }
}, {
  datasourceSettings: { startIndex: 1, padding: 0.5, itemSize: 20, windowViewport: true },
  // datasourceDevSettings: { debug: true },
  templateSettings: { noViewportClass: true, viewportHeight: 0, itemHeight: 20 }
}];

const bigBufferSizeConfigList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 100, padding: 0.1, itemSize: 20, bufferSize: 20 },
  templateSettings: { viewportHeight: 100, itemHeight: 20 }
}, {
  datasourceSettings: { startIndex: -50, padding: 0.1, itemSize: 90, bufferSize: 10, horizontal: true },
  templateSettings: { viewportWidth: 200, itemWidth: 90, horizontal: true }
}];

const _testFixedAverageSize = (settings: TestBedConfig, misc: Misc, done: Function) => {
  expect(misc.workflow.cyclesDone).toEqual(1);
  expect(misc.scroller.state.fetch.callCount).toEqual(1);
  expect(misc.scroller.state.cycleCount).toEqual(2);
  expect(misc.padding.backward.getSize()).toEqual(0);
  expect(misc.padding.forward.getSize()).toEqual(0);

  const { startIndex, padding, itemSize, bufferSize } = settings.datasourceSettings;
  const viewportSize = misc.getViewportSize(settings);
  const elements = misc.getElements();

  const backwardLimit = viewportSize * padding;
  const forwardLimit = viewportSize + backwardLimit;
  const backwardItemsCount = Math.ceil(backwardLimit / itemSize);
  let forwardItemsCount = Math.ceil(forwardLimit / itemSize);
  let itemsCount = backwardItemsCount + forwardItemsCount;

  // when bufferSize is big enough
  if (itemsCount < bufferSize) {
    forwardItemsCount += bufferSize - itemsCount;
    itemsCount = bufferSize;
  }

  expect(elements.length).toEqual(itemsCount);
  expect(misc.scroller.buffer.items.length).toEqual(itemsCount);
  expect(misc.getElementIndex(elements[0])).toEqual(startIndex - backwardItemsCount);
  expect(misc.getElementIndex(elements[elements.length - 1])).toEqual(startIndex + forwardItemsCount - 1);
  expect(misc.getElementText(startIndex)).toEqual(`${startIndex} : item #${startIndex}`);

  done();
};

describe('Initial Load Spec', () => {

  describe('Fixed average item size', () => {
    fixedAverageSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should make 1 fetch to satisfy padding limits',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            _testFixedAverageSize(config, misc, done)
          )
      })
    );
    bigBufferSizeConfigList.forEach(config =>
      makeTest({
        config,
        title: 'should make 1 big fetch to overflow padding limits (bufferSize is big enough)',
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() =>
            _testFixedAverageSize(config, misc, done)
          )
      })
    );
  });

});
