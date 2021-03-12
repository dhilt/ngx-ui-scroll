import { Component } from '@angular/core';

import { demos } from '../routes';

@Component({
  selector: 'app-datasource',
  templateUrl: './datasource.component.html'
})
export class DatasourceComponent {

  demos = demos;

  constructor() {
  }

  importSample = `import { Datasource, IDatasource } from 'ngx-ui-scroll';`;
  datasourceSampleLiteral = `datasource: IDatasource = { get, settings };`;
  datasourceSampleClass = `datasource = new Datasource({ get, settings });`;

}
