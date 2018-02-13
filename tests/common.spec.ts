import { async } from '@angular/core/testing';

import { Direction } from '../src/component/interfaces/direction';
import { defaultSettings } from '../src/component/classes/settings';

import { configureTestBed } from './scaffolding/testBed';
import { defaultDatasourceClass } from './scaffolding/datasources';
import { defaultTemplate } from './scaffolding/templates';
import { Misc } from './miscellaneous/misc';
import { Settings } from '../src/component/interfaces/settings';
import { makeTest } from './scaffolding/runner';


describe('Common spec', () => {
  let misc: Misc;

  describe('Initialization', () => {

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
    const _settings3 = { startIndex: 99, bufferSize: 11 };

    const checkSettings = (_settings) => (misc) => (done) => {
      const mergedSettings = { ...defaultSettings, ..._settings };
      Object.keys(defaultSettings).forEach(key => {
        expect(misc.workflow.settings[key]).toEqual(mergedSettings[key]);
      });
      done();
    };

    makeTest({
      title: 'should override startIndex',
      config: { datasourceSettings: _settings1 },
      it: checkSettings(_settings1)
    });

    makeTest({
      title: 'should override bufferSize',
      config: { datasourceSettings: _settings2 },
      it: checkSettings(_settings2)
    });

    makeTest({
      title: 'should override startIndex and bufferSize',
      config: { datasourceSettings: _settings3 },
      it: checkSettings(_settings3)
    });
  });


  /*  it('should simulate scroll to top, and contain items with id from ??? up to ???', fakeAsync(() => {
   const uiScroll = misc.elementByAttr('ui-scroll').parent;
   const eventListener = uiScroll.listeners.find(e => e.name === 'scroll');
   uiScroll.nativeElement.scrollTop = 0;
   eventListener.callback('top');

   // fixture.whenStable().then(() => {
   //   fixture.detectChanges();
   //   tick(25);
   //   fixture.detectChanges();
   //
   //   const firstId = 81;
   //   const lastId = 95;
   //   for (let id = firstId; id <= lastId; id++) {
   //     const elem = elementByAttr(`[id="i-0-${id}"]`);
   //     expect(elem.name).toEqual('div');
   //     expect(elem.nativeElement.textContent).toMatch(`${id} : item #${id}`);
   //     expect(elem.childNodes[1].styles.position).toBeNull();
   //     expect(elem.childNodes[1].styles.left).toBeNull();
   //   }
   //
   //   expect(elementByAttr('[data-padding-backward]').nativeElement.style.height).toEqual('0px');
   //   expect(elementByAttr('[data-padding-forward]').nativeElement.style.height).toEqual('72px');
   //   expect(elementByAttr(`[id="i-0-${firstId - 1}"]`)).toBeNull();
   //   expect(elementByAttr(`[id="i-0-${lastId + 1}"]`)).toBeNull();
   // });
   }));

   it('should simulate scroll to bottom, and contain items with id from ??? up to ???', fakeAsync(() => {
   const uiScroll = misc.elementByAttr('ui-scroll').parent;
   const eventListener = uiScroll.listeners.find(e => e.name === 'scroll');
   uiScroll.nativeElement.scrollTop = uiScroll.nativeElement.scrollHeight - uiScroll.nativeElement.clientHeight;
   eventListener.callback('bottom');

   // fixture.whenStable().then(() => {
   //   fixture.detectChanges();
   //   tick();
   //   fixture.detectChanges();
   //
   //   const firstId = 90;
   //   const lastId = 104;
   //   for (let id = firstId; id <= lastId; id++) {
   //     const elem = elementByAttr(`[id="i-0-${id}"]`);
   //     expect(elem.name).toEqual('div');
   //     expect(elem.nativeElement.textContent).toMatch(`${id} : item #${id}`);
   //     expect(elem.childNodes[1].styles.position).toBeNull();
   //     expect(elem.childNodes[1].styles.left).toBeNull();
   //   }
   //   expect(elementByAttr('[data-padding-backward]').nativeElement.style.height).toEqual('90px');
   //   expect(elementByAttr('[data-padding-forward]').nativeElement.style.height).toEqual('0px');
   //   expect(elementByAttr(`[id="i-0-${firstId - 1}"]`)).toBeNull();
   //   expect(elementByAttr(`[id="i-0-${lastId + 1}"]`)).toBeNull();
   // });
   }));*/
});
