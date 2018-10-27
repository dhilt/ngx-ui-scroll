import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../../shared/interfaces';
import { Observable, Observer } from 'rxjs/index';

@Component({
  selector: 'app-datasource-signatures',
  templateUrl: './datasource-signatures.component.html'
})
export class DemoDatasourceSignaturesComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'datasource',
    title: `Datasource get-method signatures`,
    titleId: `datasource-get-signatures`,
    noWorkView: true,
    datasourceTabOnly: true
  };

  sources: DemoSources = {
    datasource: `datasourceCallback: IDatasource = {
  get: (index, count, success) =>
    success(this.getData(index, count))
};

datasourcePromise: IDatasource = {
  get: (index, count) => new Promise(resolve =>
    resolve(this.getData(index, count))
  )
};

datasourceObservable: IDatasource = {
  get: (index, count) => Observable.create(observer =>
    observer.next(this.getData(index, count))
};

datasourcePromise2: IDatasource = {
  get: (index, count) =>
    this.getDataPromise(index, count)
};

datasourceObservable2: IDatasource = {
  get: (index, count) =>
    this.getDataObservable(index, count)
};`
  };

}
