import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-is-loading-extended',
  templateUrl: './is-loading-extended.component.html'
})
export class DemoIsLoadingExtendedComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'adapter',
    title: `Is loading, advanced`,
    titleId: `is-loading-extended`,
    viewportId: `is-loading-extended-viewport`,
    count: 0,
    log: ''
  };

  datasource = new Datasource({
    get: datasourceGetCallbackInfinite(this.demoContext, 125),
    devSettings: {
      debug: true,
      immediateLog: false
    }
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

loadingCounter = -1;
outerCycleCounter = -1;
innerLoopCounter = -1;

constructor() {
  this.datasource.adapter.isLoading$
    .subscribe(result =>
      this.loadingCounter += !result ? 1 : 0
    );
  this.datasource.adapter.cyclePending$
    .subscribe(result =>
      this.outerCycleCounter += !result ? 1 : 0
    );
  this.datasource.adapter.loopPending$
    .subscribe(result =>
      this.innerLoopCounter += !result ? 1 : 0
    );
}`,
    template: `The uiScroll is
{{datasource.adapter.isLoading ? 'loading': 'relaxing'}},
counter {{loadingCounter}}

<br>

Outer cycle is
{{datasource.adapter.cyclePending ? 'pending': 'stopped'}},
counter: {{outerCycleCounter}}

<br>

Inner loop is
{{datasource.adapter.loopPending ? 'pending': 'stopped'}},
counter: {{innerLoopCounter}}

<div class="viewport">
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

  loadingCounter = -1;
  outerCycleCounter = -1;
  innerLoopCounter = -1;

  constructor() {
    this.datasource.adapter.isLoading$
      .subscribe(result =>
        this.loadingCounter += !result ? 1 : 0
      );
    this.datasource.adapter.cyclePending$
      .subscribe(result =>
        this.outerCycleCounter += !result ? 1 : 0
      );
    this.datasource.adapter.loopPending$
      .subscribe(result =>
        this.innerLoopCounter += !result ? 1 : 0
      );
  }
}
