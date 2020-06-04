import { filter, take } from 'rxjs/operators';

import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { generateItem } from './miscellaneous/items';
import { AdapterInsertOptions, AdapterAppendOptions, AdapterPrependOptions, ItemsPredicate, AdapterFixOptions } from '../src/component/interfaces';

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
  // datasourceDevSettings: { debug: true },
  templateSettings: { viewportHeight: ITEM_SIZE * 10 }
};

interface ICustom {
  method: string; // Adapter method name
  options: any; // Adapter method params
  async: boolean; // produces asynchronicity
  newWFCycle: boolean; // produces additional Workflow cycle
  error: boolean; // produces error
}

const delayedConfigList = [{
  ...configBase,
  custom: {
    method: 'reset',
    options: void 0,
    newWFCycle: true,
    async: true
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'reload',
    options: void 0,
    newWFCycle: true,
    async: true
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'append',
    options: {
      items: [generateItem(100.1)]
    } as AdapterAppendOptions,
    newWFCycle: true,
    async: true
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'prepend',
    options: {
      items: [generateItem(100.1)]
    } as AdapterPrependOptions,
    newWFCycle: true,
    async: true
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'check',
    newWFCycle: true,
    async: true
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'remove',
    options: (({ $index }) => $index > 1) as ItemsPredicate,
    newWFCycle: true,
    async: true
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'insert',
    options: {
      after: ({ $index }) => $index === 5,
      items: [generateItem(5 + 0.1)]
    } as AdapterInsertOptions,
    newWFCycle: true,
    async: true
  } as ICustom
}];

const immediateConfigSyncList = [{
  ...configBase,
  custom: {
    method: 'append',
    options: {
      items: [generateItem(100.1)],
      eof: true
    } as AdapterAppendOptions,
    newWFCycle: false,
    async: false
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'prepend',
    options: {
      items: [generateItem(100.1)],
      bof: true
    } as AdapterAppendOptions,
    newWFCycle: false,
    async: false
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'check',
    newWFCycle: false,
    async: false
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'remove',
    options: (({ $index }) => $index > 100) as ItemsPredicate,
    newWFCycle: false,
    async: false
  } as ICustom
}, {
  ...configBase, custom: {
    method: 'insert',
    options: {
      after: ({ $index }) => $index === 55,
      items: [generateItem(55 + 0.1)]
    } as AdapterInsertOptions,
    newWFCycle: false,
    async: false
  } as ICustom
}, {
  ...configBase,
  datasourceSettings: {
    ...configBase.datasourceSettings,
    bufferSize: 1 // clip will be skipped
  },
  custom: {
    method: 'clip',
    options: void 0,
    newWFCycle: true,
    async: false
  } as ICustom
}, {
  ...configBase,
  datasourceSettings: {
    ...configBase.datasourceSettings,
    bufferSize: 40 // clip will happen
  },
  custom: {
    method: 'clip',
    options: void 0,
    newWFCycle: true,
    async: false
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'fix',
    options: {
      minIndex: -99
    } as AdapterFixOptions,
    newWFCycle: false,
    async: false
  } as ICustom
}];

const immediateConfigErrorList = [{
  ...configBase,
  custom: {
    method: 'append',
    options: {
      items: 'error'
    },
    newWFCycle: false,
    async: false,
    error: true
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'reset',
    options: {
      get: 'error'
    },
    newWFCycle: false,
    async: false,
    error: true
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'prepend',
    options: {
      items: 'error'
    },
    newWFCycle: false,
    async: false,
    error: true
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'remove',
    options: 'error',
    newWFCycle: false,
    async: false,
    error: true
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'insert',
    options: 'error',
    newWFCycle: false,
    async: false,
    error: true
  } as ICustom
}, {
  ...configBase,
  custom: {
    method: 'fix',
    options: {
      minIndex: 'error'
    },
    newWFCycle: false,
    async: false,
    error: true
  } as ICustom
}];

const checkPromisifiedMethod = (config: TestBedConfig) => (misc: Misc) => (done: Function) => {
  const { workflow } = misc;
  const { method, options, newWFCycle, async, error } = config.custom as ICustom;
  misc.adapter.isLoading$
    .pipe(filter(v => !v), take(1))
    .subscribe(() => {
      expect(workflow.cyclesDone).toEqual(1);
      if (method === 'check' && async) {
        misc.adapter.fix({
          updater: ({ $index }) =>
            misc.getElement($index).style.height = 5 + 'px'
        });
      }
      (misc.adapter as any)[method](options).then(() => {
        expect(workflow.cyclesDone).toEqual(newWFCycle ? 2 : 1);
        if (error) {
          expect(workflow.errors.length).toEqual(1);
          expect(workflow.errors[0].process).toEqual(`adapter.${method}`);
        }
        done();
      });
      expect(workflow.cyclesDone).toEqual(!async && newWFCycle ? 2 : 1);
    });
};

describe('Adapter Promises Spec', () => {

  describe('Promisified method', () => {
    delayedConfigList.forEach(config =>
      makeTest({
        config,
        title: `should resolve "${config.custom.method}" asynchronously`,
        it: checkPromisifiedMethod(config)
      })
    );

    immediateConfigSyncList.forEach(config =>
      makeTest({
        config,
        title: `should resolve "${config.custom.method}" immediately by no async processes`,
        it: checkPromisifiedMethod(config)
      })
    );

    immediateConfigErrorList.forEach(config =>
      makeTest({
        config,
        title: `should resolve "${config.custom.method}" immediately due to error`,
        it: checkPromisifiedMethod(config)
      })
    );
  });

});
