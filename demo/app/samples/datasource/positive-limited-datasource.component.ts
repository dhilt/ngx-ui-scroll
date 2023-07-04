import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoSources, DemoSourceType, MyItem } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { IDatasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-positive-limited-datasource',
  templateUrl: './positive-limited-datasource.component.html'
})
export class DemoPositiveLimitedDatasourceComponent {
  demoContext = {
    config: demos.datasource.map.positiveLimitedIndexes,
    logViewOnly: true,
    log: '',
    count: 0
  };

  settingsScope = demos.settings.map;

  datasource: IDatasource = {
    get: (index, count, success) => {
      const data: MyItem[] = [];
      const start = Math.max(1, index); // or 0
      const end = index + count - 1;
      if (start <= end) {
        for (let i = start; i <= end; i++) {
          data.push({ id: i, text: 'item #' + i });
        }
      }
      doLog(this.demoContext, index, count, data.length);
      success(data);
    }
  };

  sources: DemoSources = [
    {
      name: DemoSourceType.Datasource,
      text: `datasource: IDatasource = {
  get: (index, count, success) => {
    const data = [];
    const start = Math.max(1, index); // or 0
    const end = index + count - 1;
    if (start <= end) {
      for (let i = start; i <= end; i++) {
        data.push({ text: 'item #' + i });
      }
    }
    success(data);
  }
};`
    }
  ];
}
