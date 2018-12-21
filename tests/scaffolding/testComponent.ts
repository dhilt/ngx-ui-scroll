import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Datasource } from '../../src/component/interfaces';

import { DatasourceService } from './datasources';
import { defaultTemplate, TemplateSettings } from './templates';

export interface TestComponentInterface {
  datasource: Datasource;
}

@Component({
  template: defaultTemplate,
  providers: [DatasourceService]
})
export class TestComponent implements TestComponentInterface {
  datasource: Datasource;
  templateSettings: TemplateSettings;

  constructor(
    private sanitizer: DomSanitizer,
    datasourceService: DatasourceService
  ) {
    this.datasource = <Datasource>datasourceService;
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
