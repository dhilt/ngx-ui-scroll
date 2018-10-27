import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../../shared/interfaces';

@Component({
  selector: 'app-positive-limited-datasource',
  templateUrl: './positive-limited-datasource.component.html'
})
export class DemoPositiveLimitedDatasourceComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'datasource',
    title: `Positive limited datasource`,
    titleId: `positive-limited-indexes`,
    noWorkView: true,
    datasourceTabOnly: true
  };

  sources: DemoSources = {
    datasource: `datasource: IDatasource = {
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
  };

}
