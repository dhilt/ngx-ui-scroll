import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { take } from 'rxjs/operators';

import { demos } from '../../routes';
import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-init',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './init.component.html'
})
export class DemoInitComponent {

  demoContext: DemoContext = {
    config: demos.adapter.map.init,
    viewportId: `init-viewport`,
    noInfo: true,
    count: 0,
    log: ''
  };

  version = '...';

  datasource = new Datasource({
    get: datasourceGetCallbackInfinite(this.demoContext)
  });

  sources: DemoSources = [{
    active: true,
    name: DemoSourceType.Component,
    text: `changeDetection: ChangeDetectionStrategy.OnPush

// ...

version = '...';

datasource = new Datasource ({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }
});

constructor(public changeDetector: ChangeDetectorRef) {
  const { adapter } = this.datasource;
  adapter.init$.pipe(take(1)).subscribe(() => {
    this.version = adapter.packageInfo.consumer.version;
    this.changeDetector.detectChanges();
  });
}`
  }, {
    name: DemoSourceType.Template,
    text: `ngx-ui-scroll version is {{version}}

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

  constructor(public changeDetector: ChangeDetectorRef) {
    const { adapter } = this.datasource;
    adapter.init$.pipe(take(1)).subscribe(() => {
      this.version = adapter.packageInfo.consumer.version;
      this.changeDetector.detectChanges();
    });
  }

}
