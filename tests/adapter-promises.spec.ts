import { filter, take } from 'rxjs/operators';

import {
  AdapterInsertOptions, AdapterAppendOptions, AdapterPrependOptions, ItemsPredicate, AdapterFixOptions
} from 'vscroll/dist/typings/interfaces';

import { makeTest, TestBedConfig } from './scaffolding/runner';
import { configureTestBedSub } from './scaffolding/testBed';
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

const concurrentSequencesConfigList: TestBedConfig[] = [{
  datasourceName: 'limited-1-100-no-delay',
  datasourceSettings: { adapter: true, startIndex: 100 },
  custom: { count: 25 }
}, {
  datasourceName: 'limited-51-200-no-delay',
  datasourceSettings: { adapter: true, startIndex: 200, horizontal: true },
  templateSettings: { viewportWidth: 450, itemWidth: 100, horizontal: true },
  custom: { count: 30 }
}];

const concurrentSequencesInterruptConfigList = [{
  ...concurrentSequencesConfigList[0],
  custom: { count: 99, interrupt: 'reload' }
}, {
  ...concurrentSequencesConfigList[1],
  custom: { count: 99, interrupt: 'reset' }
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
      (misc.adapter as any)[method](options).then(({ success, immediate, details: err }: any) => {
        expect(workflow.cyclesDone).toEqual(newWFCycle ? 2 : 1);
        expect(immediate).toEqual(!newWFCycle);
        expect(success).toEqual(!error);
        if (error) {
          expect(success).toBeFalsy();
          expect(workflow.errors.length).toEqual(1);
          expect(workflow.errors[0].process).toEqual(`adapter.${method}`);
          expect(err).toBeTruthy();
        } else {
          expect(success).toBeTruthy();
          expect(err).toBeFalsy();
        }
        done();
      });
      expect(workflow.cyclesDone).toEqual(!async && newWFCycle ? 2 : 1);
    });
};

const doAppendAndScroll = async (misc: Misc, index: number): Promise<any> => {
  const { adapter } = misc;
  const { success } = await adapter.relax();
  if (success) {
    await adapter.append(generateItem(index));
    await adapter.fix({ scrollPosition: Infinity });
  }
};

const checkConcurrentSequences = (config: TestBedConfig) => (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();
  const { datasourceSettings: { startIndex }, custom: { count, interrupt } } = config;
  const scrollPosition = misc.getScrollPosition();
  for (let i = 0; i < count; i++) { // multiple concurrent calls
    doAppendAndScroll(misc, startIndex + i + 1);
  }
  if (interrupt === 'reload') {
    await misc.adapter.reload();
  } else if (interrupt === 'reset') {
    await misc.adapter.reset();
  } else {
    await misc.adapter.relax();
  }
  if (interrupt) {
    expect(misc.workflow.cyclesDone).toEqual(2);
  } else {
    const newScrollPosition = scrollPosition + misc.getItemSize() * count;
    expect(misc.getScrollPosition()).toEqual(newScrollPosition);
    expect(misc.workflow.cyclesDone).toEqual(count + 1);
  }
  done();
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

  describe('Concurrent sequences', () => {
    concurrentSequencesConfigList.forEach(config =>
      makeTest({
        title: `should run a sequence within sequence`,
        config,
        it: checkConcurrentSequences(config)
      })
    );

    concurrentSequencesInterruptConfigList.forEach(config =>
      makeTest({
        title: `should reset all promises after Adapter.${config.custom.interrupt}`,
        config,
        it: checkConcurrentSequences(config)
      })
    );
  });

  describe('Call before init', () =>
    ['relax', 'reload', 'reset', 'check'].forEach(method =>
      it(`should immediately return with no success ("${method}")`, async (done) => {
        const misc = new Misc(configureTestBedSub());
        const result = await (misc.adapter as any)[method]();
        expect(result.success).toBe(false);
        expect(result.immediate).toBe(true);
        done();
      })
    )
  );

});
