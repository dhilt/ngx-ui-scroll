import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { IDatasource } from '../../src/component/interfaces';
import { Datasource } from '../../src/component/classes/datasource';

import { DatasourceService } from './datasources';
import { defaultTemplate, TemplateSettings } from './templates';

export interface TestComponentInterface {
  datasource: IDatasource;
}

@Component({
  template: defaultTemplate,
  providers: [DatasourceService]
})
export class ScrollerTestComponent implements TestComponentInterface {
  datasource: IDatasource;
  templateSettings: TemplateSettings;

  constructor(
    private sanitizer: DomSanitizer,
    datasourceService: DatasourceService
  ) {
    this.datasource = datasourceService as IDatasource;
  }

  getItemStyle(item: any) {
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
    if (dynamicSize && item && item[dynamicSize]) {
      result =
        (settings.horizontal ? 'width' : 'height') + ': ' + item[dynamicSize] + 'px; ' +
        'overflow-' + (settings.horizontal ? 'x' : 'y') + ': hidden;';
    }
    return this.sanitizer.bypassSecurityTrustStyle(result);
  }
}

@Component({
  template: `<div
  style="height: 200px; overflow-y: scroll;"
><div
  *uiScroll="let item of datasource; let index = index"
><span>{{index}}</span> : <b>{{item.text}}</b></div></div><br><div
  style="height: 200px; overflow-y: scroll;"
><div
  *uiScroll="let item of datasource2; let index = index"
><span>{{index}}</span> : <b>{{item.text}}</b></div></div>`
})
export class TwoScrollersTestComponent implements TestComponentInterface {
  datasource = new Datasource({
    get: (index, count, success) =>
      success(Array.from({ length: count }, (j, i) =>
        ({ id: i + index, text: 'item #' + (i + index) })
      ))
  });

  datasource2 = new Datasource({
    get: (index, count, success) =>
      success(Array.from({ length: count }, (j, i) =>
        ({ id: i + index, text: 'item #' + (i + index) + ' *' })
      ))
  });
}
