import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const MIN_INDEX = -99;
const MAX_INDEX = 100;

const baseConfig: TestBedConfig = {
  datasourceName: 'limited--99-100-dynamic-size-processor',
  datasourceSettings: {
    startIndex: 1, padding: 0.5, bufferSize: 10, minIndex: MIN_INDEX, maxIndex: MAX_INDEX, itemSize: 100, adapter: true
  },
  templateSettings: { viewportHeight: 600, dynamicSize: 'size' },
  custom: {
    min: 1,
    max: 10,
    size: 10
  },
  timeout: 9000
};

const configList: TestBedConfig[] = [baseConfig];

const updateDOM = (misc: Misc, { min, max, size, initialSize }: any) => {
  const { datasource } = <any>misc.fixture.componentInstance;
  for (let i = min; i <= max; i++) {
    const element = misc.getElement(i);
    if (element) {
      (<HTMLElement>element).style.height = size + 'px';
    }
    datasource.setProcessGet((result: Array<any>) =>
      result.forEach(item => item.size = item.id >= min && item.id <= max ? size : initialSize)
    );
  }
};

const testIt = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const { datasource } = <any>misc.fixture.componentInstance;
  const { datasource: { adapter }, settings, buffer } = misc.scroller;
  const initialSize = config.datasourceSettings.itemSize;
  const { min, max, size } = config.custom;
  datasource.setProcessGet((result: Array<any>) =>
    result.forEach(item => item.size = initialSize)
  );
  adapter.firstVisible;
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycle = misc.scroller.state.workflowCycleCount;
    if (cycle === 2) {
      updateDOM(misc, { min, max, size, initialSize });
      adapter.check();
    } else if (cycle === 3) {
      expect(adapter.firstVisible.$index).toEqual(1);
      const cacheAmount = buffer.cache.size;
      const virtualSize = (settings.maxIndex - settings.minIndex + 1 - cacheAmount) * buffer.averageSize;
      const realSize = (max - min + 1) * size + (cacheAmount - (max - min + 1)) * initialSize;
      expect(misc.getScrollableSize()).toEqual(virtualSize + realSize);
      done();
    }
  });
};

describe('Check Size Spec', () => {

  configList.forEach(config =>
    makeTest({
      config,
      title: 'should check properly',
      it: testIt(config)
    })
  );

});
