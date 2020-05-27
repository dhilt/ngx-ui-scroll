import { filter, take } from 'rxjs/operators';

import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { generateItem } from './miscellaneous/items';
import { AdapterInsertOptions } from '../src/component/interfaces';

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
  const { options, immediate, error } = config.custom;
  misc.adapter.isLoading$
    .pipe(filter(v => !v), take(1))
    .subscribe(() => {
      misc.adapter.insert(options).then(() => {
        expect(workflow.cyclesDone).toEqual(immediate ? 1 : 2);
        if (error) {
          expect(workflow.errors.length).toEqual(1);
          expect(workflow.errors[0].process).toEqual('adapter.insert');
        }
        done();
      });
      expect(workflow.cyclesDone).toEqual(1);
    });
};

describe('Adapter Promises Spec', () => {

  describe('Promisified method', () => {
    const delayedConfig = {
      ...configBase, custom: {
        options: {
          after: ({ $index }) => $index === 5,
          items: [generateItem(5 + 0.1)]
        } as AdapterInsertOptions,
        immediate: false
      }
    };
    const immediateConfigSync = {
      ...configBase, custom: {
        options: {
          after: ({ $index }) => $index === 55,
          items: [generateItem(55 + 0.1)]
        } as AdapterInsertOptions,
        immediate: true
      }
    };
    const immediateConfigError = {
      ...configBase, custom: {
        options: 'error',
        immediate: true,
        error: true
      }
    };

    makeTest({
      config: delayedConfig,
      title: 'should be resolved after the Workflow is stopped',
      it: checkPromisifiedMethod(delayedConfig)
    });

    makeTest({
      config: immediateConfigSync,
      title: 'should be resolved immediately (by no async processes)',
      it: checkPromisifiedMethod(immediateConfigSync)
    });

    makeTest({
      config: immediateConfigError,
      title: 'should be resolved immediately (by error)',
      it: checkPromisifiedMethod(immediateConfigError)
    });
  });

});
