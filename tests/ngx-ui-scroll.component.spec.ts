import { ChangeDetectorRef, ElementRef, ViewContainerRef, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture, inject } from '@angular/core/testing';

import { UiScrollDirective } from '../src/directive/ui-scroll.directive';
import { TestedComponent } from './testedComponent';

describe('An UiScroll directive', () => {
  let component: TestedComponent;
  let fixture: ComponentFixture <TestedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestedComponent, UiScrollDirective]
    });
    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should have an instance', () => {
    expect(component).toBeDefined();
  });
});
