import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const MIN_INDEX = -99;
const MAX_INDEX = 100;

const baseConfig: TestBedConfig = {
  datasourceName: 'limited--99-100-dynamic-size',
  datasourceSettings: {
    startIndex: 1, padding: 0.5, bufferSize: 10, minIndex: MIN_INDEX, maxIndex: MAX_INDEX, itemSize: 20, adapter: true
  },
  templateSettings: { viewportHeight: 600, dynamicSize: 'size' },
  timeout: 4000
};

const reloadIndexList = [-99, -98, -90, -75, -50, -35, -20, -10, -5, -2, -1, 0, 1, 2, 5, 10, 20, 35, 50, 75, 90];
const configList: TestBedConfig[] = reloadIndexList.map(index => ({
  ...baseConfig, custom: { reloadIndex: index }
}));

const testIt = (config: TestBedConfig, misc: Misc, done: Function) => {
  const { adapter } = misc;
  const cycle = misc.scroller.state.workflowCycleCount;
  const reloadIndex = config.custom.reloadIndex;
  const { firstVisible } = adapter; // need to have a pre-call
  if (cycle === 2) {
    adapter.reload(reloadIndex);
  } else {
    expect(firstVisible.$index).toEqual(reloadIndex);
    done();
  }
};

describe('Dynamic Size Reload Spec', () => {

  configList.forEach(config =>
    makeTest({
      config,
      title: 'should reload properly',
      meta: `reloadIndex: ${config.custom.reloadIndex}`,
      it: (misc: Misc) => (done: Function) =>
        spyOn(misc.workflow, 'finalize').and.callFake(() =>
          testIt(config, misc, done)
        )
    })
  );

});
