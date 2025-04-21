import { makeTest, ItFunc, TestBedConfig } from '../scaffolding/runner';
import { Settings } from '../miscellaneous/vscroll';

const configClass: TestBedConfig<void, false> = {
  datasourceClass: class {
    settings: Settings;
    constructor() {
      this.settings = {};
    }
    get(_offset: number, _count: number) {
      return [];
    }
    reset() { }
  }
};

const shouldWork: ItFunc = misc => async done => {
  await misc.relaxNext();
  expect(misc.scroller.state.fetch.callCount).toBeGreaterThan(0);
  done();
};

const shouldNotFetch: ItFunc = misc => async done => {
  await misc.relaxNext();
  const { buffer, state } = misc.scroller;
  expect(misc.innerLoopCount).toEqual(1);
  expect(state.fetch.callCount).toEqual(0);
  expect(buffer.bof.get()).toEqual(true);
  expect(buffer.eof.get()).toEqual(true);
  done();
};

describe('Datasource Class', () => {
  makeTest<void, false>({
    config: configClass,
    title: 'should pass',
    it: () => done => done()
  });
});

describe('Datasource Get', () => {
  describe('immediate', () =>
    [
      {
        config: { datasourceName: 'infinite-observable-no-delay' },
        title:
          'should run the workflow with infinite observable-based datasource',
        it: shouldWork
      },
      {
        config: { datasourceName: 'infinite-promise-no-delay' },
        title: 'should run the workflow with infinite promise-based datasource',
        it: shouldWork
      },
      {
        config: { datasourceName: 'infinite-callback-no-delay' },
        title:
          'should run the workflow with infinite callback-based datasource',
        it: shouldWork
      },
      {
        config: { datasourceName: 'limited-observable-no-delay' },
        title:
          'should run the workflow with limited observable-based datasource',
        it: shouldWork
      },
      {
        config: { datasourceName: 'limited-promise-no-delay' },
        title: 'should run the workflow with limited promise-based datasource',
        it: shouldWork
      },
      {
        config: { datasourceName: 'limited-callback-no-delay' },
        title: 'should run the workflow with limited callback-based datasource',
        it: shouldWork
      }
    ].forEach(c => makeTest<void, false>(c)));

  describe('non-immediate', () =>
    [
      {
        config: { datasourceName: 'infinite-observable-delay-1' },
        title:
          'should run the workflow with infinite observable-based datasource',
        it: shouldWork
      },
      {
        config: { datasourceName: 'infinite-promise-delay-1' },
        title: 'should run the workflow with infinite promise-based datasource',
        it: shouldWork
      },
      {
        config: { datasourceName: 'infinite-callback-delay-1' },
        title:
          'should run the workflow with infinite callback-based datasource',
        it: shouldWork
      },
      {
        config: { datasourceName: 'limited-observable-delay-1' },
        title:
          'should run the workflow with limited observable-based datasource',
        it: shouldWork
      },
      {
        config: { datasourceName: 'limited-promise-delay-1' },
        title: 'should run the workflow with limited promise-based datasource',
        it: shouldWork
      },
      {
        config: { datasourceName: 'limited-callback-delay-1' },
        title: 'should run the workflow with limited callback-based datasource',
        it: shouldWork
      }
    ].forEach(c => makeTest<void, false>(c)));

  describe('empty', () =>
    [
      {
        title: 'should not fetch (callback)',
        config: { datasourceName: 'empty-callback' },
        it: shouldNotFetch
      },
      {
        title: 'should not fetch (rxjs of)',
        config: { datasourceName: 'empty-of' },
        it: shouldNotFetch
      }
    ].forEach(c => makeTest<void, false>(c)));
});
