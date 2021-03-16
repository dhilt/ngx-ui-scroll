import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-is-loading-advanced',
  templateUrl: './is-loading-extended.component.html'
})
export class DemoIsLoadingExtendedComponent {

  demoContext: DemoContext = {
    config: demos.adapterProps.map.isLoadingAdvanced,
    viewportId: 'is-loading-advanced-viewport',
    count: 0,
    log: ''
  };

  datasource = new Datasource({
    get: datasourceGetCallbackInfinite(this.demoContext, 125)
  });

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: `datasource = new Datasource ({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    setTimeout(() => success(data), 125);
  }
});

loadingCounter = 0;
innerLoopCounter = 0;

constructor() {
  this.datasource.adapter.isLoading$
    .subscribe(result =>
      this.loadingCounter += !result ? 1 : 0
    );
  this.datasource.adapter.loopPending$
    .subscribe(result =>
      this.innerLoopCounter += !result ? 1 : 0
    );
}`
  }, {
    active: true,
    name: DemoSourceType.Template,
    text: `The uiScroll is
{{datasource.adapter.isLoading ? 'loading': 'relaxing'}},
counter {{loadingCounter}}

<br>

Inner loop is
{{datasource.adapter.loopPending ? 'pending': 'stopped'}},
counter: {{innerLoopCounter}}

<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`
  }, {
    name: DemoSourceType.Styles,
    text: `.viewport {
  width: 150px;
  height: 175px;
  overflow-y: auto;
}
.item {
  font-weight: bold;
  height: 25px;
}`
  }];

  loadingCounter = 0;
  innerLoopCounter = 0;

  constructor() {
    this.datasource.adapter.isLoading$
      .subscribe(result =>
        this.loadingCounter += !result ? 1 : 0
      );
    this.datasource.adapter.loopPending$
      .subscribe(result =>
        this.innerLoopCounter += !result ? 1 : 0
      );
  }
}
