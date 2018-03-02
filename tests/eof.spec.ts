import { Direction } from '../src/component/interfaces';
import { makeTest } from './scaffolding/runner';

const min = 1, max = 100;

describe('EOF/BOF Spec', () => {

  describe('Begin of file', () => {

    const config = {
      datasourceName: 'limited',
      datasourceSettings: { startIndex: 1, bufferSize: 10, padding: 0.5 },
      templateSettings: { viewportHeight: 200 }
    };

    makeTest({
      config: { ...config, datasourceSettings: { ...config.datasourceSettings, startIndex: 1 } },
      title: 'should stop when bof',
      it: (misc) => (done) => {
        const elements = misc.getElements();
        expect(elements.length).toBeGreaterThan(config.datasourceSettings.bufferSize); // more than 1 pack
        expect(misc.padding[Direction.backward].getSize()).toEqual(0);
        expect(misc.padding[Direction.forward].getSize()).toBeGreaterThan(0);
        expect(misc.checkElementId(elements[0], min)).toEqual(true);
        done();
      }
    });

    makeTest({
      config: { ...config, datasourceSettings: { ...config.datasourceSettings, startIndex: 91 } },
      title: 'should stop when eof',
      it: (misc) => (done) => {
        const elements = misc.getElements();
        expect(elements.length).toBeGreaterThan(config.datasourceSettings.bufferSize); // more than 1 pack
        expect(misc.padding[Direction.backward].getSize()).toBeGreaterThan(0);
        expect(misc.padding[Direction.forward].getSize()).toEqual(0);
        expect(misc.checkElementId(elements[elements.length - 1], max)).toEqual(true);
        done();
      }
    });

  });

});
