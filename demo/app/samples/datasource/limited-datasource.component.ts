import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoSources, DemoSourceType } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { IDatasource } from '../../../../public_api';

@Component({
  selector: 'app-limited-datasource',
  templateUrl: './limited-datasource.component.html'
})
export class DemoLimitedDatasourceComponent {

  demoContext = {
    config: demos.datasource.map.limited,
    logViewOnly: true,
    log: '',
    count: 0
  };

  minMaxDemoConfig = demos.settings.map.minMaxIndexes;

  MIN = -99;
  MAX = 900;

  datasource: IDatasource = {
    get: (index, count, success) => {
      const data = [];
      const start = Math.max(this.MIN, index);
      const end = Math.min(index + count - 1, this.MAX);
      if (start <= end) {
        for (let i = start; i <= end; i++) {
          data.push({ id: i, text: 'item #' + i });
        }
      }
      doLog(this.demoContext, index, count, data.length);
      success(data);
    }
  };

  sources: DemoSources = [{
    name: DemoSourceType.Datasource,
    text: `MIN = -99;
MAX = 900;

datasource: IDatasource = {
  get: (index, count, success) => {
    const data = [];
    const start = Math.max(this.MIN, index);
    const end = Math.min(index + count - 1, this.MAX);
    if (start <= end) {
      for (let i = start; i <= end; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
    }
    success(data);
  }
};`
  }];

}
