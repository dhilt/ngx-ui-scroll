import { Component } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { ItemAdapter } from '../miscellaneous/vscroll';
import { IDatasource, Datasource } from 'ngx-ui-scroll';
import { Data } from '../miscellaneous/items';
import { DatasourceService } from './datasources/class';
import { defaultTemplate, TemplateSettings } from './templates';

export interface TestComponentInterface {
  datasource: IDatasource<Data>;
}

@Component({
  template: defaultTemplate,
  providers: [DatasourceService],
  standalone: false
})
export class ScrollerTestComponent implements TestComponentInterface {
  datasource: IDatasource<Data>;
  templateSettings!: TemplateSettings;

  constructor(
    private sanitizer: DomSanitizer,
    datasourceService: DatasourceService
  ) {
    this.datasource = datasourceService;
  }

  getItemStyle(item: { [key: string]: unknown }): SafeStyle {
    if (!this.templateSettings) {
      return '';
    }
    let result = '';
    const settings = this.templateSettings;
    const { dynamicSize } = settings;
    if (!dynamicSize && settings.itemHeight) {
      result = 'height:' + settings.itemHeight + 'px; overflow-y: hidden;';
    }
    if (!dynamicSize && settings.itemWidth) {
      result = 'width:' + settings.itemWidth + 'px; overflow-x: hidden;';
    }
    if (dynamicSize && item && item[dynamicSize] !== void 0) {
      result =
        (settings.horizontal ? 'width' : 'height') +
        ': ' +
        item[dynamicSize] +
        'px; ' +
        'overflow-' +
        (settings.horizontal ? 'x' : 'y') +
        ': hidden;';
    }
    return this.sanitizer.bypassSecurityTrustStyle(result);
  }
}

@Component({
  template: `<div style="height: 200px; overflow-y: scroll;">
      <div *uiScroll="let item of datasource; let index = index">
        <span>{{ index }}</span> : <b>{{ item.text }}</b>
      </div>
    </div>
    <br />
    <div style="height: 200px; overflow-y: scroll;">
      <div *uiScroll="let item of datasource2; let index = index">
        <span>{{ index }}</span> : <b>{{ item.text }}</b>
      </div>
    </div>`,
  standalone: false
})
export class TwoScrollersTestComponent implements TestComponentInterface {
  datasource: IDatasource<Data> = new Datasource<Data>({
    get: (index, count, success) =>
      success(
        Array.from({ length: count }, (j, i) => ({
          id: i + index,
          text: 'item #' + (i + index)
        }))
      )
  });

  datasource2: IDatasource<Data> = new Datasource<Data>({
    get: (index, count, success) =>
      success(
        Array.from({ length: count }, (j, i) => ({
          id: i + index,
          text: 'item #' + (i + index) + ' *'
        }))
      )
  });
}

const basicTemplate = `<div
  *ngIf="show"
  style="height: 200px; overflow-y: scroll;"
><div
  *uiScroll="let item of datasource; let index = index"
><span>{{index}}</span> : <b>{{item.text}}</b></div></div>`;

const basicDS: IDatasource<Data> = {
  get: (index, count, success) =>
    success(
      Array.from({ length: count }, (j, i) => ({
        id: i + index,
        text: 'item #' + (i + index)
      }))
    )
  // devSettings: { debug: true }
};

@Component({ template: basicTemplate, standalone: false })
export class ScrollerSubTestComponent implements TestComponentInterface {
  datasource: IDatasource<Data> = new Datasource<Data>(basicDS);
  show = true;
  firstVisible!: ItemAdapter<Data>;
  constructor() {
    this.datasource.adapter.firstVisible$.subscribe(
      value => (this.firstVisible = value)
    );
  }
}

@Component({ template: basicTemplate, standalone: false })
export class ScrollerPlainTestComponent implements TestComponentInterface {
  datasource = basicDS;
  show = true;
  constructor() {}
}
