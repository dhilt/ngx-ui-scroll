import { Direction } from '../src/component/interfaces';
import { makeTest } from './scaffolding/runner';


const configList = [{
  datasourceSettings: { startIndex: 100, bufferSize: 5, padding: 0.2 },
  templateSettings: { viewportHeight: 100 }
}, {
  datasourceSettings: { startIndex: -50, bufferSize: 4, padding: 0.49 },
  templateSettings: { viewportHeight: 70 }
}];

const shouldReload = (config) => (misc) => (done) => {
  const _forward = misc.scroller.direction === Direction.forward;

  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    if (misc.workflow.cyclesDone === 1) {
      misc.datasource.adapter.reload();
    }
    if (misc.workflow.cyclesDone === 2) {
      const firstIndex = config.datasourceSettings.startIndex - config.datasourceSettings.bufferSize;
      const firstItem = misc.scroller.buffer.getFirstVisibleItem();
      expect(firstItem.$index).toEqual(firstIndex);
      done();
    }
  });
};

describe('Adapter Spec', () => {

    describe('Simple reload', () =>
      configList.forEach(config =>
        makeTest({
          config,
          title: 'should work',
          it: shouldReload(config)
        })
      )
    );

});
