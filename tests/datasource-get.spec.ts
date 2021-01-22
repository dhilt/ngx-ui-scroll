import { makeTest } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

const shouldWork = (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();
  expect(misc.scroller.state.fetch.callCount).toBeGreaterThan(0);
  done();
};

const shouldNotFetch = (misc: Misc) => async (done: Function) => {
  await misc.relaxNext();
  const { buffer, state } = misc.scroller;
  expect(misc.innerLoopCount).toEqual(1);
  expect(state.fetch.callCount).toEqual(0);
  expect(buffer.bof.get()).toEqual(true);
  expect(buffer.eof.get()).toEqual(true);
  done();
};

describe('Datasource Get', () => {

  describe('immediate', () => {
    makeTest({
      config: { datasourceName: 'infinite-observable-no-delay' },
      title: 'should run the workflow with infinite observable-based datasource',
      it: shouldWork
    });

    makeTest({
      config: { datasourceName: 'infinite-promise-no-delay' },
      title: 'should run the workflow with infinite promise-based datasource',
      it: shouldWork
    });

    makeTest({
      config: { datasourceName: 'infinite-callback-no-delay' },
      title: 'should run the workflow with infinite callback-based datasource',
      it: shouldWork
    });

    makeTest({
      config: { datasourceName: 'limited-observable-no-delay' },
      title: 'should run the workflow with limited observable-based datasource',
      it: shouldWork
    });

    makeTest({
      config: { datasourceName: 'limited-promise-no-delay' },
      title: 'should run the workflow with limited promise-based datasource',
      it: shouldWork
    });

    makeTest({
      config: { datasourceName: 'limited-callback-no-delay' },
      title: 'should run the workflow with limited callback-based datasource',
      it: shouldWork
    });
  });

  describe('non-immediate', () => {
    makeTest({
      config: { datasourceName: 'infinite-observable-delay-1' },
      title: 'should run the workflow with infinite observable-based datasource',
      it: shouldWork
    });

    makeTest({
      config: { datasourceName: 'infinite-promise-delay-1' },
      title: 'should run the workflow with infinite promise-based datasource',
      it: shouldWork
    });

    makeTest({
      config: { datasourceName: 'infinite-callback-delay-1' },
      title: 'should run the workflow with infinite callback-based datasource',
      it: shouldWork
    });

    makeTest({
      config: { datasourceName: 'limited-observable-delay-1' },
      title: 'should run the workflow with limited observable-based datasource',
      it: shouldWork
    });

    makeTest({
      config: { datasourceName: 'limited-promise-delay-1' },
      title: 'should run the workflow with limited promise-based datasource',
      it: shouldWork
    });

    makeTest({
      config: { datasourceName: 'limited-callback-delay-1' },
      title: 'should run the workflow with limited callback-based datasource',
      it: shouldWork
    });
  });

  describe('empty', () => {
    makeTest({
      title: 'should not fetch (callback)',
      config: { datasourceName: 'empty-callback' },
      it: shouldNotFetch
    });

    makeTest({
      title: 'should not fetch (rxjs of)',
      config: { datasourceName: 'empty-of' },
      it: shouldNotFetch
    });
  });

});
