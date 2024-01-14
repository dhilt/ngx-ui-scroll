import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoSources, DemoSourceType, MyItem } from '../../shared/interfaces';

import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-adapter-pause-resume',
  templateUrl: './adapter-pause-resume.component.html'
})
export class DemoAdapterPauseResumeComponent {
  demoContext = {
    config: demos.experimental.map.adapterPauseResume,
    noInfo: true
  };

  datasource = new Datasource({
    get: (index, count, success) => {
      const data: MyItem[] = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      success(data);
    }
  });

  sources: DemoSources = [
    {
      active: true,
      name: DemoSourceType.Template,
      text: `<button (click)="datasource.adapter.pause()">Pause</button>
<button (click)="datasource.adapter.resume()">Resume</button>

<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`
    },
    {
      name: DemoSourceType.Datasource,
      text: `datasource = new Datasource({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }
  }
})`
    }
  ];

  argumentDescription = `  onBeforeClip: (items: {
    $index: number,
    data: any,
    element?: HTMLElement
  }[]) => void`;
}
