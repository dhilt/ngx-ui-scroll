import { Direction } from '../src/component/interfaces';
import { makeTest } from './scaffolding/runner';

const min = 1, max = 100;

describe('EOF/BOF Spec', () => {

  const config = {
    datasourceName: 'limited',
    datasourceSettings: { startIndex: 1, bufferSize: 10, padding: 0.5 },
    templateSettings: { viewportHeight: 200 }
  };

  const expectLimit = (misc, direction: Direction) => {
    const _forward = direction === Direction.forward;
    const elements = misc.getElements();
    expect(elements.length).toBeGreaterThan(config.datasourceSettings.bufferSize); // more than 1 pack
    expect(misc.padding[_forward ? Direction.forward : Direction.backward].getSize()).toEqual(0);
    expect(misc.padding[_forward ? Direction.backward : Direction.forward].getSize()).toBeGreaterThan(0);
    expect(misc.checkElementId(elements[_forward ? elements.length - 1 : 0], _forward ? max : min)).toEqual(true);
    expect(misc.workflow.buffer.bof).toEqual(!_forward);
    expect(misc.workflow.buffer.eof).toEqual(_forward);
  };

  describe('Begin of file', () => {
    makeTest({
      config: { ...config, datasourceSettings: { ...config.datasourceSettings, startIndex: 1 } },
      title: 'should get bof on init',
      it: (misc) => (done) => {
        expectLimit(misc, Direction.backward);
        done();
      }
    });

    makeTest({
      config: { ...config, datasourceSettings: { ...config.datasourceSettings, startIndex: 1 } },
      title: 'should reset bof after fwd scroll',
      it: (misc) => (done) => {
        expect(misc.workflow.buffer.bof).toEqual(true);
        spyOn(misc.workflowRunner, 'finalize').and.callFake(() => {
          expect(misc.workflow.buffer.bof).toEqual(false);
          expect(misc.workflow.buffer.eof).toEqual(false);
          done();
        });
        misc.scrollMax();
      }
    });

    makeTest({
      config: { ...config, datasourceSettings: { ...config.datasourceSettings, startIndex: 1 } },
      title: 'should stop when bof is reached again',
      it: (misc) => (done) => {
        const count = misc.workflowRunner.count;
        spyOn(misc.workflowRunner, 'finalize').and.callFake(() => {
          if (misc.workflowRunner.count === count + 1) {
            misc.scrollMin();
          } else {
            expectLimit(misc, Direction.backward);
            done();
          }
        });
        misc.scrollMax();
      }
    });
  });

  describe('End of file', () => {
    makeTest({
      config: { ...config, datasourceSettings: { ...config.datasourceSettings, startIndex: 91 } },
      title: 'should get eof on init',
      it: (misc) => (done) => {
        expectLimit(misc, Direction.forward);
        done();
      }
    });

    makeTest({
      config: { ...config, datasourceSettings: { ...config.datasourceSettings, startIndex: 91 } },
      title: 'should reset bof after bwd scroll',
      it: (misc) => (done) => {
        expect(misc.workflow.buffer.eof).toEqual(true);
        spyOn(misc.workflowRunner, 'finalize').and.callFake(() => {
          expect(misc.workflow.buffer.bof).toEqual(false);
          expect(misc.workflow.buffer.eof).toEqual(false);
          done();
        });
        misc.scrollMin();
      }
    });

    makeTest({
      config: { ...config, datasourceSettings: { ...config.datasourceSettings, startIndex: 91 } },
      title: 'should stop when eof is reached again',
      it: (misc) => (done) => {
        const count = misc.workflowRunner.count;
        spyOn(misc.workflowRunner, 'finalize').and.callFake(() => {
          if (misc.workflowRunner.count === count + 1) {
            misc.scrollMax();
          } else {
            expectLimit(misc, Direction.forward);
            done();
          }
        });
        misc.scrollMin();
      }
    });
  });

});
