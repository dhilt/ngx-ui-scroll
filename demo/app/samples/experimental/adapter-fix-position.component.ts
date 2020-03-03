import { Component } from '@angular/core';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { Datasource } from '../../../../public_api';
import { doLog } from '../../shared/datasource-get';

@Component({
  selector: 'app-adapter-fix-position',
  templateUrl: './adapter-fix-position.component.html'
})
export class DemoAdapterFixPositionComponent {

  demoContext: DemoContext = <DemoContext>{
    scope: 'experimental',
    title: `Adapter fix scroll position`,
    titleId: `adapter-fix-position`,
    noInfo: true
  };

  datasource = new Datasource({
    get: (index, count, success) => {
      const data = [];
      for (let i = index; i < index + count; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      success(data);
    }
  });

  sources: DemoSources = [{
    name: DemoSourceType.Template,
    text: `<button (click)="scrollTop()">scroll top</button>
<button (click)="scrollBottom()">scroll bottom</button>

<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`
  }, {
    name: DemoSourceType.Component,
    text: `datasource = new Datasource({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i < index + count; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }
});

  scrollTop() {
    this.datasource.adapter.fix({ scrollPosition: 0 });
  }

  scrollBottom() {
    this.datasource.adapter.fix({ scrollPosition: +Infinity });
  }
`
  }];

  adapterFixPosition = `Adapter.fix({ scrollPosition: 0 })`;

  scrollTop() {
    this.datasource.adapter.fix({ scrollPosition: 0 });
  }

  scrollBottom() {
    this.datasource.adapter.fix({ scrollPosition: +Infinity });
  }

}
