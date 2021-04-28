import { makeTest, TestBedConfig, ItFuncConfig } from './scaffolding/runner';
import { DatasourceResizer, getDatasourceClassForResize } from './scaffolding/datasources/class';
import { SizeStrategy } from './miscellaneous/vscroll';
import { Misc } from './miscellaneous/misc';

interface ICustom {
  title: string;
  getSize: (index: number) => number;
  action?: (misc: Misc) => Promise<void>;
  before: number;
  after?: number;
}

const settings: TestBedConfig['datasourceSettings'] = {
  padding: 0.5,
  bufferSize: 5,
  startIndex: 1,
  minIndex: -99,
  maxIndex: 100,
  sizeStrategy: SizeStrategy.Frequent,
};

const baseConfig: TestBedConfig = {
  datasourceSettings: settings,
  templateSettings: { viewportHeight: 200, dynamicSize: 'size' },
  datasourceClass: getDatasourceClassForResize(settings)
};

const customConfigList: ICustom[] = [{
  title: 'set default on load (0)',
  getSize: () => 20,
  before: 20,
}, {
  title: 'set default on load (1)',
  getSize: i => i < 0 ? -i : (i === 0 ? 1 : i),
  before: 1,
}, {
  title: 'set change default on scroll min',
  getSize: i => i < 0 ? 20 : 30,
  action: misc => misc.scrollMinRelax(),
  before: 30,
  after: 20,
}, {
  title: 'set not change default on scroll max',
  getSize: i => i < 0 ? 20 : 30,
  action: misc => misc.scrollMaxRelax(),
  before: 30,
  after: 30,
}];

const shouldSetDefault: ItFuncConfig<ICustom> = config => misc => async done => {
  const { getSize, action, before, after } = config.custom;
  (misc.datasource as DatasourceResizer).setSizes(getSize);
  await misc.relaxNext();
  expect(misc.scroller.buffer.defaultSize).toBe(before);
  if (action) {
    await action(misc);
    expect(misc.scroller.buffer.defaultSize).toBe(Number.isInteger(after) ? after : before);
  }
  done();
};

describe('Dynamic Frequent Size Spec', () => {

  describe('Load and Scroll', () => customConfigList
    .map(custom => ({ ...baseConfig, custom }))
    .forEach(config =>
      makeTest({
        config,
        title: `should ${config.custom.title}`,
        it: shouldSetDefault(config)
      })
    )
  );

});
