import { Component } from '@angular/core';

import { Datasource } from '../../src/component/interfaces/datasource';
import { DatasourceService } from './datasource.service';

export interface TestComponentInterface {
  datasource: Datasource;
}

@Component({
  template: `
    <div class="viewport">
      <div *uiScroll="let item of datasource">
        <span>{{item.id}}</span> : <b>{{item.text}}</b>
      </div>
    </div>
  `,
  styles: [`
    .viewport {
      width: 200px;
      height: 120px;
      overflow-anchor: none;
      overflow-y: auto;
      display: block;
    }
  `],
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
