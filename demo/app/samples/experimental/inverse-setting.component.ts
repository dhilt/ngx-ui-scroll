import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoSources, DemoSourceType } from '../../shared/interfaces';

import { IDatasource } from '../../../../public_api';

@Component({
  selector: 'app-inverse-setting',
  templateUrl: './inverse-setting.component.html'
})
export class DemoInverseSettingComponent {

  demoContext = {
    config: demos.experimental.map.inverseSetting,
    addClass: `inverse`,
    noInfo: true
  };

  MIN = 1;
  MAX = 5;

  datasource: IDatasource = {
    get: (index, count, success) => {
      const data = [];
      const start = Math.max(this.MIN, index);
      const end = Math.min(index + count - 1, this.MAX);
      if (start <= end) {
        for (let i = start; i <= end; i++) {
          data.push({ id: i, text: 'item #' + i });
        }
      }
      success(data);
    },
    settings: {
      inverse: true
    }
  };

  sources: DemoSources = [{
    name: DemoSourceType.Datasource,
    text: `MIN = 1;
MAX = 5;

datasource: IDatasource = {
  get: (index, count, success) => {
    const data = [];
    const start = Math.max(this.MIN, index);
    const end = Math.min(index + count - 1, this.MAX);
    if (start <= end) {
      for (let i = start; i <= end; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
    }
    success(data);
  },
  settings: {
    inverse: true
  }
};`
  }, {
    name: DemoSourceType.Styles,
    text: `.viewport div[data-padding-backward] {
  background-color: #e1f0ff;
}
.item {
  background-color: #bcdeff;
}`
  }];

}
