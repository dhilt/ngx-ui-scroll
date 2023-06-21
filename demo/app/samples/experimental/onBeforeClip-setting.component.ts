import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoSources, DemoSourceType } from '../../shared/interfaces';

import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-on-before-clip-setting',
  templateUrl: './onBeforeClip-setting.component.html'
})
export class DemoOnBeforeClipSettingComponent {
  demoContext = {
    config: demos.experimental.map.onBeforeClipSetting,
    viewportId: 'onBeforeClip-setting-viewport',
    log: '',
    count: 0
  };

  datasource = new Datasource({
    get: (index, count, success) => {
      const data = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      success(data);
    },
    settings: {
      bufferSize: 25,
      onBeforeClip: items => {
        const log =
          `${++this.demoContext.count}) clipping ${items.length} items` +
          `[${items[0].$index}..${items[items.length - 1].$index}]\n`;
        this.demoContext.log = log + this.demoContext.log;
      }
    }
  });

  sources: DemoSources = [
    {
      name: DemoSourceType.Datasource,
      active: true,
      text: `datasource = new Datasource({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  },
  settings: {
    bufferSize: 25,
    onBeforeClip: (items) => {
      const range = \`[\${items[0].$index}..\${items[items.length - 1].$index}]\`;
      const text = \`clipping \${items.length} items \${range}\`;
      console.log(text);
    }
  }
})`
    },
    {
      name: DemoSourceType.Template,
      text: `<button (click)="datasource.adapter.clip()">Clip now</button>

<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`
    }
  ];

  argumentDescription = `  onBeforeClip: (items: {
    $index: number,
    data: any,
    element?: HTMLElement
  }[]) => void`;
}
