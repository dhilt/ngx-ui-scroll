import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoSources, DemoSourceType, MyItem } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { IDatasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-bidirectional-unlimited-datasource',
  templateUrl: './bidirectional-unlimited-datasource.component.html'
})
export class DemoBidirectionalUnlimitedDatasourceComponent {
  demoContext = {
    config: demos.datasource.map.unlimitedBidirectional,
    logViewOnly: true,
    log: '',
    count: 0
  };

  datasource: IDatasource = {
    get: (index, count, success) => {
      const data: MyItem[] = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({ id: i, text: 'item #' + i });
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
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ text: 'item #' + i });
    }
    success(data);
  }
};`
    }
  ];
}
