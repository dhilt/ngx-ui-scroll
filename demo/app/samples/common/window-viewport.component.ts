import { Component } from '@angular/core';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';

@Component({
  selector: 'app-demo-window-viewport',
  templateUrl: './window-viewport.component.html'
})
export class DemoWindowViewportComponent {

  demoContext: DemoContext = {
    scope: 'settings',
    title: `Entire window scrollable`,
    titleId: `window-viewport`,
    viewportId: `window-viewport-viewport`,
    noWorkView: true,
    count: 0,
    log: ''
  };

  sources: DemoSources = [{
    name: DemoSourceType.Datasource,
    text: `datasource: IDatasource = {
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  },
  settings: {
    windowViewport: true
  }
}`
  }, {
    name: DemoSourceType.Template,
    text: `<div *uiScroll="let item of datasource">
  <div class="item">{{item.text}}</div>
</div>`
  }, {
    name: DemoSourceType.Styles,
    text: `.item {
  font-weight: bold;
  height: 25px;
}`
  }];

}
