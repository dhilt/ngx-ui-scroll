import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const MIN_INDEX = -99;
const MAX_INDEX = 100;

const baseConfig: TestBedConfig = {
  datasourceName: 'limited--99-100-dynamic-size-processor',
  datasourceSettings: {
    startIndex: 1, padding: 0.5, bufferSize: 10, minIndex: MIN_INDEX, maxIndex: MAX_INDEX, itemSize: 100, adapter: true
  },
  datasourceDevSettings: { debug: true },
  templateSettings: { viewportHeight: 600, dynamicSize: 'size' },
  custom: {
    min: 1,
    max: 10,
    size: 10
  },
  timeout: 9000
};

const configList: TestBedConfig[] = [baseConfig];

const testIt = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const { datasource } = <any>misc.fixture.componentInstance;
  const { adapter } = misc.datasource;
  const initialSize = config.datasourceSettings.itemSize;
  datasource.setProcessGet((result: Array<any>) =>
    result.forEach(item => item.size = initialSize)
  );
  adapter.firstVisible;
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycle = misc.scroller.state.workflowCycleCount;
    const { min, max, size } = config.custom;
    if (cycle === 2) {
      for (let i = min; i <= max; i++) {
        const element = misc.getElement(i);
        if (element) {
          (<HTMLElement>element).style.height = size + 'px';
        }
        datasource.setProcessGet((result: Array<any>) =>
          result.forEach(item => item.size = item.id >= min && item.id <= max ? size : initialSize)
        );
      }
      adapter.check();
    } else {
      expect(adapter.firstVisible.$index).toEqual(1);
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
