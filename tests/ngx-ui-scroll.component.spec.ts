import { ChangeDetectorRef, ElementRef, ViewContainerRef, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture, inject } from '@angular/core/testing';

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
  });

  it('should correctly be called html-tag with directive', () => {
    const el = fixture.debugElement.children[0];
    expect(el.name).toBe('app-ui-scroll');
  });
});
