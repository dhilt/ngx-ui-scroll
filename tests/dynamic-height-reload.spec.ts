import { ItFuncConfig, makeTest, TestBedConfig } from './scaffolding/runner';
import { SizeStrategy } from './miscellaneous/vscroll';
import { DatasourceLimiter, getLimitedDatasourceClass } from './scaffolding/datasources/class';
import { getDynamicSizeByIndex } from './miscellaneous/dynamicSize';

interface ICustom {
  reloadIndex: number;
  getSize: (index: number) => number;
}

const baseConfig: TestBedConfig<ICustom> = {
  datasourceSettings: {
    startIndex: 1,
    padding: 0.5,
    bufferSize: 10,
    minIndex: -99,
    maxIndex: 100,
    itemSize: 20,
    sizeStrategy: SizeStrategy.Average
  },
  templateSettings: { viewportHeight: 600, dynamicSize: 'size' },
  custom: {
    reloadIndex: 0,
    getSize: i => getDynamicSizeByIndex(i)
  },
  timeout: 4000
};

const reloadIndexList = [-99, -98, -90, -75, /*-50,*/ -35, -20, -10, -5, -2, -1, 0, 1, 2, 5, 10, 20, 35, 50, 75, 90];
const configList: TestBedConfig<ICustom>[] = reloadIndexList.map(index => ({
  ...baseConfig,
  custom: {
    ...baseConfig.custom,
    reloadIndex: index,
  }
})).map(c => ({
  ...c,
  datasourceClass: getLimitedDatasourceClass({ settings: c.datasourceSettings })
}));

const shouldReload: ItFuncConfig<ICustom> = config => misc => async done => {
  (misc.datasource as DatasourceLimiter).setSizes(config.custom.getSize);
  await misc.relaxNext();
  const { reloadIndex } = config.custom;
  misc.adapter.reload(reloadIndex);
  await misc.relaxNext();
  expect(misc.adapter.firstVisible.$index).toEqual(reloadIndex);
  done();
};

describe('Dynamic Size Reload Spec', () => {

  configList.forEach(config =>
    makeTest({
      config,
      title: 'should reload properly',
      meta: `reloadIndex: ${config.custom.reloadIndex}`,
      it: shouldReload(config)
    })
  );

});
