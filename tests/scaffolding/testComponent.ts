import { Component } from '@angular/core';

import { Datasource } from '../../src/component/interfaces/datasource';
import { DatasourceService } from './datasource.service';
import { defaultTemplate } from './templates';

export interface TestComponentInterface {
  datasource: Datasource;
}

@Component({
  template: defaultTemplate,
  providers: [DatasourceService]
})
export class TestComponent implements TestComponentInterface {
  datasource: Datasource;

  constructor(
    datasourceService: DatasourceService
  ) {
    this.datasource = <Datasource>datasourceService;
  }
}
