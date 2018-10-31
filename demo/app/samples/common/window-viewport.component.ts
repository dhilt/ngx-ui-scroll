import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../../shared/interfaces';

@Component({
  selector: 'app-demo-window-viewport',
  templateUrl: './window-viewport.component.html'
})
export class DemoWindowViewportComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'settings',
    title: `Entire window scrollable`,
    titleId: `window-viewport`,
    viewportId: `window-viewport-viewport`,
    noWorkView: true,
    count: 0,
    log: ''
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
    windowViewport: true
  }
}`,
    template: `<div *uiScroll="let item of datasource">
  <div class="item">{{item.text}}</div>
</div>`,
    styles: `.item {
  font-weight: bold;
  height: 25px;
}`
  };

}
