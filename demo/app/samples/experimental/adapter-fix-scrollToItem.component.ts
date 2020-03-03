import { Component } from '@angular/core';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { Datasource } from '../../../../public_api';
import { doLog } from '../../shared/datasource-get';

@Component({
  selector: 'app-adapter-fix-scrollToItem',
  templateUrl: './adapter-fix-scrollToItem.component.html'
})
export class DemoAdapterFixScrollToItemComponent {

  demoContext: DemoContext = <DemoContext>{
    scope: 'experimental',
    title: `Adapter fix scrollToItem`,
    titleId: `adapter-fix-scrollToItem`,
    noInfo: true
  };

  datasource = new Datasource({
    get: (index, count, success) => {
      const data = [];
      for (let i = index; i < index + count; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      success(data);
    },
    devSettings: {
      debug: true
    }
  });

  inputValue: string;

  constructor() {
    this.inputValue = '5';
  }

  sources: DemoSources = [{
    name: DemoSourceType.Template,
    text: `<button (click)="doScrollTo()">Scroll to</button> item #
<input [(ngModel)]="inputValue" size="2">

<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`
  }, {
    name: DemoSourceType.Component,
    text: `inputValue = '5'

datasource = new Datasource({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i < index + count; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }
});

doScrollTo() {
  const index = Number(this.inputValue);
  if (!isNaN(index)) {
    this.datasource.adapter.fix({
      updater: ({ $index, data }) => {
        if (index === $index) {
          data.text += '*';
        }
      }
    });
  }
}
`
  }];

  adapterFixUpdater = `Adapter.fix({ scrollToItem })`;

  doScrollTo() {
    const index = Number(this.inputValue);
    if (!isNaN(index)) {
      this.datasource.adapter.fix({
        scrollToItemTop: ({ $index, data }) => data.id === index
      });
    }
  }

}
