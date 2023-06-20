import { Direction } from './miscellaneous/vscroll';

import {
  makeTest,
  MakeTestConfig,
  TestBedConfig,
  OperationConfig
} from './scaffolding/runner';
import { Misc } from './miscellaneous/misc';
import { Subscription } from 'rxjs';

enum Operation {
  eof = 'eof',
  bof = 'bof'
}
const min = 1,
  max = 100,
  scrollCount = 10;

describe('EOF/BOF Spec', () => {
  const config: OperationConfig<Operation> = {
    [Operation.bof]: {
      datasourceName: 'limited',
      datasourceSettings: {
        startIndex: min,
        bufferSize: 10,
        padding: 0.5,
        adapter: true
      },
      templateSettings: { viewportHeight: 200 }
    },
    [Operation.eof]: {
      datasourceName: 'limited',
      datasourceSettings: {
        startIndex: max - 10 + 1,
        bufferSize: 10,
        padding: 0.5,
        adapter: true
      },
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

  interface BEContainer {
    count: number;
    value: boolean;
    subscription: Subscription;
  }

  interface BofEofContainer {
    eof: BEContainer;
    bof: BEContainer;
  }

  const initializeBofEofContainer = (misc: Misc) => {
    const { adapter, shared } = misc;
    const bof: BEContainer = {
      count: 0,
      value: adapter.bof,
      subscription: adapter.bof$.subscribe(value => {
        bof.count++;
        bof.value = value;
      })
    };
    const eof: BEContainer = {
      count: 0,
      value: adapter.eof,
      subscription: adapter.eof$.subscribe(value => {
        eof.count++;
        eof.value = value;
      })
    };
    shared.bofEofContainer = { bof, eof } as BofEofContainer;
  };

  const disposeBofEofContainer = (misc: Misc) => {
    const { bof, eof } = misc.shared.bofEofContainer as BofEofContainer;
    eof.subscription.unsubscribe();
    bof.subscription.unsubscribe();
  };

  const expectLimit = (misc: Misc, direction: Direction, noscroll = false) => {
    const _forward = direction === Direction.forward;
    const elements = misc.getElements();
    const length = config[_forward ? Operation.eof : Operation.bof]
      .datasourceSettings.bufferSize as number;
    expect(elements.length).toBeGreaterThan(length);
    expect(
      misc.padding[_forward ? Direction.forward : Direction.backward].getSize()
    ).toEqual(0);
    if (!noscroll) {
      expect(
        misc.padding[
          _forward ? Direction.backward : Direction.forward
        ].getSize()
      ).toBeGreaterThan(0);
    }
    expect(
      misc.checkElementId(
        elements[_forward ? elements.length - 1 : 0],
        _forward ? max : min
      )
    ).toEqual(true);

    const {
      adapter,
      scroller: {
        buffer: { eof, bof }
      },
      shared
    } = misc;
    expect(bof.get()).toEqual(!_forward);
    expect(bof.get()).toEqual(adapter.bof);
    expect(bof.get()).toEqual(
      (shared.bofEofContainer as BofEofContainer).bof.value
    );
    expect(eof.get()).toEqual(adapter.eof);
    expect(eof.get()).toEqual(_forward);
    expect(eof.get()).toEqual(
      (shared.bofEofContainer as BofEofContainer).eof.value
    );
  };

  const _makeTest = (data: MakeTestConfig) =>
    makeTest({
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
      const doScroll = (misc: Misc) =>
        isEOF ? misc.scrollMin() : misc.scrollMax();
      const doScrollOpposite = (misc: Misc) =>
        isEOF ? misc.scrollMax() : misc.scrollMin();

      _makeTest({
        config: config[operation],
        title: `should get ${operation} on init`,
        it: misc => done =>
          spyOn(misc.workflow, 'finalize').and.callFake(() => {
            expectLimit(misc, direction, true);
            done();
          })
      });

      _makeTest({
        config: config[operation],
        title: `should reset ${operation} after scroll`,
        it: misc => done =>
          spyOn(misc.workflow, 'finalize').and.callFake(() => {
            const {
              scroller: { buffer },
              adapter
            } = misc;
            const bofEofContainer = misc.shared
              .bofEofContainer as BofEofContainer;
            if (misc.workflow.cyclesDone === 1) {
              expect(buffer[operation].get()).toEqual(true);
              expect(adapter[operation]).toEqual(true);
              expect(bofEofContainer[operation].value).toEqual(true);
              doScroll(misc);
            } else {
              expect(buffer[operation].get()).toEqual(false);
              expect(adapter[operation]).toEqual(false);
              expect(bofEofContainer[operation].value).toEqual(false);
              expect(buffer[_operation].get()).toEqual(false);
              expect(adapter[_operation]).toEqual(false);
              expect(bofEofContainer[_operation].value).toEqual(false);
              done();
            }
          })
      });

      _makeTest({
        config: config[operation],
        title: `should stop when ${operation} is reached again`,
        it: misc => done =>
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
        it: misc => done =>
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
    title: 'should reach both bof and eof during the first WF cycle',
    it: misc => done =>
      spyOn(misc.workflow, 'finalize').and.callFake(() => {
        const { bof, eof } = misc.shared.bofEofContainer as BofEofContainer;
        expect(bof.count).toEqual(1);
        expect(eof.count).toEqual(1);
        expect(bof.value).toEqual(true);
        expect(eof.value).toEqual(true);
        done();
      })
  });

  _makeTest({
    config: observableCountConfig,
    title: 'should reach bof/eof multiple times',
    it: misc => done =>
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
          const { bof, eof } = misc.shared.bofEofContainer as BofEofContainer;
          expect(bof.count).toEqual(COUNT);
          expect(eof.count).toEqual(COUNT - 1);
          done();
        }
      })
  });
});
