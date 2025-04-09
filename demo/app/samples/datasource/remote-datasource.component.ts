import { Component, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { demos } from '../../routes';
import { DemoSources, DemoSourceType } from '../../shared/interfaces';

import { IDatasource } from 'ngx-ui-scroll';

@Injectable()
export class RemoteDataService {
  constructor(private http: HttpClient) {}

  getData(index: number, count: number): Observable<unknown> {
    return this.http.get(`/api/data?index=${index}&count=${count}`);
  }
}

@Component({
  selector: 'app-remote-datasource',
  templateUrl: './remote-datasource.component.html',
  standalone: false
})
export class DemoRemoteDatasourceComponent {
  demoContext = {
    config: demos.datasource.map.remote,
    logViewOnly: true,
    log: '',
    count: 0
  };

  datasource: IDatasource = {
    get: (index: number, count: number) => {
      this.demoContext.log = `${++this.demoContext
        .count}) get items [${index}..${index + count - 1}]
${this.demoContext.log}`;
      return this.remoteDataService.getData(index, count);
    }
  };

  sources: DemoSources = [
    {
      name: 'Service/Component',
      text: `@Injectable()
export class RemoteDataService {

  constructor(private http: HttpClient) {
  }

  getData(index: number, count: number): Observable<any> {
    return this.http.get(
      \`/api/data?index=\${index}&count=\${count}\`
    );
  }
}

@Component(...)
export class DemoRemoteDatasourceComponent {

  datasource: IDatasource = {
    get: (index, count) =>
      this.remoteDataService.getData(index, count)
  };

  constructor(private remoteDataService: RemoteDataService) {
  }
}`
    },
    {
      name: DemoSourceType.Server,
      text: `const MIN = -99;
const MAX = 900;

app.get('/api/data', (req, res) => {
  const index = parseInt(req.query.index, 10);
  const count = parseInt(req.query.count, 10);
  if (isNaN(index) || isNaN(count)) {
    return res.send([]);
  }
  const start = Math.max(MIN, index);
  const end = Math.min(index + count - 1, MAX);
  if (start > end) {
    return res.send([]);
  }
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push({ id: i, text: 'item #' + i });
  }
  res.send(result);
});`
    }
  ];

  constructor(private remoteDataService: RemoteDataService) {}
}
