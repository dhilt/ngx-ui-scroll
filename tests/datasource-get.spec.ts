import { makeTest } from './scaffolding/runner';

describe('Datasource Get', () => {

  const shouldWork = (misc) => (done) => {
    expect(misc.workflow.cyclesDone).toBe(1);
    expect(misc.scroller.state.fetch.count).toBeGreaterThan(0);
    done();
  };

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

});
