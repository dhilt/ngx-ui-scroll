import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoSources, DemoSourceType } from '../../shared/interfaces';

@Component({
  selector: 'app-viewport-element-setting',
  templateUrl: './viewportElement-setting.component.html',
  standalone: false
})
export class DemoViewportElementSettingComponent {
  demoContext = {
    config: demos.experimental.map.viewportElementSetting,
    noWorkView: true
  };

  sources: DemoSources = [
    {
      name: DemoSourceType.Datasource,
      text: `@ViewChild('viewport', { static: true }) viewportRef: ElementRef<HTMLElement>;

datasource: IDatasource = {
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  },
  settings: {
    viewportElement: () => this.viewportRef.nativeElement
  }
}`
    },
    {
      name: DemoSourceType.Template,
      active: true,
      text: `<div class="viewport" #viewport>
  <div>
    <div>
      <div *uiScroll="let item of datasource">
        <div class="item">{{item.text}}</div>
      </div>
    </div>
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

  nativeSample = `settings: {
  viewportElement: () =>
    document.getElementsByClassName('viewport')[0]
}`;
}
