import { Direction } from '../src/component/interfaces';
import { makeTest } from './scaffolding/runner';

const min = 1, max = 100;

describe('EOF/BOF Spec', () => {

  const config = {
    datasourceName: 'limited',
    datasourceSettings: { startIndex: 1, bufferSize: 10, padding: 0.5 },
    templateSettings: { viewportHeight: 200 }
  };

  describe('Begin of file', () => {
    makeTest({
      config: { ...config, datasourceSettings: { ...config.datasourceSettings, startIndex: 1 } },
      title: 'should stop when bof',
      it: (misc) => (done) => {
        const elements = misc.getElements();
        expect(elements.length).toBeGreaterThan(config.datasourceSettings.bufferSize); // more than 1 pack
        expect(misc.padding[Direction.backward].getSize()).toEqual(0);
        expect(misc.padding[Direction.forward].getSize()).toBeGreaterThan(0);
        expect(misc.checkElementId(elements[0], min)).toEqual(true);
        expect(misc.workflow.buffer.bof).toEqual(true);
        expect(misc.workflow.buffer.eof).toEqual(false);
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
  });

  describe('End of file', () => {
    makeTest({
      config: { ...config, datasourceSettings: { ...config.datasourceSettings, startIndex: 91 } },
      title: 'should stop when eof',
      it: (misc) => (done) => {
        const elements = misc.getElements();
        expect(elements.length).toBeGreaterThan(config.datasourceSettings.bufferSize); // more than 1 pack
        expect(misc.padding[Direction.backward].getSize()).toBeGreaterThan(0);
        expect(misc.padding[Direction.forward].getSize()).toEqual(0);
        expect(misc.checkElementId(elements[elements.length - 1], max)).toEqual(true);
        expect(misc.workflow.buffer.bof).toEqual(false);
        expect(misc.workflow.buffer.eof).toEqual(true);
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
  });

});
