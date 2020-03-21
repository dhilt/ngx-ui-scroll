import { TestBed } from '@angular/core/testing';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';

import { UiScrollModule } from '../../src/ui-scroll.module';

import { ScrollerTestComponent, TwoScrollersTestComponent } from './testComponent';
import { DatasourceService } from './datasources';

export const configureTestBed = (datasource: any, template: string) =>
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

export const configureTestBedTwo = () =>
  TestBed
    .configureTestingModule({
      imports: [UiScrollModule],
      declarations: [TwoScrollersTestComponent],
      providers: [{
        provide: ComponentFixtureAutoDetect,
        useValue: true
      }]
    })
    .createComponent(TwoScrollersTestComponent);
