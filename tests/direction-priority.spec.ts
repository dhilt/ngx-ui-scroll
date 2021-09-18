import { makeTest, TestBedConfig } from './scaffolding/runner';
import { DatasourceLimiter, getLimitedDatasourceClass } from './scaffolding/datasources/class';
import { Misc } from './miscellaneous/misc';
import { Direction } from './miscellaneous/vscroll';

interface ICustom {
  title: string;
  getSize: (index: number) => number;
  action?: (misc: Misc) => Promise<unknown>;
  result: {
    firstIndex?: number;
    lastIndex?: number;
    maxPosition?: boolean;
  };
}

const settings = {
  startIndex: 99,
  minIndex: 0,
  maxIndex: 99,
};

const baseConfig = {
  datasourceSettings: settings,
  templateSettings: { viewportHeight: 200, dynamicSize: 'size' }
};

const baseScrollConfig = {
  ...baseConfig,
  datasourceSettings: {
    ...settings,
    itemSize: 20,
  }
};

const configList: TestBedConfig<ICustom>[] = [{
  ...baseConfig,
  datasourceClass: getLimitedDatasourceClass({
    settings, devSettings: { directionPriority: Direction.forward }
  }),
  custom: {
    title: 'should stay at the bottom edge when odd items are big (fwd on init)',
    getSize: i => i % 2 === 0 ? 50 : 100,
    result: {
      lastIndex: baseConfig.datasourceSettings.maxIndex,
      maxPosition: true
    }
  }
}, {
  ...baseConfig,
  datasourceClass: getLimitedDatasourceClass({
    settings, devSettings: { directionPriority: Direction.forward }
  }),
  custom: {
    title: 'should stay at the bottom edge when even items are big (fwd on init)',
    getSize: i => i % 2 !== 0 ? 50 : 100,
    result: {
      lastIndex: baseConfig.datasourceSettings.maxIndex,
      maxPosition: true
    }
  }
}, {
  ...baseConfig,
  datasourceClass: getLimitedDatasourceClass({
    settings, devSettings: { directionPriority: Direction.backward }
  }),
  custom: {
    title: 'should stay at the bottom edge when odd items are big (bwd on init)',
    getSize: i => i % 2 === 0 ? 50 : 100,
    result: {
      lastIndex: baseConfig.datasourceSettings.maxIndex,
      maxPosition: true
    }
  }
}, {
  ...baseConfig,
  datasourceClass: getLimitedDatasourceClass({
    settings, devSettings: { directionPriority: Direction.backward }
  }),
  custom: {
    title: 'should not stay at the bottom edge when even items are big (bwd on init)',
    getSize: i => i % 2 !== 0 ? 50 : 100,
    result: {
      lastIndex: baseConfig.datasourceSettings.maxIndex - 1,
      maxPosition: false
    }
  }
}, {
  ...baseScrollConfig,
  datasourceClass: getLimitedDatasourceClass({
    settings, devSettings: { directionPriority: Direction.backward }
  }),
  custom: {
    title: 'should not shift position (bwd on scroll)',
    getSize: i => i >= 80 ? baseScrollConfig.datasourceSettings.itemSize : 100,
    action: misc =>
      misc.scrollToRelax(75 * baseScrollConfig.datasourceSettings.itemSize),
    result: {
      firstIndex: 75
    }
  }
}, {
  ...baseScrollConfig,
  datasourceClass: getLimitedDatasourceClass({
    settings, devSettings: { directionPriority: Direction.forward }
  }),
  custom: {
    title: 'should shift position (fwd on scroll)',
    getSize: i => i >= 80 ? baseScrollConfig.datasourceSettings.itemSize : 100,
    action: misc =>
      misc.scrollToRelax(75 * baseScrollConfig.datasourceSettings.itemSize),
    result: {
      firstIndex: 79
    }
  }
}];

describe('Direction Priority Spec', () => {

  describe('dynamic sizes on init & scroll', () =>
    configList.forEach(config =>
      makeTest({
        config,
        title: config.custom.title,
        it: misc => async done => {
          const { getSize, action, result } = config.custom;
          (misc.datasource as DatasourceLimiter).setSizes(getSize);
          await misc.relaxNext();
          if (action) {
            await action(misc);
          }
          if (result.firstIndex !== void 0) {
            expect(misc.adapter.firstVisible.$index).toBe(result.firstIndex);
          }
          if (result.lastIndex !== void 0) {
            expect(misc.adapter.lastVisible.$index).toBe(result.lastIndex);
          }
          if (result.maxPosition) {
            expect(misc.getScrollPosition()).toBe(misc.getMaxScrollPosition());
          }
          done();
        }
      })
    )
  );

});
