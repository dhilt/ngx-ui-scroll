import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../shared/datasource-get';

import { IDatasource } from '../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-buffer-size',
  templateUrl: './buffer-size.component.html'
})
export class DemoBufferSizeComponent {

  demoContext: DemoContext = <DemoContext> {
    title: `bufferSize setting`,
    titleId: `bufferSize-setting`,
    id: `buffer`,
    count: 0,
    log: ''
  };

  datasource: IDatasource = {
    get: datasourceGetCallbackInfinite(this.demoContext),
    settings: {
      bufferSize: 15
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
    bufferSize: 15
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
