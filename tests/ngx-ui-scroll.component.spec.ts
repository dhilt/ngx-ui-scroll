import { TestBed, ComponentFixture, ComponentFixtureAutoDetect, inject, async } from '@angular/core/testing';
import { ChangeDetectorRef, ElementRef, ViewContainerRef, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { UiScrollModule } from '../src/module/ui-scroll.module';
import { TestedComponent } from './testedComponent';

describe('An UiScroll directive', () => {
  let component: TestedComponent;
  // let nativeComponent;
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
    component = fixture.componentInstance;  // access properties and methods
    // nativeComponent = fixture.nativeElement;  // access DOM
  }));

  it('should have an instance', () => {
    expect(component).toBeDefined();
    expect(component.datasource).toEqual(jasmine.any(Object));
    expect(component.datasource.get).toEqual(jasmine.any(Function));
  });

  const getElemByAttr = (attr) => fixture.debugElement.query(By.css(attr));

  it('should correctly be called html-tag with directive', () => {
    expect(getElemByAttr('app-ui-scroll')).toBeDefined();  // should be renamed into ui-scroll
  });

  it('should create tags: data-padding-top and data-padding-bottom', () => {
    expect(getElemByAttr('[data-padding-top]')).toBeDefined();
    expect(getElemByAttr('[data-padding-bottom]')).toBeDefined();

    // expect(getElemByAttr('[data-padding-top]').nativeElement.style.height).toEqual('36px');
    expect(getElemByAttr('[data-padding-bottom]').nativeElement.style.height).toEqual('0px');
  });

  it('should contain only items with id from 86 up to 99', () => {
    const firstId = 86;
    const lastId = 99;
    for (let id = firstId; id <= lastId; id++) {
      const elem = getElemByAttr(`[id="i-0-${id}"]`);
      expect(elem.name).toEqual('div');
      expect(elem.nativeElement.textContent).toMatch(`${id} : item #${id}`);
      expect(elem.childNodes[1].styles.position).toBeNull();
      expect(elem.childNodes[1].styles.left).toBeNull();
    }

    expect(getElemByAttr(`[id="i-0-${firstId - 1}"]`)).toBeNull();
    /* This comparison in case of unsuccessful outcome leads to a hangup. */
    // expect(getElemByAttr(`[id="i-0-${lastId + 1}"]`)).toBeNull();
  });
});
