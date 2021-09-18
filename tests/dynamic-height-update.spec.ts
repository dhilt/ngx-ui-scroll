import { ItFuncConfig, makeTest, TestBedConfig } from './scaffolding/runner';
import { SizeStrategy } from './miscellaneous/vscroll';
import { DatasourceLimiter, getLimitedDatasourceClass } from './scaffolding/datasources/class';
import { Misc } from './miscellaneous/misc';

interface ICustom {
  title: string;
  limits: { min: number, max: number }; // DS limits, Scroller doesn't know
  getSize: (index: number) => number;
  action: (misc: Misc) => Promise<unknown>;
  defaultSize: {
    initial: number;
    final: number
  };
}

const ITEM_SIZE = 20;

const baseConfig: TestBedConfig = {
  datasourceSettings: {
    startIndex: 1,
    padding: 0.5,
    bufferSize: 5,
    itemSize: ITEM_SIZE,
    sizeStrategy: SizeStrategy.Average
  },
  templateSettings: { viewportHeight: 200, dynamicSize: 'size' },
  timeout: 4000
};

const configCustomList: ICustom[] = [{
  title: 'should remove one big item via Adapter.update',
  limits: { min: 1, max: 50 },
  getSize: i => i === 10 ? 100 : ITEM_SIZE,
  action: misc => misc.adapter.update({
    predicate: ({ $index }) => $index !== 10
  }),
  defaultSize: {
    initial: 25, // 25.(3)
    final: ITEM_SIZE
  }
}, {
  title: 'should remove one big item via Adapter.remove in-buffer',
  limits: { min: 1, max: 50 },
  getSize: i => i === 10 ? 100 : ITEM_SIZE,
  action: misc => misc.adapter.remove({
    predicate: ({ $index }) => $index === 10
  }),
  defaultSize: {
    initial: 25, // 25.(3)
    final: ITEM_SIZE
  }
}, {
  title: 'should remove some items via Adapter.remove virtually',
  limits: { min: 1, max: 35 },
  getSize: i => i + ITEM_SIZE,
  action: async (misc) => {
    await misc.scrollToIndexRecursively(35);
    await misc.adapter.remove({
      indexes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    });
  },
  defaultSize: {
    initial: 28,
    final: Math.round(
      Array.from({ length: 35 - 15 })
        .reduce((acc: number, _, i) => acc + (i + 15 + 1) + ITEM_SIZE, 0) / (35 - 15)
    )
  }
}, {
  title: 'should remove some items via Adapter.remove virtually (interrupted)',
  limits: { min: 1, max: 35 },
  getSize: i => i + ITEM_SIZE,
  action: async (misc) => {
    await misc.scrollToIndexRecursively(35);
    await misc.adapter.remove({
      indexes: [1, 2, 3, 4, 5, /*6, 7, 8, 9, 10,*/ 11, 12, 13, 14, 15]
    });
  },
  defaultSize: {
    initial: 28,
    final: Math.round(
      (6 + 7 + 8 + 9 + 10 + 5 * ITEM_SIZE +
        Array.from({ length: 35 - 15 })
          .reduce((acc: number, _, i) => acc + (i + 15 + 1) + ITEM_SIZE, 0)
      ) / (35 + 5 - 15)
    )
  }
}, {
  title: 'should remove one big item in-buffer and another one virtually via Adapter.remove',
  limits: { min: 1, max: 35 },
  getSize: i => i === 35 || i === 1 ? 100 : ITEM_SIZE,
  action: async (misc) => {
    await misc.scrollToIndexRecursively(35);
    await misc.adapter.remove({
      indexes: [1, 35]
    });
  },
  defaultSize: {
    initial: 25,
    final: ITEM_SIZE
  }
}, {
  title: 'should remove one big item in-buffer and another one virtually via Adapter.remove (inverted)',
  limits: { min: 1, max: 35 },
  getSize: i => i === 33 || i === 3 ? 100 : ITEM_SIZE,
  action: async (misc) => {
    await misc.scrollToIndexRecursively(35);
    await misc.scrollMinRelax();
    await misc.adapter.remove({
      indexes: [3, 33]
    });
  },
  defaultSize: {
    initial: 25,
    final: ITEM_SIZE
  }
}];

const configList: TestBedConfig<ICustom>[] = configCustomList.map(custom => ({
  custom,
  ...baseConfig,
  datasourceClass: getLimitedDatasourceClass({
    settings: baseConfig.datasourceSettings,
    common: { limits: custom.limits },
    // devSettings: { debug: true }
  })
}));

const shouldUpdate: ItFuncConfig<ICustom> = config => misc => async done => {
  const { getSize, action, defaultSize } = config.custom;
  (misc.datasource as DatasourceLimiter).setSizes(getSize);
  await misc.relaxNext();
  expect(misc.scroller.buffer.defaultSize).toEqual(defaultSize.initial);
  await action(misc);
  expect(misc.scroller.buffer.defaultSize).toEqual(defaultSize.final);
  done();
};

describe('Dynamic Size Update Spec', () => {

  configList.forEach(config =>
    makeTest({
      config,
      title: config.custom.title,
      it: shouldUpdate(config)
    })
  );

});
