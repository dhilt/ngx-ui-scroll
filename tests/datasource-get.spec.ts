import { makeTest, ItFunc, TestBedConfig, ItFuncConfig } from './scaffolding/runner';

import { INVALID_DATASOURCE_PREFIX, Settings } from './miscellaneous/vscroll';

const configClassPass: TestBedConfig<void, false> = {
  datasourceClass: class {
    settings: Settings;
    test: true;
    constructor() {
      this.settings = {};
    }
    get(_offset: number, _count: number) {
      return [];
    }
    reset() { }
  }
};

interface ICustomClassFail {
  title: string;
  error?: string;
  errorStart?: string;
}

const configListClassFail: TestBedConfig<ICustomClassFail, false>[] = [{
  datasourceClass: 'invalid' as unknown as { new(): void },
  toThrow: true,
  custom: {
    title: 'should throw exception (datasource is not a constructor)',
    error: 'datasource is not a constructor'
  }
}, {
  datasourceClass: class {
    settings: Settings;
    constructor() {
      this.settings = {};
    }
  },
  toThrow: true,
  custom: {
    title: 'should throw exception (no get)',
    errorStart: INVALID_DATASOURCE_PREFIX
  }
}, {
  datasourceClass: class {
    settings: Settings;
    get: boolean;
    constructor() {
      this.settings = {};
      this.get = true;
    }
  },
  toThrow: true,
  custom: {
    title: 'should throw exception (get is not a function)',
    errorStart: INVALID_DATASOURCE_PREFIX
  }
}, {
  datasourceClass: class {
    settings: Settings;
    constructor() {
      this.settings = {};
    }
    get(offset: number) {
      return ++offset;
    }
  },
  toThrow: true,
  custom: {
    title: 'should throw exception (get has less than 2 arguments)',
    errorStart: INVALID_DATASOURCE_PREFIX
  }
}];

const shouldFail: ItFuncConfig<ICustomClassFail, false> = config => error => done => {
  if (config.custom.error) {
    expect(error).toBe(config.custom.error);
  } else if (config.custom.errorStart) {
    expect(error.toString().startsWith(config.custom.errorStart)).toBeTrue();
  }
  done();
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

  describe('Pass', () =>
    makeTest<void, false>({
      config: configClassPass,
      title: 'should pass',
      it: () => done => done()
    })
  );

  describe('Fail', () =>
    configListClassFail.forEach(config =>
      makeTest<ICustomClassFail, false>({
        config: config,
        title: config.custom.title,
        it: shouldFail(config)
      })
    )
  );
});

describe('Datasource Get', () => {

  describe('immediate', () => [
    {
      config: { datasourceName: 'infinite-observable-no-delay' },
      title: 'should run the workflow with infinite observable-based datasource',
      it: shouldWork
    }, {
      config: { datasourceName: 'infinite-promise-no-delay' },
      title: 'should run the workflow with infinite promise-based datasource',
      it: shouldWork
    }, {
      config: { datasourceName: 'infinite-callback-no-delay' },
      title: 'should run the workflow with infinite callback-based datasource',
      it: shouldWork
    }, {
      config: { datasourceName: 'limited-observable-no-delay' },
      title: 'should run the workflow with limited observable-based datasource',
      it: shouldWork
    }, {
      config: { datasourceName: 'limited-promise-no-delay' },
      title: 'should run the workflow with limited promise-based datasource',
      it: shouldWork
    }, {
      config: { datasourceName: 'limited-callback-no-delay' },
      title: 'should run the workflow with limited callback-based datasource',
      it: shouldWork
    }
  ].forEach(c => makeTest<void, false>(c)));

  describe('non-immediate', () => [
    {
      config: { datasourceName: 'infinite-observable-delay-1' },
      title: 'should run the workflow with infinite observable-based datasource',
      it: shouldWork
    }, {
      config: { datasourceName: 'infinite-promise-delay-1' },
      title: 'should run the workflow with infinite promise-based datasource',
      it: shouldWork
    }, {
      config: { datasourceName: 'infinite-callback-delay-1' },
      title: 'should run the workflow with infinite callback-based datasource',
      it: shouldWork
    }, {
      config: { datasourceName: 'limited-observable-delay-1' },
      title: 'should run the workflow with limited observable-based datasource',
      it: shouldWork
    }, {
      config: { datasourceName: 'limited-promise-delay-1' },
      title: 'should run the workflow with limited promise-based datasource',
      it: shouldWork
    }, {
      config: { datasourceName: 'limited-callback-delay-1' },
      title: 'should run the workflow with limited callback-based datasource',
      it: shouldWork
    }
  ].forEach(c => makeTest<void, false>(c)));


  describe('empty', () => [
    {
      title: 'should not fetch (callback)',
      config: { datasourceName: 'empty-callback' },
      it: shouldNotFetch
    }, {
      title: 'should not fetch (rxjs of)',
      config: { datasourceName: 'empty-of' },
      it: shouldNotFetch
    }
  ].forEach(c => makeTest<void, false>(c)));

});
