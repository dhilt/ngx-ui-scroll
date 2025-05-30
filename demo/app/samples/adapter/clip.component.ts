import { Component } from '@angular/core';

import { demos } from '../../routes';
import {
  DemoContext,
  DemoSources,
  DemoSourceType
} from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';

import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-clip',
  templateUrl: './clip.component.html',
  standalone: false
})
export class DemoClipComponent {
  demoContext: DemoContext = {
    config: demos.adapterMethods.map.clip,
    viewportId: 'clip-viewport',
    count: 0,
    log: ''
  };

  settingsScope = demos.settings;

  datasource = new Datasource({
    get: datasourceGetCallbackInfinite(this.demoContext),
    settings: {
      infinite: true
    }
  });

  sources: DemoSources = [
    {
      name: DemoSourceType.Component,
      text: `datasource = new Datasource ({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  },
  settings: {
    infinite: true
  }
});

async doClip() {
  await this.datasource.adapter.relax();
  await this.datasource.adapter.clip();
}`
    },
    {
      active: true,
      name: DemoSourceType.Template,
      text: `<button (click)="doClip()">Clip</button>

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

  clipOptionsDescription = `  AdapterClipOptions {
    forwardOnly?: boolean;
    backwardOnly?: boolean;
  }`;

  clipOptionsSample = '{ backwardOnly: true }';

  async doClip() {
    await this.datasource.adapter.relax();
    await this.datasource.adapter.clip();
  }
}
