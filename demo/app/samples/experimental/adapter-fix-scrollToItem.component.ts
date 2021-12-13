import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoContext, DemoSources, DemoSourceType, MyItem } from '../../shared/interfaces';

import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-adapter-fix-scroll-to-item',
  templateUrl: './adapter-fix-scrollToItem.component.html'
})
export class DemoAdapterFixScrollToItemComponent {

  demoContext: DemoContext = <DemoContext>{
    config: demos.experimental.map.adapterFixScrollToItem,
    noInfo: true
  };

  datasource = new Datasource<MyItem>({
    get: (index, count, success) => {
      const data: MyItem[] = [];
      for (let i = index; i < index + count; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      success(data);
    }
  });

  index: string;
  scrollToBottom: boolean;

  constructor() {
    this.index = '5';
    this.scrollToBottom = false;
  }

  sources: DemoSources = [{
    name: DemoSourceType.Template,
    text: `<button (click)="doScrollTo()">Scroll to</button> item #
<input [(ngModel)]="index" size="2">
<input type="checkbox" [(ngModel)]="scrollToBottom"> - scroll to bottom

<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
  </div>
</div>`
  }, {
    name: DemoSourceType.Component,
    text: `index = '5'
scrollToBottom = false;

datasource = new Datasource<MyItem>({
  get: (index, count, success) => {
    const data: MyItem[] = [];
    for (let i = index; i < index + count; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }
});

doScrollTo() {
  const index = Number(this.index);
  const alignToTop = !Boolean(this.scrollToBottom);
  if (!isNaN(index)) {
    this.datasource.adapter.fix({
      scrollToItem: ({ data }) => data.id === index,
      scrollToItemOpt: alignToTop
    });
  }
}
`
  }];

  adapterFixUpdater = 'Adapter.fix({ scrollToItem })';

  doScrollTo() {
    const index = Number(this.index);
    const alignToTop = !this.scrollToBottom;
    if (!isNaN(index)) {
      this.datasource.adapter.fix({
        scrollToItem: ({ data }) => data.id === index,
        scrollToItemOpt: alignToTop
      });
    }
  }

}
