import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';
import { Type } from '@angular/core';

import { UiScrollModule } from '../../src/ui-scroll.module';

import { DatasourceService } from './datasources/class';
import {
  ScrollerTestComponent,
  TwoScrollersTestComponent,
  ScrollerSubTestComponent,
} from './testComponent';

export const configureTestBed = (
  datasource: new () => unknown, template: string
): ComponentFixture<ScrollerTestComponent> =>
  TestBed
    .configureTestingModule({
      imports: [UiScrollModule],
      declarations: [ScrollerTestComponent],
      providers: [{
        provide: ComponentFixtureAutoDetect,
        useValue: true
      }, {
        provide: DatasourceService,
        useClass: DatasourceService
      }]
    })
    .overrideProvider(DatasourceService, { useValue: new datasource() })
    .overrideComponent(ScrollerTestComponent, { set: { template } })
    .createComponent(ScrollerTestComponent);

const configureTestBedFactory = <T>(comp: Type<T>) => (): ComponentFixture<T> =>
  TestBed
    .configureTestingModule({
      imports: [UiScrollModule],
      declarations: [comp],
      providers: [{
        provide: ComponentFixtureAutoDetect,
        useValue: true
      }]
    })
    .createComponent(comp);

export const configureTestBedTwo = configureTestBedFactory(TwoScrollersTestComponent);
export const configureTestBedSub = configureTestBedFactory(ScrollerSubTestComponent);
