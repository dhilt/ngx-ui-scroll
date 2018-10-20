import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { IDatasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-min-max-indexes',
  templateUrl: './min-max-indexes.component.html'
})
export class DemoMinMaxIndexesComponent {

  demoContext: DemoContext = <DemoContext> {
    title: `minIndex / maxIndex settings`,
    titleId: `min-max-indexes-settings`,
    viewportId: `min-max-indexes-viewport`,
    count: 0,
    log: ''
  };

  datasource: IDatasource = {
    get: datasourceGetCallbackInfinite(this.demoContext),
    settings: {
      minIndex: 1,
      maxIndex: 1000
    }
  };

  sources: DemoSources = {
    datasource: `datasource: IDatasource = {
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  },
  settings: {
    minIndex: 1,
    maxIndex: 1000
  }
}`,
    template: `<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`,
    styles: `.viewport {
  width: 175px;
  height: 250px;
  overflow-y: auto;
  overflow-anchor: none;
}
.item {
  font-weight: bold;
  height: 25px;
}`
  };

  limitedDatasourceSample = `  get: (index, count, success) => {
    const data = [];
    const start = Math.max(MIN, index);
    const end = Math.min(index + count - 1, MAX);
    for (let i = start; i <= end; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }`;

}
