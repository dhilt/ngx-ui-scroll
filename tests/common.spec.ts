import { TestBed, ComponentFixture, ComponentFixtureAutoDetect, async, tick, fakeAsync } from '@angular/core/testing';
// import { ChangeDetectorRef, ElementRef, ViewContainerRef, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { UiScrollModule } from '../src/ui-scroll.module';
import { TestedComponent } from './helpers/testedComponent';

describe('Common tests', () => {
  let component: TestedComponent;
  let fixture: ComponentFixture <TestedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UiScrollModule],
      declarations: [TestedComponent],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true }
      ]
    });
    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
  }));

  it('should have an instance', () => {
    expect(component).not.toBeNull();
    expect(component.datasource).toEqual(jasmine.any(Object));
    expect(component.datasource.get).toEqual(jasmine.any(Function));
  });

  const getElemByAttr = (attr) => fixture.debugElement.query(By.css(attr));

  it('should correctly be called html-tag with directive', () => {
    expect(getElemByAttr('ui-scroll')).not.toBeNull();
  });

  it('should create tags: data-padding-backward and data-padding-forward', () => {
    expect(getElemByAttr('[data-padding-backward]')).not.toBeNull();
    expect(getElemByAttr('[data-padding-forward]')).not.toBeNull();

    expect(getElemByAttr('[data-padding-backward]').nativeElement.style.height).toEqual('0px');
    expect(getElemByAttr('[data-padding-forward]').nativeElement.style.height).toEqual('0px');
  });

  it('should contain only items with id from -4 up to 10', async(() => {
    const firstId = -4;
    const lastId = 10;
    for (let id = firstId; id <= lastId; id++) {
      const elem = getElemByAttr(`[id="ui-scroll-0-${id}"]`);
      expect(elem.name).toEqual('div');
      expect(elem.nativeElement.textContent).toMatch(`${id} : item #${id}`);
      // expect(elem.childNodes[1].styles.position).toBeNull();
      // expect(elem.childNodes[1].styles.left).toBeNull();
    }

    expect(getElemByAttr(`[id="i-0-${firstId - 1}"]`)).toBeNull();
    expect(getElemByAttr(`[id="i-0-${lastId + 1}"]`)).toBeNull();
  }));

  it('should simulate scroll to top, and contain items with id from ??? up to ???', fakeAsync(() => {
    const uiScroll = getElemByAttr('ui-scroll').parent;
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
    //     const elem = getElemByAttr(`[id="i-0-${id}"]`);
    //     expect(elem.name).toEqual('div');
    //     expect(elem.nativeElement.textContent).toMatch(`${id} : item #${id}`);
    //     expect(elem.childNodes[1].styles.position).toBeNull();
    //     expect(elem.childNodes[1].styles.left).toBeNull();
    //   }
    //
    //   expect(getElemByAttr('[data-padding-backward]').nativeElement.style.height).toEqual('0px');
    //   expect(getElemByAttr('[data-padding-forward]').nativeElement.style.height).toEqual('72px');
    //   expect(getElemByAttr(`[id="i-0-${firstId - 1}"]`)).toBeNull();
    //   expect(getElemByAttr(`[id="i-0-${lastId + 1}"]`)).toBeNull();
    // });
  }));

  it('should simulate scroll to bottom, and contain items with id from ??? up to ???', fakeAsync(() => {
    const uiScroll = getElemByAttr('ui-scroll').parent;
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
    //     const elem = getElemByAttr(`[id="i-0-${id}"]`);
    //     expect(elem.name).toEqual('div');
    //     expect(elem.nativeElement.textContent).toMatch(`${id} : item #${id}`);
    //     expect(elem.childNodes[1].styles.position).toBeNull();
    //     expect(elem.childNodes[1].styles.left).toBeNull();
    //   }
    //   expect(getElemByAttr('[data-padding-backward]').nativeElement.style.height).toEqual('90px');
    //   expect(getElemByAttr('[data-padding-forward]').nativeElement.style.height).toEqual('0px');
    //   expect(getElemByAttr(`[id="i-0-${firstId - 1}"]`)).toBeNull();
    //   expect(getElemByAttr(`[id="i-0-${lastId + 1}"]`)).toBeNull();
    // });
  }));
});
