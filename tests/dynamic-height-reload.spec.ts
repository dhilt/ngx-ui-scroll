import { ItFuncConfig, makeTest, TestBedConfig } from './scaffolding/runner';
import { SizeStrategy } from './miscellaneous/vscroll';

const MIN_INDEX = -99;
const MAX_INDEX = 100;

interface ICustom {
  reloadIndex: number;
}

const baseConfig: TestBedConfig = {
  datasourceName: 'limited--99-100-dynamic-size',
  datasourceSettings: {
    startIndex: 1,
    padding: 0.5,
    bufferSize: 10,
    minIndex: MIN_INDEX,
    maxIndex: MAX_INDEX,
    itemSize: 20,
    sizeStrategy: SizeStrategy.Average
  },
  templateSettings: { viewportHeight: 600, dynamicSize: 'size' },
  timeout: 4000
};

const reloadIndexList = [-99, -98, -90, -75, /*-50,*/ -35, -20, -10, -5, -2, -1, 0, 1, 2, 5, 10, 20, 35, 50, 75, 90];
const configList: TestBedConfig<ICustom>[] = reloadIndexList.map(index => ({
  ...baseConfig, custom: { reloadIndex: index }
}));

const shouldReload: ItFuncConfig<ICustom> = config => misc => async done => {
  await misc.relaxNext();
  const reloadIndex = config.custom.reloadIndex;
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
