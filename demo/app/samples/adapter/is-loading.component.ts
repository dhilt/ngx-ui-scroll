import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-is-loading',
  templateUrl: './is-loading.component.html'
})
export class DemoIsLoadingComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'adapter',
    title: `Is loading?`,
    titleId: `is-loading`,
    viewportId: `is-loading-viewport`,
    count: 0,
    log: ''
  };

  datasource = new Datasource({
    get: datasourceGetCallbackInfinite(this.demoContext, 125)
  });

  sources: DemoSources = {
    datasource: `datasource = new Datasource ({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    setTimeout(() => success(data), 125);
  }
});

isLoadingCounter = 0;

constructor() {
  this.datasource.adapter.isLoading$
    .subscribe(isLoading =>
      this.isLoadingCounter += !isLoading ? 1 : 0
    );
}
`,
    template: `The uiScroll is
{{datasource.adapter.isLoading ? 'loading': 'relaxing'}}.

<br>

The value of isLoading counter has been changed
for {{isLoadingCounter}} times.

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

  isLoadingCounter = 0;

  constructor() {
    this.datasource.adapter.isLoading$
      .subscribe(isLoading =>
        this.isLoadingCounter += !isLoading ? 1 : 0
      );
  }
}
