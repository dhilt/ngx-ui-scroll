import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-items-count',
  templateUrl: './items-count.component.html'
})
export class DemoItemsCountComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'adapter',
    title: `Buffer items counter`,
    titleId: `items-count`,
    viewportId: `items-count-viewport`,
    count: 0,
    log: ''
  };

  datasource = new Datasource({
    get: datasourceGetCallbackInfinite(this.demoContext)
  });

  sources: DemoSources = {
    datasource: `datasource = new Datasource ({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }
});`,
    template: `The uiScroll buffer has
{{datasource.adapter.itemsCount}} items.

<div class="viewport">
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
}