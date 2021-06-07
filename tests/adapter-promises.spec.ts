import { filter, take } from 'rxjs/operators';

import {
  AdapterInsertOptions,
  AdapterAppendOptions,
  AdapterPrependOptions,
  ItemsPredicate,
  AdapterFixOptions,
  AdapterUpdateOptions,
  AdapterPropName as Adapter,
  AdapterMethodResult,
} from './miscellaneous/vscroll';

import { makeTest, TestBedConfig, ItFuncConfig } from './scaffolding/runner';
import { configureTestBedSub } from './scaffolding/testBed';
import { Misc } from './miscellaneous/misc';
import { generateItem } from './miscellaneous/items';

const ITEM_SIZE = 20;

interface ICustom {
  method: Adapter; // Adapter method name
  options: unknown; // Adapter method params
  async: boolean; // produces asynchronicity
  newWFCycle: boolean; // produces additional Workflow cycle
  error?: boolean; // produces error
}

interface ICustom2 {
  count: number;
  interrupt?: 'reload' | 'reset';
}

const configBase = {
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

const delayedConfigList: TestBedConfig<ICustom>[] = [{
  ...configBase,
  custom: {
    method: Adapter.reset,
    options: void 0,
    newWFCycle: true,
    async: true
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.reload,
    options: void 0,
    newWFCycle: true,
    async: true
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.append,
    options: {
      items: [generateItem(100.1)]
    } as AdapterAppendOptions,
    newWFCycle: true,
    async: true
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.prepend,
    options: {
      items: [generateItem(100.1)]
    } as AdapterPrependOptions,
    newWFCycle: true,
    async: true
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.check,
    options: void 0,
    newWFCycle: true,
    async: true
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.remove,
    options: (({ $index }) => $index > 1) as ItemsPredicate,
    newWFCycle: true,
    async: true
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.insert,
    options: {
      after: ({ $index }) => $index === 5,
      items: [generateItem(5 + 0.1)]
    } as AdapterInsertOptions,
    newWFCycle: true,
    async: true
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.update,
    options: {
      predicate: ({ $index }) => $index !== 1, // remove 1st item
    } as AdapterUpdateOptions,
    newWFCycle: true,
    async: true
  }
}];

const immediateConfigSyncList: TestBedConfig<ICustom>[] = [{
  ...configBase,
  custom: {
    method: Adapter.append,
    options: {
      items: [generateItem(100.1)],
      eof: true
    } as AdapterAppendOptions,
    newWFCycle: false,
    async: false
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.prepend,
    options: {
      items: [generateItem(100.1)],
      bof: true
    } as AdapterAppendOptions,
    newWFCycle: false,
    async: false
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.check,
    options: void 0,
    newWFCycle: false,
    async: false
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.remove,
    options: (({ $index }) => $index > 100) as ItemsPredicate,
    newWFCycle: false,
    async: false
  }
}, {
  ...configBase, custom: {
    method: Adapter.insert,
    options: {
      after: ({ $index }) => $index === 55,
      items: [generateItem(55 + 0.1)]
    } as AdapterInsertOptions,
    newWFCycle: false,
    async: false
  }
}, {
  ...configBase,
  datasourceSettings: {
    ...configBase.datasourceSettings,
    bufferSize: 1 // clip will be skipped
  },
  custom: {
    method: Adapter.clip,
    options: void 0,
    newWFCycle: true,
    async: false
  }
}, {
  ...configBase,
  datasourceSettings: {
    ...configBase.datasourceSettings,
    bufferSize: 40 // clip will happen
  },
  custom: {
    method: Adapter.clip,
    options: void 0,
    newWFCycle: true,
    async: false
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.fix,
    options: {
      minIndex: -99
    } as AdapterFixOptions,
    newWFCycle: false,
    async: false
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.update,
    options: {
      predicate: _x => true,
    } as AdapterUpdateOptions,
    newWFCycle: false,
    async: false
  }
}];

const immediateConfigErrorList: TestBedConfig<ICustom>[] = [{
  ...configBase,
  custom: {
    method: Adapter.reset,
    options: {
      get: 'error'
    },
    newWFCycle: false,
    async: false,
    error: true
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.append,
    options: {
      items: 'error'
    },
    newWFCycle: false,
    async: false,
    error: true
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.remove,
    options: 'error',
    newWFCycle: false,
    async: false,
    error: true
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.insert,
    options: 'error',
    newWFCycle: false,
    async: false,
    error: true
  }
}, {
  ...configBase,
  custom: {
    method: Adapter.fix,
    options: {
      minIndex: 'error'
    },
    newWFCycle: false,
    async: false,
    error: true
  }
}];

const concurrentSequencesConfigList: TestBedConfig<ICustom2>[] = [{
  datasourceName: 'limited-1-100-no-delay',
  datasourceSettings: { adapter: true, startIndex: 100 },
  custom: { count: 25 }
}, {
  datasourceName: 'limited-51-200-no-delay',
  datasourceSettings: { adapter: true, startIndex: 200, horizontal: true },
  templateSettings: { viewportWidth: 450, itemWidth: 100, horizontal: true },
  custom: { count: 30 }
}];

const concurrentSequencesInterruptConfigList: TestBedConfig<ICustom2>[] = [{
  ...concurrentSequencesConfigList[0],
  custom: { count: 99, interrupt: 'reload' }
}, {
  ...concurrentSequencesConfigList[1],
  custom: { count: 99, interrupt: 'reset' }
}];

const checkPromisifiedMethod: ItFuncConfig<ICustom> = config => misc => done => {
  const { workflow } = misc;
  const { method: token, options, newWFCycle, async, error } = config.custom;
  misc.adapter.isLoading$
    .pipe(filter(v => !v), take(1))
    .subscribe(() => {
      expect(workflow.cyclesDone).toEqual(1);
      if (token === Adapter.check && async) {
        misc.adapter.fix({
          updater: ({ $index }) =>
            misc.getElement($index).style.height = 5 + 'px'
        });
      }
      const method = (misc.adapter[token]) as unknown as (opt: unknown) => Promise<AdapterMethodResult>;
      method(options).then(({ success, immediate, details: err }) => {
        expect(workflow.cyclesDone).toEqual(newWFCycle ? 2 : 1);
        expect(immediate).toEqual(!newWFCycle);
        expect(success).toEqual(!error);
        if (error) {
          expect(success).toBeFalsy();
          expect(workflow.errors.length).toEqual(1);
          expect(workflow.errors[0].process).toEqual(`adapter.${token}`);
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

const doAppendAndScroll = async (misc: Misc, index: number): Promise<void> => {
  const { adapter } = misc;
  const { success } = await adapter.relax();
  if (success) {
    await adapter.append(generateItem(index));
    await adapter.fix({ scrollPosition: Infinity });
  }
};

const checkConcurrentSequences: ItFuncConfig<ICustom2> = config => misc => async done => {
  await misc.relaxNext();
  const { startIndex } = misc.scroller.settings;
  const { count, interrupt } = config.custom;
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
        title: 'should run a sequence within sequence',
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
    [Adapter.relax, Adapter.reload, Adapter.reset, Adapter.check].forEach(token =>
      it(`should resolve immediately ("${token}")`, async () => {
        const misc = new Misc(configureTestBedSub());
        const method = (misc.adapter[token]) as unknown as () => Promise<AdapterMethodResult>;
        const result = await method();
        expect(result.immediate).toBe(true);
        expect(result.success).toBe(true);
        // expect(result.details).toBe('Adapter is not initialized');
      })
    )
  );

});
