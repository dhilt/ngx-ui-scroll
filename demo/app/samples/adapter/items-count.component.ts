import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-items-count',
  templateUrl: './items-count.component.html'
})
export class DemoItemsCountComponent {

  demoContext: DemoContext = {
    config: demos.adapterProps.map.itemsCount,
    viewportId: 'items-count-viewport',
    count: 0,
    log: ''
  };

  datasource = new Datasource({
    get: datasourceGetCallbackInfinite(this.demoContext)
  });

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: `datasource = new Datasource ({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }
});`
  }, {
    active: true,
    name: DemoSourceType.Template,
    text: `The uiScroll buffer has
{{datasource.adapter.itemsCount}} items.

<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`
  }, {
    name: DemoSourceType.Styles,
    text: `.viewport {
  width: 150px;
  height: 250px;
  overflow-y: auto;
}
.item {
  font-weight: bold;
  height: 25px;
}`
  }];
}
