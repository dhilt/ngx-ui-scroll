import { Component } from '@angular/core';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { IDatasource } from '../../../../public_api';

@Component({
  selector: 'app-pages-datasource',
  templateUrl: './pages-datasource.component.html'
})
export class DemoPagesDatasourceComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'datasource',
    title: `Pages datasource`,
    titleId: `pages`,
    logViewOnly: true,
    log: ''
  };

  private getCount = 0;
  private pagesCount = 30;
  private pageSize = 7;
  private data: any[];

  constructor() {
    this.data = [];
    for (let i = 0; i < this.pagesCount; i++) {
      this.data[i] = [];
      for (let j = 0; j < this.pageSize; j++) {
        const index = i * this.pageSize + j;
        this.data[i].push({
          index,
          text: `test ${index}`
        });
      }
    }
  }

  datasource: IDatasource = {
    get: (index: number, count: number, success: Function) => {
      this.getCount++;
      this.demoContext.log = '\n' + this.demoContext.log;
      this.demoContext.log = `${this.getCount}.1 index = ${index}, count = ${count}\n` + this.demoContext.log;

      // getting start/end item indexes with no negative values
      const startIndex = Math.max(index, 0);
      const endIndex = index + count - 1;
      if (startIndex > endIndex) {
        this.demoContext.log = `${this.getCount}.2 empty result\n` + this.demoContext.log;
        success([]);
        return;
      }
      this.demoContext.log = `${this.getCount}.2 requesting items [${startIndex}..${endIndex}]\n` + this.demoContext.log;

      // getting start/end page numbers
      const startPage = Math.floor(startIndex / this.pageSize);
      const endPage = Math.floor(endIndex / this.pageSize);

      // retrieving pages items
      let pagesResult: any[] = [];
      const logPages = [];
      for (let i = startPage; i <= endPage; i++) {
        logPages.push(i);
        pagesResult = [...pagesResult, ...this.getDataPage(i)];
      }
      this.demoContext.log = `${this.getCount}.3 requesting pages: ${logPages.join(', ')}\n` + this.demoContext.log;
      this.demoContext.log = `${this.getCount}.4 ` + (!pagesResult.length ? 'empty result' :
          `pages result [${pagesResult[0].index}..${pagesResult[pagesResult.length - 1].index}]`
      ) + '\n' + this.demoContext.log;

      // slicing pages result to satisfy start/end indexes
      const start = startIndex - startPage * this.pageSize;
      const end = start + endIndex - startIndex + 1;
      const data = pagesResult.slice(start, end);
      this.demoContext.log = (!data.length ? '' :
          `${this.getCount}.5 sliced result [${data[0].index}..${data[data.length - 1].index}]\n`
      ) + this.demoContext.log;

      success(data);
    },
    settings: {
      startIndex: 0
    }
  };

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: `datasource: IDatasource = {
  get: (index, count, success) => {
    // items to request (x.2)
    const startIndex = Math.max(index, 0);
    const endIndex = index + count - 1;
    if (startIndex > endIndex) {
      success([]); // empty result
      return;
    }

    // pages to request (x.3)
    const startPage = Math.floor(startIndex / this.pageSize);
    const endPage = Math.floor(endIndex / this.pageSize);

    // pages result (x.4)
    let pagesResult: any[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pagesResult = [...pagesResult, ...this.getDataPage(i)];
    }

    // sliced result (x.5)
    const start = startIndex - startPage * this.pageSize;
    const end = start + endIndex - startIndex + 1;
    const data = pagesResult.slice(start, end);

    success(data);
  },
  settings: {
    startIndex: 0
  }
};

pagesCount = 30;
pageSize = 7;
data: any[];

constructor() {
  this.data = [];
  for (let i = 0; i < this.pagesCount; i++) {
    this.data[i] = [];
    for (let j = 0; j < this.pageSize; j++) {
      const index = i * this.pageSize + j;
      this.data[i].push({
        index,
        text: 'test ' + index
      });
    }
  }
}

getDataPage(page: number) {
  if (page < 0 || page >= this.pagesCount) {
    return [];
  }
  return this.data[page];
}`
  },
    {
      name: DemoSourceType.Component + ' (async)',
      text: `datasource: IDatasource = {
  get: (index, count, success) => {
    const startIndex = Math.max(index, 0);
    const endIndex = index + count - 1;
    if (startIndex > endIndex) {
      success([]); // empty result
      return;
    }

    const startPage = Math.floor(startIndex / this.pageSize);
    const endPage = Math.floor(endIndex / this.pageSize);

    const pagesRequest: any[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pagesRequest.push(
        this.remoteDataService.getDataPageAsync(i)
      );
    }
    return Promise.all(pagesRequest).then(pagesResult => {
      pagesResult = pagesResult.reduce((acc, result) =>
        [...acc, ...result]
      , []);
      const start = startIndex - startPage * this.pageSize;
      const end = start + endIndex - startIndex + 1;
      return pagesResult.slice(start, end);
    });
  },
  settings: {
    startIndex: 0
  }
};

constructor(
  private remoteDataService: RemoteDataService
) {
}`
    }];

  getDataPage(page: number) {
    if (page < 0 || page >= this.pagesCount) {
      return [];
    }
    return this.data[page];
  }

}
