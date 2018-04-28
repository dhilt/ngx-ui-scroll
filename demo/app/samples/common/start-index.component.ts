import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { IDatasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-start-index',
  templateUrl: './start-index.component.html'
})
export class DemoStartIndexComponent {

  demoContext: DemoContext = <DemoContext> {
    title: `startIndex setting`,
    titleId: `start-index-setting`,
    viewportId: `start-index-viewport`,
    count: 0,
    log: ''
  };

  datasource: IDatasource = {
    get: datasourceGetCallbackInfinite(this.demoContext),
    settings: {
      startIndex: 137
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
    startIndex: 137
  }
}`,
    template: `<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`,
    styles: `.viewport {
  width: 175px;
  height: 175px;
  overflow-y: auto;
  overflow-anchor: none;
}
.item {
  font-weight: bold;
  height: 25px;
}`
  };

}
