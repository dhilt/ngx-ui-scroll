import { makeTest } from './scaffolding/runner';

describe('Datasource Get', () => {

  const shouldWork = (misc) => (done) => {
    expect(misc.workflow.cyclesDone).toBe(1);
    expect(misc.scroller.state.fetch.count).toBeGreaterThan(0);
    done();
  };

  makeTest({
    config: { datasourceName: 'infinite-observable-no-delay' },
    title: 'should run the workflow with immediate infinite observable-based datasource',
    it: shouldWork
  });

  makeTest({
    config: { datasourceName: 'infinite-promise-no-delay' },
    title: 'should run the workflow with immediate infinite promise-based datasource',
    it: shouldWork
  });

  makeTest({
    config: { datasourceName: 'infinite-callback-no-delay' },
    title: 'should run the workflow with immediate infinite callback-based datasource',
    it: shouldWork
  });

  makeTest({
    config: { datasourceName: 'limited-observable-no-delay' },
    title: 'should run the workflow with immediate limited observable-based datasource',
    it: shouldWork
  });

  makeTest({
    config: { datasourceName: 'limited-promise-no-delay' },
    title: 'should run the workflow with immediate limited promise-based datasource',
    it: shouldWork
  });

  makeTest({
    config: { datasourceName: 'limited-callback-no-delay' },
    title: 'should run the workflow with immediate limited callback-based datasource',
    it: shouldWork
  });

  makeTest({
    config: { datasourceName: 'infinite-observable-delay-1' },
    title: 'should run the workflow with non-immediate infinite observable-based datasource',
    it: shouldWork
  });

  makeTest({
    config: { datasourceName: 'infinite-promise-delay-1' },
    title: 'should run the workflow with non-immediate infinite promise-based datasource',
    it: shouldWork
  });

  makeTest({
    config: { datasourceName: 'infinite-callback-delay-1' },
    title: 'should run the workflow with non-immediate infinite callback-based datasource',
    it: shouldWork
  });

  makeTest({
    config: { datasourceName: 'limited-observable-delay-1' },
    title: 'should run the workflow with non-immediate limited observable-based datasource',
    it: shouldWork
  });

  makeTest({
    config: { datasourceName: 'limited-promise-delay-1' },
    title: 'should run the workflow with non-immediate limited promise-based datasource',
    it: shouldWork
  });

  makeTest({
    config: { datasourceName: 'limited-callback-delay-1' },
    title: 'should run the workflow with non-immediate limited callback-based datasource',
    it: shouldWork
  });

});
