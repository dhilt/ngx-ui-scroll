import { filter, take } from 'rxjs/operators';

import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { generateItem } from './miscellaneous/items';

const ITEM_SIZE = 20;

const configBase: TestBedConfig = {
  datasourceName: 'default-delay-25',
  datasourceSettings: {
    itemSize: ITEM_SIZE,
    startIndex: 1,
    bufferSize: 10,
    padding: 0.5,
    adapter: true
  },
  templateSettings: { viewportHeight: ITEM_SIZE * 10 }
};

const checkPromisifiedMethod = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const { workflow } = misc;
  const { insertAfter: _index, shouldInsert } = config.custom;
  misc.adapter.isLoading$
    .pipe(filter(v => !v), take(1))
    .subscribe(() => {
      misc.adapter.insert({
        after: ({ $index }) => $index === _index,
        items: [generateItem(_index + 0.1)]
      }).then(() => {
        expect(workflow.cyclesDone).toEqual(shouldInsert ? 2 : 1);
        done();
      });
      expect(workflow.cyclesDone).toEqual(1);
    });
};

describe('Adapter Promises Spec', () => {

  describe('Promisified method', () => {
    const delayedConfig = { ...configBase, custom: { insertAfter: 5, shouldInsert: true } };
    const immediateConfig = { ...configBase, custom: { insertAfter: 55, shouldInsert: false } };

    makeTest({
      config: delayedConfig,
      title: 'should be resolved after the Workflow is stopped',
      it: checkPromisifiedMethod(delayedConfig)
    });

    makeTest({
      config: immediateConfig,
      title: 'should be resolved immediately',
      it: checkPromisifiedMethod(immediateConfig)
    });
  });

});
