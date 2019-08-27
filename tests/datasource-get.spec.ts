import { makeTest } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

describe('Datasource Get', () => {

  const shouldWork = (misc: Misc) => (done: Function) =>
    spyOn(misc.workflow, 'finalize').and.callFake(() => {
      expect(misc.scroller.state.fetch.callCount).toBeGreaterThan(0);
      done();
    });

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
      title: 'should not fetch',
      config: { datasourceName: 'empty-callback' },
      it: (misc: Misc) => (done: Function) =>
        spyOn(misc.workflow, 'finalize').and.callFake(() => {
          const { buffer, state } = misc.scroller;
          expect(state.innerLoopCount).toEqual(1);
          expect(state.fetch.callCount).toEqual(0);
          expect(buffer.bof).toEqual(true);
          expect(buffer.eof).toEqual(true);
          done();
        })
    });
  });

});
