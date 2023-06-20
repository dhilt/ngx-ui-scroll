import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoSources } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { IDatasource } from 'ngx-ui-scroll';

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
  MAX = 100;

  datasource: IDatasource = {
    get: (index, count, success) => {
      const data = [];
      const start = Math.max(this.MIN, index);
      const end = Math.min(index + count - 1, this.MAX);
      if (start <= end) {
        for (let i = start; i <= end; i++) {
          data.push({ text: 'item #' + i });
        }
      }
      doLog(this.demoContext, index, count, data.length);
      success(data);
    }
  };

  sources: DemoSources = [
    {
      name: 'Runtime generation',
      text: `MIN = -99;
MAX = 100;

datasource: IDatasource = {
  get: (index, count, success) => {
    const data = [];
    const start = Math.max(this.MIN, index);
    const end = Math.min(index + count - 1, this.MAX);
    if (start <= end) {
      for (let i = start; i <= end; i++) {
        data.push({ text: 'item #' + i });
      }
    }
    success(data);
  }
};`
    },
    {
      name: 'Fixed dataset',
      text: `MIN = -99;
MAX = 100;

constructor() {
  for (let i = this.MIN; i <= this.MAX; ++i) {
    this.data.push({ text: 'item #' + i });
  }
}

datasource: IDatasource = {
  get: (index, count, success) => {
    const data = [];
    const start = index;
    const end = start + count - 1;
    for (let i = start; i <= end; i++) {
      const _index = i - this.MIN;
      if (_index >= 0 && _index < this.data.length) {
        data.push(this.data[_index]);
      }
    }
    success(data);
  }
};`
    }
  ];
}
