import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { demos } from '../../routes';
import {
  DemoContext,
  DemoSources,
  DemoSourceType
} from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-init',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './init.component.html',
  standalone: false
})
export class DemoInitComponent {
  demoContext: DemoContext = {
    config: demos.adapterProps.map.init,
    viewportId: 'init-viewport',
    noInfo: true,
    count: 0,
    log: ''
  };

  version = '...';

  datasource = new Datasource({
    get: datasourceGetCallbackInfinite(this.demoContext)
  });

  sources: DemoSources = [
    {
      active: true,
      name: DemoSourceType.Component,
      text: `version = '...';

datasource = new Datasource ({
  get: (index, length, success) =>
    success(Array.from({ length }).map((i, j) =>
      ({ id: index + j, text: 'item #' + (index + j) })
    ))
});

constructor() {
  const { adapter } = this.datasource;
  adapter.init$.pipe(take(1)).subscribe(() =>
    this.version = adapter.packageInfo.consumer.version
  );
}`
    },
    {
      name: DemoSourceType.Component + ' (OnPush)',
      text: `@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})

...

version = '...';

datasource = new Datasource ({
  get: (index, length, success) =>
    success(Array.from({ length }).map((i, j) =>
      ({ id: index + j, text: 'item #' + (index + j) })
    ))
});

constructor(public changeDetector: ChangeDetectorRef) {
  const { adapter } = this.datasource;
  adapter.init$.pipe(take(1)).subscribe(() => {
    this.version = adapter.packageInfo.consumer.version;
    this.changeDetector.detectChanges();
  });
}`
    },
    {
      name: DemoSourceType.Template,
      text: `ngx-ui-scroll version is {{version}}

<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`
    },
    {
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
    }
  ];

  constructor(public changeDetector: ChangeDetectorRef) {
    const { adapter } = this.datasource;
    (adapter.init$ as unknown as Observable<boolean>)
      .pipe(take(1))
      .subscribe(() => {
        this.version = adapter.packageInfo.consumer.version;
        this.changeDetector.detectChanges();
      });
  }
}
