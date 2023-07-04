import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoSources, DemoSourceType, MyItem } from '../../shared/interfaces';

import { IDatasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-inverted-datasource',
  templateUrl: './inverted-datasource.component.html'
})
export class DemoInvertedDatasourceComponent {
  demoConfig = demos.datasource.map.invertedIndexes;

  MIN = 1;

  datasourceCommon: IDatasource = {
    get: (index, count, success) => success(this.getData(index, count))
  };

  datasourceInverted: IDatasource = {
    get: (index, count, success) => {
      const _index = -index - count + this.MIN;
      const data = this.getData(_index, count).reverse();
      success(data);
    },
    settings: {
      startIndex: -10
    }
  };

  sources: DemoSources = [
    {
      name: DemoSourceType.Component,
      text: `MIN = 1;

datasourceCommon: IDatasource = {
  get: (index, count, success) =>
    success(this.getData(index, count))
};

datasourceInverted: IDatasource = {
  get: (index, count, success) => {
    const _index = -index - count + this.MIN;
    const data = this.getData(_index, count).reverse();
    success(data);
  },
  settings: {
    startIndex: -10
  }
};

getData(index: number, count: number) {
  const data = [];
  const start = Math.max(this.MIN, index);
  const end = index + count - 1;
  if (start <= end) {
    for (let i = start; i <= end; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
  }
  return data;
}`
    }
  ];

  getData(index: number, count: number) {
    const data: MyItem[] = [];
    const start = Math.max(this.MIN, index);
    const end = index + count - 1;
    if (start <= end) {
      for (let i = start; i <= end; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
    }
    return data;
  }
}
