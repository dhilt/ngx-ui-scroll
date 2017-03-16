import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UiScrollComponent } from './ui-scroll.component';

describe('UiScrollComponent', () => {
  let component: UiScrollComponent;
  let fixture: ComponentFixture<UiScrollComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UiScrollComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UiScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
