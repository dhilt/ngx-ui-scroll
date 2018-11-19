import { Direction } from '../src/component/interfaces';
import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const configList: TestBedConfig[] = [{
  datasourceSettings: { startIndex: 100, bufferSize: 4, padding: 0.22, itemSize: 20 },
  templateSettings: { viewportHeight: 71, itemHeight: 20 },
  custom: { direction: Direction.forward, count: 1 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 0.2, itemSize: 20 },
  templateSettings: { viewportHeight: 100 },
  custom: { direction: Direction.forward, count: 1 }
}, {
  datasourceSettings: { startIndex: -15, bufferSize: 12, padding: 0.98, itemSize: 20 },
  templateSettings: { viewportHeight: 66, itemHeight: 20 },
  custom: { direction: Direction.forward, count: 1 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 5, padding: 1, horizontal: true, itemSize: 90 },
  templateSettings: { viewportWidth: 450, itemWidth: 90, horizontal: true },
  custom: { direction: Direction.forward, count: 1 }
}, {
  datasourceSettings: { startIndex: -74, bufferSize: 4, padding: 0.72, horizontal: true, itemSize: 75 },
  templateSettings: { viewportWidth: 300, itemWidth: 75, horizontal: true },
  custom: { direction: Direction.forward, count: 1 }
}];

configList.forEach(config => config.datasourceSettings.adapter = true);

const shouldPrepend = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  let indexToPrepend = -Infinity;

  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycles = misc.workflow.cyclesDone;
    if (cycles === 1) {
      indexToPrepend = misc.scroller.buffer.getIndexToPrepend();
      misc.datasource.adapter.prepend({ id: indexToPrepend, text: 'item #' + indexToPrepend });
    } else {
      const firstIndex = misc.scroller.buffer.firstIndex;
      expect(firstIndex).toEqual(indexToPrepend);
      expect(misc.padding.backward.getSize()).toEqual(0);
      done();
    }
  });
};

describe('Prepend Spec', () => {

  configList.forEach(config =>
    makeTest({
      config,
      title: 'should prepend',
      it: shouldPrepend(config)
    })
  );

});

