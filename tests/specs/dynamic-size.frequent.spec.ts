import { makeTest, TestBedConfig, ItFuncConfig } from '../scaffolding/runner';
import {
  DatasourceLimiter,
  getLimitedDatasourceClass
} from '../scaffolding/datasources/class';
import { SizeStrategy } from '../miscellaneous/vscroll';
import { Misc } from '../miscellaneous/misc';

interface ICustom {
  title: string;
  getSize: (index: number) => number;
  action?: (misc: Misc) => Promise<unknown>;
  before: number;
  after?: number;
}

const settings = {
  padding: 0.5,
  bufferSize: 5,
  startIndex: 1,
  minIndex: -99,
  maxIndex: 100,
  sizeStrategy: SizeStrategy.Frequent
};

const baseConfig = {
  datasourceSettings: settings,
  templateSettings: { viewportHeight: 200, dynamicSize: 'size' },
  datasourceClass: getLimitedDatasourceClass({ settings })
};

const customConfigList: ICustom[] = [
  {
    title: 'set default on load (0)',
    getSize: () => 20,
    before: 20
  },
  {
    title: 'set default on load (1)',
    getSize: i => (i < 0 ? -i : i === 0 ? 1 : i),
    before: 1
  },
  {
    title: 'change default on scroll min',
    getSize: i => (i < 0 ? 20 : 30),
    action: misc => misc.scrollMinRelax(),
    before: 30,
    after: 20
  },
  {
    title: 'not change default on scroll max',
    getSize: i => (i < 0 ? 20 : 30),
    action: misc => misc.scrollMaxRelax(),
    before: 30
  },
  {
    title: 'not change default on scroll max & min',
    getSize: i => (i < 0 ? 20 : 30),
    action: async misc => {
      await misc.scrollMaxRelax();
      return misc.scrollMinRelax();
    },
    before: 30
  },
  {
    title: 'change default on scroll max & min & 100',
    getSize: i => (i < 0 ? 20 : 30),
    action: async misc => {
      await misc.scrollMaxRelax();
      await misc.scrollMinRelax();
      return misc.scrollToRelax(100);
    },
    before: 30,
    after: 20
  },
  {
    title: 'change default on Adapter.check',
    getSize: i => {
      if (i >= -2 && i <= 2) {
        // 5 items of "2"
        return 2;
      }
      return i < 0 ? -i : i;
    },
    action: misc => {
      for (let i = 5; i <= 10; i++) {
        // 6 items of "1"
        misc.getElement(i).style.height = 1 + 'px';
      }
      return misc.adapter.check();
    },
    before: 2,
    after: 1
  },
  {
    title: 'not change default on Adapter.check',
    getSize: i => {
      if (i >= -2 && i <= 2) {
        // 5 items of "2"
        return 2;
      }
      return i < 0 ? -i : i;
    },
    action: misc => {
      for (let i = 5; i < 10; i++) {
        // 5 items of "1"
        misc.getElement(i).style.height = 1 + 'px';
      }
      return misc.adapter.check();
    },
    before: 2,
    after: 2
  }
];

const configListFrequent: TestBedConfig<ICustom>[] = customConfigList.map(
  custom => ({ ...baseConfig, custom })
);

const configListConstant: TestBedConfig<ICustom>[] = [
  ...customConfigList
    .filter((i, j) => j % 2 === 0)
    .map((custom, j) => ({
      ...baseConfig,
      custom: {
        ...custom,
        before: 22,
        after: 22,
        title: `not change (${j + 1})`
      },
      datasourceClass: getLimitedDatasourceClass({
        settings: {
          ...settings,
          sizeStrategy: SizeStrategy.Constant,
          itemSize: 22
        }
      })
    })),
  {
    ...baseConfig,
    custom: {
      title: 'not change when itemSize is not set',
      getSize: () => 10,
      before: 10
    },
    datasourceClass: getLimitedDatasourceClass({
      settings: {
        ...settings,
        sizeStrategy: SizeStrategy.Constant
      }
    })
  }
];

const checkViewportWithoutCache = (misc: Misc) => {
  const {
    buffer,
    viewport: {
      paddings: { backward, forward }
    }
  } = misc.scroller;
  const virtualCountLeft = buffer.firstIndex - settings.minIndex;
  const virtualCountRight = settings.maxIndex - buffer.lastIndex;
  expect(backward.size).toBe(virtualCountLeft * buffer.defaultSize);
  expect(forward.size).toBe(virtualCountRight * buffer.defaultSize);
};

const checkViewportWithCache = (misc: Misc) => {
  const {
    buffer,
    viewport: {
      paddings: { backward, forward }
    }
  } = misc.scroller;
  let sizeLeft = 0,
    sizeRight = 0;
  for (let i = settings.minIndex; i < buffer.firstIndex; i++) {
    sizeLeft += buffer.getSizeByIndex(i);
  }
  for (let i = settings.maxIndex; i > buffer.lastIndex; i--) {
    sizeRight += buffer.getSizeByIndex(i);
  }
  expect(backward.size).toBe(sizeLeft);
  expect(forward.size).toBe(sizeRight);
};

const shouldSetDefault: ItFuncConfig<ICustom> =
  config => misc => async done => {
    const { getSize, action, before, after } = config.custom;
    (misc.datasource as DatasourceLimiter).setSizes(getSize);
    await misc.relaxNext();
    const { buffer } = misc.scroller;
    expect(buffer.defaultSize).toBe(before);
    checkViewportWithoutCache(misc);
    if (action) {
      await action(misc);
      const defaultSize = Number.isInteger(after) ? after : before;
      expect(buffer.defaultSize).toBe(defaultSize as number);
      checkViewportWithCache(misc);
    }
    done();
  };

describe('Dynamic Size Spec for Frequent and Constant strategies', () => {
  describe('SizeStrategy.Frequent', () =>
    configListFrequent.forEach(config =>
      makeTest({
        config,
        title: `should ${config.custom.title}`,
        it: shouldSetDefault(config)
      })
    ));

  describe('SizeStrategy.Constant', () =>
    configListConstant.forEach(config =>
      makeTest({
        config,
        title: `should ${config.custom.title}`,
        it: shouldSetDefault(config)
      })
    ));
});
