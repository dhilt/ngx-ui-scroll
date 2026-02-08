import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';
import { Type } from '@angular/core';

import { UiScrollModule } from 'ngx-ui-scroll';

import { DatasourceService } from './datasources/class';
import {
  ScrollerTestComponent,
  TwoScrollersTestComponent,
  ScrollerSubTestComponent,
  ScrollerPlainTestComponent
} from './testComponent';

export const configureTestBed = (
  datasource: new () => unknown,
  template: string
): ComponentFixture<ScrollerTestComponent> => {
  const fixture = TestBed.configureTestingModule({
    imports: [UiScrollModule],
    declarations: [ScrollerTestComponent],
    providers: [
      {
        provide: ComponentFixtureAutoDetect,
        useValue: true
      },
      {
        provide: DatasourceService,
        useClass: DatasourceService
      }
    ]
  })
    .overrideProvider(DatasourceService, { useValue: new datasource() })
    .overrideComponent(ScrollerTestComponent, { set: { template } })
    .createComponent(ScrollerTestComponent);
  fixture.detectChanges();
  return fixture;
};

const configureTestBedFactory =
  <T>(comp: Type<T>) =>
  (): ComponentFixture<T> => {
    const fixture = TestBed.configureTestingModule({
      imports: [UiScrollModule],
      declarations: [comp],
      providers: [
        {
          provide: ComponentFixtureAutoDetect,
          useValue: true
        }
      ]
    }).createComponent(comp);
    fixture.detectChanges();
    return fixture;
  };

export const configureTestBedTwo = configureTestBedFactory(
  TwoScrollersTestComponent
);
export const configureTestBedSub = configureTestBedFactory(
  ScrollerSubTestComponent
);
export const configureTestBedPlain = configureTestBedFactory(
  ScrollerPlainTestComponent
);
