import { Component } from '@angular/core';
import { Datasource } from'../../../public_api';

@Component({
  selector: 'app-datasource',
  templateUrl: './datasource.component.html'
})
export class DatasourceComponent {

  constructor() {
  }

  importSample = `import { Datasource, IDatasource } from 'ngx-ui-scroll';`;
  datasourceSampleLiteral = `
datasource: IDatasource = { ... };`;
  datasourceSampleClass = `
datasource = new Datasource({ ... });`;

}
