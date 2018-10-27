import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../../shared/interfaces';

@Component({
  selector: 'app-bidirectional-unlimited-datasource',
  templateUrl: './bidirectional-unlimited-datasource.component.html'
})
export class DemoBidirectionalUnlimitedDatasourceComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'datasource',
    title: `Unlimited bidirectional datasource`,
    titleId: `unlimited-bidirectional`,
    noWorkView: true,
    datasourceTabOnly: true
  };

  sources: DemoSources = {
    datasource: `datasource: IDatasource = {
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }
};`
  };

}
