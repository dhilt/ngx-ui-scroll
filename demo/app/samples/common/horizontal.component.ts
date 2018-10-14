import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { IDatasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-horizontal',
  templateUrl: './horizontal.component.html'
})
export class DemoHorizontalComponent {

  demoContext: DemoContext = <DemoContext> {
    title: `Horizontal mode`,
    titleId: `horizontal-mode`,
    viewportId: `horizontal-viewport`,
    addClass: `horizontal`,
    count: 0,
    log: ''
  };

  datasource: IDatasource = {
    get: datasourceGetCallbackInfinite(this.demoContext),
    settings: {
      horizontal: true
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
    horizontal: true
  }
}`,
    template: `<div class="viewport horizontal">
  <div *uiScroll="let item of datasource">
    <div class="item horizontal">{{item.text}}</div>
  </div>
</div>`,
    styles: `.viewport.horizontal {
  width: 250px;
  height: 100px;
  overflow-anchor: none;
  overflow-x: scroll;
  overflow-y: hidden;
  white-space: nowrap;
}
.viewport.horizontal div {
  display: inline-block;
}
.item.horizontal {
  border: 1px solid #aaa;
  height: 100px;
  padding: 0 5px;
  font-weight: bolder;
}`
  };

}
