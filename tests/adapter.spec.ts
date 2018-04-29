import { Direction } from '../src/component/interfaces';
import { makeTest } from './scaffolding/runner';

const configList = [{
  datasourceSettings: { startIndex: 100, bufferSize: 5, padding: 0.2 },
  templateSettings: { viewportHeight: 100 },
  custom: { startIndex: null, scrollCount: null }
}, {
  datasourceSettings: { startIndex: -50, bufferSize: 4, padding: 0.49 },
  templateSettings: { viewportHeight: 70 },
  custom: { startIndex: null, scrollCount: null }
}, {
  datasourceSettings: { startIndex: -33, bufferSize: 5, padding: 0.3, horizontal: true },
  templateSettings: { viewportWidth: 300, itemWidth: 100, horizontal: true },
  custom: { startIndex: null, scrollCount: null }
}];

const indexedConfigList = configList.map((config, i) => ({
  ...config,
  custom: {
    ...config.custom,
    startIndex: [-10, 1255, 2][i]
  }
}));

const scrolledConfigList = configList.map((config, i) => ({
  ...config,
  custom: {
    startIndex: [-10, null, 2][i],
    scrollCount: [3, 5, 2][i]
  }
}));

const shouldReload = (config) => (misc) => (done) => {
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (misc.workflow.cyclesDone < 1 + config.custom.scrollCount) {
      misc.scrollMax();
    } else if (misc.workflow.cyclesDone === 1 + config.custom.scrollCount) {
      if (config.custom.startIndex !== null) {
        misc.datasource.adapter.reload(config.custom.startIndex);
      } else {
        misc.datasource.adapter.reload();
      }
    } else {
      const startIndex = config.custom.startIndex === null ?
        config.datasourceSettings.startIndex : config.custom.startIndex;
      const firstIndex = startIndex - config.datasourceSettings.bufferSize;
      const firstItem = misc.scroller.buffer.getFirstVisibleItem();
      expect(firstItem.$index).toEqual(firstIndex);
      done();
    }
  });
};

describe('Adapter Spec', () => {

    describe('simple reload', () =>
      configList.forEach(config =>
        makeTest({
          config,
          title: 'should reload at initial position',
          it: shouldReload(config)
        })
      )
    );

    describe('reload with parameter', () =>
      indexedConfigList.forEach(config =>
        makeTest({
          config,
          title: 'should reload at param position',
          it: shouldReload(config)
        })
      )
    );

    describe('reload after scroll', () =>
      scrolledConfigList.forEach(config =>
        makeTest({
          config,
          title: 'should reload at proper position',
          it: shouldReload(config)
        })
      )
    );

});
