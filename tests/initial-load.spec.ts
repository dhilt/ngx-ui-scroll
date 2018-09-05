import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const configList = [{
  datasourceSettings: { startIndex: 1, bufferSize: 1, padding: 2 },
  templateSettings: { viewportHeight: 20 },
  expected: {
    scroller: { state: { fetch: { callCount: 1 }, cycleCount: 2 } },
    items: { length: 5, first: -1, last: 3 }
  }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 3, padding: 0.5 },
  templateSettings: { viewportHeight: 120 },
  expected: {
    scroller: { state: { fetch: { callCount: 1 }, cycleCount: 2 } },
    items: { length: 12, first: -2, last: 9 }
  }
}, {
  datasourceSettings: { startIndex: -99, bufferSize: 5, padding: 0.5 },
  templateSettings: { viewportHeight: 200 },
  expected: {
    scroller: { state: { fetch: { callCount: 1 }, cycleCount: 2 } },
    items: { length: 20, first: -104, last: -85 }
  }
}, {
  datasourceSettings: { startIndex: -77, bufferSize: 4, padding: 0.62, horizontal: true },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true },
  expected: {
    scroller: { state: { fetch: { callCount: 1 }, cycleCount: 2 } },
    items: { length: 51, first: -91, last: -41 }
  }
}, /*{
  datasourceSettings: { startIndex: 1, bufferSize: 1, padding: 0.5, windowViewport: true },
  templateSettings: { noViewportClass: true, viewportHeight: 0 },
  expected: {
    scroller: {
      state: { fetch: { callCount: 1 }, cycleCount: 2 },
      buffer: { items: { length: 76 } }
    },
    firstElement: { text: `${1} : item #${1}` }
  }
}*/];

const _shouldNotClip = (settings: TestBedConfig, misc: Misc, done: Function) => {
  const startIndex = settings.datasourceSettings.startIndex;
  const elements = misc.getElements();

  expect(misc.workflow.cyclesDone).toEqual(1);
  expect(misc.scroller.state.fetch.callCount).toEqual(settings.expected.scroller.state.fetch.callCount);
  expect(misc.scroller.state.cycleCount).toEqual(settings.expected.scroller.state.cycleCount);
  expect(misc.scroller.buffer.items.length).toEqual(settings.expected.items.length);
  expect(misc.padding.backward.getSize()).toEqual(0);
  expect(misc.padding.forward.getSize()).toEqual(0);

  expect(elements.length).toEqual(settings.expected.items.length);
  expect(misc.getElementIndex(elements[0])).toEqual(settings.expected.items.first);
  expect(misc.getElementIndex(elements[elements.length - 1])).toEqual(settings.expected.items.last);
  expect(misc.getElementText(startIndex)).toEqual(`${startIndex} : item #${startIndex}`);

  done();
};

describe('Initial Load Spec', () =>
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
);
