import { Direction } from './miscellaneous/vscroll';

import { makeTest, TestBedConfig, ItFuncConfig } from './scaffolding/runner';
import { debounce } from './miscellaneous/debounce';
import { Misc } from './miscellaneous/misc';

interface ICustom {
  items: number;
  scrollCount: number;
  start: Direction;
}

const configList: TestBedConfig<ICustom>[] = [
  {
    datasourceName: 'limited-1-100-no-delay',
    datasourceSettings: {
      startIndex: 1,
      bufferSize: 5,
      padding: 0.5,
      minIndex: 1,
      maxIndex: 100,
      adapter: true
    },
    templateSettings: { viewportHeight: 100 },
    custom: { items: 100, scrollCount: 5, start: Direction.backward },
    timeout: 5000
  },
  {
    datasourceName: 'limited-1-100-no-delay',
    datasourceSettings: {
      startIndex: 1,
      bufferSize: 3,
      padding: 0.3,
      minIndex: 1,
      maxIndex: 100,
      adapter: true
    },
    templateSettings: { viewportHeight: 110 },
    custom: { items: 100, scrollCount: 8, start: Direction.backward },
    timeout: 5000
  },
  {
    datasourceName: 'limited-51-200-no-delay',
    datasourceSettings: {
      startIndex: 51,
      bufferSize: 7,
      padding: 1.1,
      minIndex: 51,
      maxIndex: 200,
      adapter: true
    },
    templateSettings: { viewportHeight: 69 },
    custom: { items: 150, scrollCount: 6, start: Direction.backward },
    timeout: 5000
  },
  {
    datasourceName: 'limited-51-200-no-delay',
    datasourceSettings: {
      startIndex: 51,
      bufferSize: 20,
      padding: 0.2,
      windowViewport: true,
      minIndex: 51,
      maxIndex: 200,
      adapter: true
    },
    templateSettings: { noViewportClass: true, viewportHeight: 0 },
    custom: { items: 150, scrollCount: 5, start: Direction.backward },
    timeout: 7000
  }
];

const configBofList = configList.map(config => ({
  ...config,
  custom: {
    ...config.custom,
    start: Direction.forward
  }
}));

const runFastScroll = (misc: Misc, customConfig: ICustom, done: () => void) => {
  misc.shared.fin = false;
  const scr = (iteration: number) =>
    new Promise(success => {
      setTimeout(() => {
        misc.scrollMax();
        setTimeout(() => {
          if (
            iteration < customConfig.scrollCount ||
            customConfig.start === Direction.backward
          ) {
            misc.scrollMin();
          }
          success(void 0);
        }, 25);
      }, 25);
    });
  let result = scr(0);
  for (let i = 1; i <= customConfig.scrollCount; i++) {
    result = result.then(() => scr(i));
  }
  result.then(() => {
    if (!misc.adapter.isLoading) {
      done();
    } else {
      misc.shared.fin = true;
    }
  });
};

const expectations = (
  config: TestBedConfig<ICustom>,
  misc: Misc,
  done: () => void
) => {
  const {
    scroller: { buffer }
  } = misc;
  const itemsCount = buffer.size;
  const bufferHeight = itemsCount * misc.itemHeight;
  const _size =
    misc.padding.backward.getSize() +
    misc.padding.forward.getSize() +
    bufferHeight;
  const totalItemsHeight = config.custom.items * misc.itemHeight;
  const startIndex = config.datasourceSettings.startIndex as number;
  expect(_size).toBe(totalItemsHeight);
  expect(itemsCount).toBeGreaterThan(0);
  if (itemsCount) {
    if (misc.getScrollPosition() === 0) {
      const topElement = buffer.items[0].element;
      const topElementIndex = misc.getElementIndex(topElement);
      expect(topElementIndex).toBe(startIndex);
    } else {
      const bottomElement = buffer.items[buffer.size - 1].element;
      const bottomElementIndex = misc.getElementIndex(bottomElement);
      expect(bottomElementIndex).toBe(startIndex + config.custom.items - 1);
    }
  }
  done();
};

let expectationsTimer: ReturnType<typeof setTimeout>;
const preExpectations = (
  config: TestBedConfig<ICustom>,
  misc: Misc,
  done: () => void
) => {
  const position = misc.getScrollPosition();
  const {
    scroller: { buffer },
    adapter
  } = misc;
  const index = position === 0 ? 0 : buffer.size - 1;
  const runExpectations = () => {
    const edgeElement = buffer.items[index].element;
    const edgeElementIndex = misc.getElementIndex(edgeElement);
    const startIndex = config.datasourceSettings.startIndex as number;
    const edgeIndex =
      startIndex + (position === 0 ? 0 : config.custom.items - 1);
    if (edgeIndex === edgeElementIndex) {
      expectations(config, misc, done);
    } else {
      misc[position === 0 ? 'scrollMax' : 'scrollMin']();
    }
  };
  if (
    !adapter.loopPending &&
    buffer.size &&
    buffer.items[index] &&
    buffer.items[index].element
  ) {
    runExpectations();
  } else {
    expectationsTimer = setTimeout(
      () => preExpectations(config, misc, done),
      25
    );
  }
};

const checkFastScroll: ItFuncConfig<ICustom> = config => misc => done => {
  clearTimeout(expectationsTimer);
  const _done = debounce(() => preExpectations(config, misc, done), 25);
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (misc.workflow.cyclesDone === 1) {
      runFastScroll(misc, config.custom, done);
    } else if (misc.shared.fin) {
      _done();
    }
  });
};

describe('Fast Scroll Spec', () => {
  describe('multi-scroll to the BOF', () =>
    configList.map(config =>
      makeTest({
        title: 'should reach BOF without gaps',
        config,
        it: checkFastScroll(config)
      })
    ));

  describe('multi-scroll to the EOF', () =>
    configBofList.map(config =>
      makeTest({
        title: 'should reach EOF without gaps',
        config,
        it: checkFastScroll(config)
      })
    ));
});
