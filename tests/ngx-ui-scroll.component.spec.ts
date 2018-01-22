import { ChangeDetectorRef, ElementRef, ViewContainerRef, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture, inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { UiScrollModule } from '../src/module/ui-scroll.module';
import { TestedComponent } from './testedComponent';

describe('An UiScroll directive', () => {
  let component: TestedComponent;
  let fixture: ComponentFixture <TestedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UiScrollModule],
      declarations: [TestedComponent]
    });
    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have an instance', () => {
    expect(component).toBeDefined();
    expect(component.datasource).toBeDefined(Object);
    expect(component.datasource.get).toBeDefined(Function);
  });

  it('should correctly be called html-tag with directive', () => {
    expect(fixture.debugElement.children[0].name).toBe('app-ui-scroll');
  });

  const getElemByAttr = (attr) => fixture.debugElement.query(By.css(attr));

  it('should create tags: data-padding-top and data-padding-bottom', () => {
    expect(getElemByAttr('[data-padding-top]')).not.toBeNull();
    expect(getElemByAttr('[data-padding-bottom]')).not.toBeNull();

    // expect(getElemByAttr('[data-padding-top]')).nativeElement.style.height).toBe('36px');
    // expect(getElemByAttr('[data-padding-bottom]')).nativeElement.style.height).toBe('0px');
  });

  it('should contain some div with items inside', () => {
    for (let j = 86; j <= 99; j++) {  // The numbers need to be changed
      const elem = getElemByAttr(`[id="i-0-${j}"]`);
      expect(elem.name).toBe('div');
      expect(elem.nativeElement.textContent).toMatch(`${j} : item #${j}`);
      // expect(elem.childNodes[1].styles.position).toBeUndefined();
      // expect(elem.childNodes[1].styles.left).not.toBe('-9999px');
    }
  });
});
