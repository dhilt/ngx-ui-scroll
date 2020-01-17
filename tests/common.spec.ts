import { async } from '@angular/core/testing';

import { Settings, Direction } from '../src/component/interfaces';
import { defaultSettings, minSettings } from '../src/component/classes/settings';
import { InputValue, validate } from '../src/component/utils/validation';

import { configureTestBed } from './scaffolding/testBed';
import { defaultDatasourceClass } from './scaffolding/datasources';
import { defaultTemplate } from './scaffolding/templates';
import { Misc } from './miscellaneous/misc';
import { makeTest } from './scaffolding/runner';

describe('Common Spec', () => {

  describe('Initialization', () => {

    let misc: Misc;
    let reconfigure = true;

    beforeEach(async(() => {
      if (!reconfigure) {
        return;
      }
      reconfigure = false;
      const fixture = configureTestBed(defaultDatasourceClass, defaultTemplate);
      misc = new Misc(fixture);
    }));

    it('should init test component', () => {
      expect(misc.testComponent).toBeTruthy();
    });

    it('should provide datasource', () => {
      expect(misc.datasource).toEqual(jasmine.any(Object));
      expect(misc.datasource.get).toEqual(jasmine.any(Function));
    });

    it('should init ui-scroll', () => {
      expect(misc.uiScrollElement).toBeTruthy();
      expect(misc.uiScrollComponent).toBeTruthy();
    });

    it('should init padding elements', () => {
      expect(misc.padding[Direction.backward].element).toBeTruthy();
      expect(misc.padding[Direction.forward].element).toBeTruthy();
    });

  });

  describe('Settings', () => {

    const _settings1 = { startIndex: 90 };
    const _settings2 = { bufferSize: 15 };
    const _settings3 = { infinite: true };
    const _settings4 = { startIndex: 99, bufferSize: 11, infinite: true };

    const checkSettings = (_settings: any) => (misc: Misc) => (done: Function) => {
      expect(misc.scroller.settings).toEqual(jasmine.any(Object));
      const mergedSettings = { ...defaultSettings, ..._settings };
      Object.keys(defaultSettings).forEach(key => {
        expect((<any>misc.scroller.settings)[key]).toEqual((<any>mergedSettings)[key]);
      });
      done();
    };

    makeTest({
      config: { datasourceSettings: _settings1 },
      title: 'should override startIndex',
      it: checkSettings(_settings1)
    });

    makeTest({
      config: { datasourceSettings: _settings2 },
      title: 'should override bufferSize',
      it: checkSettings(_settings2)
    });

    makeTest({
      config: { datasourceSettings: _settings3 },
      title: 'should override infinite',
      it: checkSettings(_settings3)
    });

    makeTest({
      config: { datasourceSettings: _settings4 },
      title: 'should override startIndex, bufferSize, infinite',
      it: checkSettings(_settings4)
    });

    makeTest({
      config: { datasourceName: 'default-bad-settings' },
      title: 'should fallback to the defaults',
      it: checkSettings({})
    });

    makeTest({
      config: { datasourceSettings: { startIndex: false } },
      title: 'should fallback startIndex to the default',
      it: (misc: Misc) => (done: Function) => {
        expect(misc.scroller.settings.startIndex).toEqual(defaultSettings.startIndex);
        done();
      }
    });

    makeTest({
      config: { datasourceSettings: { bufferSize: { weird: true } } },
      title: 'should fallback bufferSize to the default',
      it: (misc: Misc) => (done: Function) => {
        expect(misc.scroller.settings.bufferSize).toEqual(defaultSettings.bufferSize);
        done();
      }
    });

    makeTest({
      config: { datasourceSettings: { bufferSize: 5.5 } },
      title: 'should fallback bufferSize to the default',
      it: (misc: Misc) => (done: Function) => {
        expect(misc.scroller.settings.bufferSize).toEqual(defaultSettings.bufferSize);
        done();
      }
    });

    makeTest({
      config: { datasourceSettings: { bufferSize: -1 } },
      title: 'should fallback bufferSize to the minimum',
      it: (misc: Misc) => (done: Function) => {
        expect(misc.scroller.settings.bufferSize).toEqual(minSettings.bufferSize);
        done();
      }
    });

    makeTest({
      config: { datasourceSettings: { padding: 'something' } },
      title: 'should fallback padding to the default',
      it: (misc: Misc) => (done: Function) => {
        expect(misc.scroller.settings.padding).toEqual(defaultSettings.padding);
        done();
      }
    });

    makeTest({
      config: { datasourceSettings: { padding: -0.1 } },
      title: 'should fallback padding to the minimum',
      it: (misc: Misc) => (done: Function) => {
        expect(misc.scroller.settings.padding).toEqual(minSettings.padding);
        done();
      }
    });

    makeTest({
      config: { datasourceSettings: { infinite: 'something' } },
      title: 'should fallback infinite to the default',
      it: (misc: Misc) => (done: Function) => {
        expect(misc.scroller.settings.infinite).toEqual(defaultSettings.infinite);
        done();
      }
    });

    makeTest({
      config: { datasourceSettings: { horizontal: null } },
      title: 'should fallback horizontal to the default',
      it: (misc: Misc) => (done: Function) => {
        expect(misc.scroller.settings.horizontal).toEqual(defaultSettings.horizontal);
        done();
      }
    });

  });

});

