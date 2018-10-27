import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../../shared/interfaces';

@Component({
  selector: 'app-limited-datasource',
  templateUrl: './limited-datasource.component.html'
})
export class DemoLimitedDatasourceComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'datasource',
    title: `Limited datasource`,
    titleId: `limited`,
    noWorkView: true,
    datasourceTabOnly: true
  };

  sources: DemoSources = {
    datasource: `MIN = -99;
MAX = 900;

datasource: IDatasource = {
  get: (index, count, success) => {
    const data = [];
    const start = Math.max(MIN, index);
    const end = Math.min(index + count - 1, MAX);
    if (start <= end) {
      for (let i = start; i <= end; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
    }
    success(data);
  }
};`
  };

}
