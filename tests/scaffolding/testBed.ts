import { TestBed } from '@angular/core/testing';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';

import { UiScrollModule } from '../../src/ui-scroll.module';

import { TestComponent } from './testComponent';
import { DatasourceService } from './datasources';

export const configureTestBed = (datasource: any, template: string) =>
  TestBed
    .configureTestingModule({
      imports: [UiScrollModule],
      declarations: [TestComponent],
      providers: [{
        provide: ComponentFixtureAutoDetect,
        useValue: true
      }, {
        provide: DatasourceService,
        useClass: DatasourceService
      }]
    })
    .overrideProvider(DatasourceService, { useValue: new datasource() })
    .overrideComponent(TestComponent, { set: { template } })
    .createComponent(TestComponent);