describe('Bad datasource', () => {

  makeTest({
    config: {
      datasourceClass: 'invalid',
      toThrow: true
    },
    title: 'should throw exception (datasource is not a constructor)',
    it: (error: any) => (done: Function) => {
      expect(error).toBe('datasource is not a constructor');
      done();
    }
  });

  makeTest({
    config: {
      datasourceClass: class {
        settings: Settings;

        constructor() {
          this.settings = {};
        }
      },
      toThrow: true
    },
    title: 'should throw exception (no get)',
    it: (error: any) => (done: Function) => {
      expect(error).toBe('Datasource get method is not implemented');
      done();
    }
  });

  makeTest({
    config: {
      datasourceClass: class {
        settings: Settings;
        get: boolean;

        constructor() {
          this.settings = {};
          this.get = true;
        }
      },
      toThrow: true
    },
    title: 'should throw exception (get is not a function)',
    it: (error: any) => (done: Function) => {
      expect(error).toBe('Datasource get is not a function');
      done();
    }
  });

  makeTest({
    config: {
      datasourceClass: class {
        settings: Settings;

        constructor() {
          this.settings = {};
        }

        get(offset: number) {
          return ++offset;
        }
      },
      toThrow: true
    },
    title: 'should throw exception (get has less than 2 arguments)',
    it: (error: any) => (done: Function) => {
      expect(error).toBe('Datasource get method invalid signature');
      done();
    }
  });

});


describe('Input Params Validation', () => {
  describe('[Integer]', () => {

    const integerPassInputs = [
      { value: 23, parsed: 23 },
      { value: '23', parsed: 23 },
      { value: 0, parsed: 0 },
      { value: '0', parsed: 0 },
      { value: '-23', parsed: -23 },
      { value: -23, parsed: -23 },
      { value: '1e1', parsed: 10 },
      { value: 1e1, parsed: 10 },
      { value: 1.1e1, parsed: 11 },
    ];

    const integerBlockInputs = [
      { value: NaN, parsed: NaN },
      { value: '', parsed: NaN },
      { value: '-', parsed: NaN },
      { value: 'no', parsed: NaN },
      { value: '23no', parsed: NaN },
      { value: 23.78, parsed: 23 },
      { value: '23.78', parsed: 23 },
      { value: 1.11e1, parsed: 11 },
    ];

    it('should pass limited integer', (done: Function) => {
      integerPassInputs.forEach(input => {
        const parsed = validate(input.value, InputValue.integer);
        expect(parsed.value).toEqual(input.parsed);
        expect(parsed.isValid).toEqual(true);
      });
      done();
    });

    it('should block non limited integer', (done: Function) => {
      const inputs = [
        ...integerBlockInputs,
        { value: Infinity, parsed: NaN },
        { value: -Infinity, parsed: NaN },
        { value: 'Infinity', parsed: NaN },
        { value: '-Infinity', parsed: NaN },
      ];
      inputs.forEach(input => {
        const parsed = validate(input.value, InputValue.integer);
        expect(parsed).toEqual({
          value: input.parsed,
          type: InputValue.integer,
          isValid: false,
          error: 'it must be an integer'
        });
      });
      done();
    });

    it('should pass unlimited integer', (done: Function) => {
      const inputs = [
        ...integerPassInputs,
        { value: Infinity, parsed: Infinity },
        { value: -Infinity, parsed: -Infinity },
        { value: 'Infinity', parsed: Infinity },
        { value: '-Infinity', parsed: -Infinity },
      ];
      inputs.forEach(input => {
        const parsed = validate(input.value, InputValue.integerUnlimited);
        expect(parsed.value).toEqual(input.parsed);
        expect(parsed.isValid).toEqual(true);
      });
      done();
    });

    it('should block non unlimited integer', (done: Function) => {
      integerBlockInputs.forEach(input => {
        const parsed = validate(input.value, InputValue.integerUnlimited);
        expect(parsed).toEqual({
          value: input.parsed,
          type: InputValue.integerUnlimited,
          isValid: false,
          error: 'it must be an integer or +/- Infinity'
        });
      });
      done();
    });

  });
});
