import { Direction } from '../src/component/interfaces';
import { makeTest, MakeTestConfig, TestBedConfig, OperationConfig } from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';

enum Operation {
  eof = 'eof',
  bof = 'bof'
}
const min = 1, max = 100, scrollCount = 10;

describe('EOF/BOF Spec', () => {

  const config: OperationConfig<Operation> = {
    [Operation.bof]: {
      datasourceName: 'limited',
      datasourceSettings: { startIndex: min, bufferSize: 10, padding: 0.5, adapter: true },
      templateSettings: { viewportHeight: 200 }
    },
    [Operation.eof]: {
      datasourceName: 'limited',
      datasourceSettings: { startIndex: max - 10 + 1, bufferSize: 10, padding: 0.5, adapter: true },
      templateSettings: { viewportHeight: 200 }
    }
  };

  const emptyConfig: TestBedConfig = {
    ...config[Operation.bof],
    datasourceName: 'empty-callback',
    datasourceSettings: {
      ...config[Operation.bof].datasourceSettings
    }
  };

  const observableCountConfig: TestBedConfig = {
    ...config[Operation.bof],
    datasourceSettings: {
      ...config[Operation.bof].datasourceSettings,
      minIndex: min,
      maxIndex: max
    }
  };

  const initializeBofEofContainer = (misc: Misc) => {
    const { adapter } = misc.datasource;
    misc.shared.bofEofContainer = {
      bof: { count: 0, value: adapter.bof },
      eof: { count: 0, value: adapter.eof }
    };
    const { bof, eof } = misc.shared.bofEofContainer;
    bof.subscription = adapter.bof$.subscribe(value => {
      bof.count++;
      bof.value = value;
    });
    eof.subscription = adapter.eof$.subscribe(value => {
      eof.count++;
      eof.value = value;
    });
  };

  const disposeBofEofContainer = (misc: Misc) => {
    const { bof, eof } = misc.shared.bofEofContainer;
    eof.subscription.unsubscribe();
    bof.subscription.unsubscribe();
  };

  const expectLimit = (misc: Misc, direction: Direction, noscroll = false) => {
    const _forward = direction === Direction.forward;
    const elements = misc.getElements();
    expect(elements.length).toBeGreaterThan(config[_forward ? 'eof' : 'bof'].datasourceSettings.bufferSize);
    expect(misc.padding[_forward ? Direction.forward : Direction.backward].getSize()).toEqual(0);
    if (!noscroll) {
      expect(misc.padding[_forward ? Direction.backward : Direction.forward].getSize()).toBeGreaterThan(0);
    }
    expect(misc.checkElementId(elements[_forward ? elements.length - 1 : 0], _forward ? max : min)).toEqual(true);

    const { datasource: { adapter }, buffer: { eof, bof } } = misc.scroller;
    expect(bof).toEqual(!_forward);
    expect(bof).toEqual(adapter.bof);
    expect(bof).toEqual(misc.shared.bofEofContainer.bof.value);
    expect(eof).toEqual(adapter.eof);
    expect(eof).toEqual(_forward);
    expect(eof).toEqual(misc.shared.bofEofContainer.eof.value);
  };

  const _makeTest = (data: MakeTestConfig) => makeTest({
    ...data,
    before: (misc: Misc) => initializeBofEofContainer(misc),
    after: (misc: Misc) => disposeBofEofContainer(misc)
  });

  const runLimitSuite = (operation = Operation.bof) => {

    const isEOF = operation === Operation.eof;

    describe((isEOF ? 'End' : 'Begin') + ' of file', () => {

      const _operation = isEOF ? Operation.bof : Operation.eof;
      const direction = isEOF ? Direction.forward : Direction.backward;
      const directionOpposite = isEOF ? Direction.backward : Direction.forward;
      const doScroll = (misc: Misc) => isEOF ? misc.scrollMin() : misc.scrollMax();
      const doScrollOpposite = (misc: Misc) => isEOF ? misc.scrollMax() : misc.scrollMin();

      _makeTest({
        config: config[operation],
        title: `should get ${operation} on init`,
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() => {
            expectLimit(misc, direction, true);
            done();
          })
      });

      _makeTest({
        config: config[operation],
        title: `should reset ${operation} after scroll`,
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() => {
            const { buffer, datasource: { adapter } } = misc.scroller;
            const { bofEofContainer } = misc.shared;
            if (misc.workflow.cyclesDone === 1) {
              expect(buffer[operation]).toEqual(true);
              expect(adapter[operation]).toEqual(true);
              expect(bofEofContainer[operation].value).toEqual(true);
              doScroll(misc);
            } else {
              expect(buffer[operation]).toEqual(false);
              expect(adapter[operation]).toEqual(false);
              expect(bofEofContainer[operation].value).toEqual(false);
              expect(buffer[_operation]).toEqual(false);
              expect(adapter[_operation]).toEqual(false);
              expect(bofEofContainer[_operation].value).toEqual(false);
              done();
            }
          })
      });

      _makeTest({
        config: config[operation],
        title: `should stop when ${operation} is reached again`,
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() => {
            if (misc.workflow.cyclesDone === 1) {
              doScroll(misc);
            } else if (misc.workflow.cyclesDone === 2) {
              doScrollOpposite(misc);
            } else {
              expectLimit(misc, direction);
              done();
            }
          })
      });

      _makeTest({
        config: config[operation],
        title: `should reach ${_operation} after some scrolls`,
        it: (misc: Misc) => (done: Function) =>
          spyOn(misc.workflow, 'finalize').and.callFake(() => {
            if (misc.workflow.cyclesDone < scrollCount) {
              doScroll(misc);
            } else {
              expectLimit(misc, directionOpposite);
              done();
            }
          })
      });
    });
  };

  runLimitSuite(Operation.bof);
  runLimitSuite(Operation.eof);

  _makeTest({
    config: emptyConfig,
    title: `should reach both bof and eof during the first WF cycle`,
    it: (misc: Misc) => (done: Function) =>
      spyOn(misc.workflow, 'finalize').and.callFake(() => {
        const { bof, eof } = misc.shared.bofEofContainer;
        expect(bof.count).toEqual(1);
        expect(eof.count).toEqual(1);
        expect(bof.value).toEqual(true);
        expect(eof.value).toEqual(true);
        done();
      })
  });

  _makeTest({
    config: observableCountConfig,
    title: `should reach bof/eof multiple times`,
    it: (misc: Misc) => (done: Function) =>
      spyOn(misc.workflow, 'finalize').and.callFake(() => {
        const COUNT = 10;
        const { cyclesDone } = misc.workflow;
        if (cyclesDone === 1) {
          misc.scrollMax();
        } else if (cyclesDone > 1 && cyclesDone < COUNT) {
          if (cyclesDone % 2 === 0) {
            misc.scrollMin();
          } else {
            misc.scrollMax();
          }
        } else {
          const { bof, eof } = misc.shared.bofEofContainer;
          expect(bof.count).toEqual(COUNT);
          expect(eof.count).toEqual(COUNT - 1);
          done();
        }
      })
  });

});
