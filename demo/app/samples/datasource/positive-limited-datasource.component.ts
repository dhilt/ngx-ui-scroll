import { Component } from '@angular/core';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { IDatasource } from '../../../../public_api';
import { doLog } from '../../shared/datasource-get';

@Component({
  selector: 'app-positive-limited-datasource',
  templateUrl: './positive-limited-datasource.component.html'
})
export class DemoPositiveLimitedDatasourceComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'datasource',
    title: `Positive limited datasource`,
    titleId: `positive-limited-indexes`,
    logViewOnly: true,
    log: '',
    count: 0
  };

  datasource: IDatasource = {
    get: (index, count, success) => {
      const data = [];
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

  sources: DemoSources = [{
    name: DemoSourceType.Datasource,
    text: `datasource: IDatasource = {
  get: (index, count, success) => {
    const data = [];
    const start = Math.max(1, index); // or 0
    const end = index + count - 1;
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
