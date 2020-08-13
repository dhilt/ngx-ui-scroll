import { makeTest, TestBedConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { Stat } from './miscellaneous/stat';
import { appendItems, generateItems } from './miscellaneous/items';
import { filter, take } from 'rxjs/operators';

const configFetch: TestBedConfig = {
  datasourceName: 'limited-1-20-dynamic-size-special',
  datasourceSettings: {
    startIndex: 1, padding: 0.5, bufferSize: 5, minIndex: 1, maxIndex: 20, itemSize: 20, adapter: true
  },
  templateSettings: { viewportHeight: 100, dynamicSize: 'size' }
};

const configAppend: TestBedConfig = {
  datasourceName: 'limited--99-100-dynamic-size-processor',
  datasourceSettings: {
    startIndex: 50, maxIndex: 100, minIndex: -99, padding: 0.5, bufferSize: 5, itemSize: 20, adapter: true
  },
  templateSettings: { viewportHeight: 200, dynamicSize: 'size' },
  custom: {
    MAX: 100,
    AMOUNT: 50
  }
};

const testConfigFetch = (config: TestBedConfig, misc: Misc, done: Function) => {
  const { scroller, shared } = misc;
  let initialFetchCount = 0;
  spyOn(misc.workflow, 'finalize').and.callFake(() => {
    const cycle = scroller.state.workflowCycleCount;
    if (cycle === 2) {
      shared.stat = new Stat(scroller);
      initialFetchCount = scroller.state.fetch.callCount;
      misc.scrollTo(100);
    } else {
      (new Stat(scroller)).expect(shared.stat);
      done();
    }
  });
};

const relax = ({ adapter }: Misc) => new Promise(resolve =>
  adapter.isLoading$.pipe(
    filter(isLoading => !isLoading),
    take(1)
  ).subscribe(() => resolve())
);

const scroll = (misc: Misc, position: number) => {
  misc.adapter.fix({ scrollPosition: position });
  return relax(misc);
};

const testConfigAppend = async (config: TestBedConfig, misc: Misc, done: Function) => {
  const { workflow, scroller, adapter } = misc;
  const { MAX, AMOUNT } = config.custom;
  await relax(misc);
  // append items to the original datasource
  (misc.datasource as any).setProcessGet((
    result: any[], _index: number, _count: number, _min: number, _max: number
  ) =>
    appendItems(result, _index, _count, _min, _max, AMOUNT, true)
  );
  // append items to the UiScroll
  await adapter.append({
    items: generateItems(AMOUNT, MAX),
    eof: true
  });
  await scroll(misc, Infinity);
  const { countDone } = scroller.state;
  await scroll(misc, Infinity);
  // await scroll(misc, 19438);
  expect(scroller.state.countDone).toEqual(countDone + 1);
  done();
};

describe('Dynamic Size Scroll Spec', () => {

  makeTest({
    config: configFetch,
    title: 'should fetch properly',
    it: (misc: Misc) => (done: Function) => testConfigFetch(configFetch, misc, done)
  });

  makeTest({
    config: configAppend,
    title: 'should append properly',
    it: (misc: Misc) => (done: Function) => testConfigAppend(configAppend, misc, done)
  });

});
