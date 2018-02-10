import { TestBed } from '@angular/core/testing';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';

import { UiScrollModule } from '../../src/ui-scroll.module';
import { TestComponent } from './testComponent';
import { Datasource } from '../../src/component/interfaces/datasource';
import { DatasourceService } from './datasource.service';

export const configureTestBed = (datasource, template) => {
  return TestBed
    .configureTestingModule({
      imports: [UiScrollModule],
      declarations: [TestComponent],
      providers: [{
        provide: ComponentFixtureAutoDetect,
        useValue: true
      }, {
        provide: DatasourceService,
        useValue: <Datasource>datasource
      }]
    })
    .overrideComponent(TestComponent, { set: { template } })
    .createComponent(TestComponent);
};
