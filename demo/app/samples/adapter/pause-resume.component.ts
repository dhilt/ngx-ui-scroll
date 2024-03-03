import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoSources, DemoSourceType, MyItem } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-pause-resume',
  templateUrl: './pause-resume.component.html'
})
export class DemoPauseResumeComponent {
  demoContext = {
    config: demos.adapterMethods.map.pauseResume,
    viewportId: 'pause-resume-viewport',
    count: 0,
    log: ''
  };

  datasource = new Datasource({
    get: (index, count, success) => {
      const data: MyItem[] = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      doLog(this.demoContext, index, count, data.length);
      success(data);
    }
  });

  sources: DemoSources = [
    {
      active: true,
      name: DemoSourceType.Template,
      text: `<button (click)="datasource.adapter.pause()">Pause</button>
<button (click)="datasource.adapter.resume()">Resume</button>
Scroller is {{ datasource.adapter.paused ? 'paused' : 'not paused' }}

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
