import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Datasource } from '../../public_api';
// import { Datasource } from 'ngx-ui-scroll';

const getData = (index: number, count: number) => {
  console.log('requested index = ' + index + ', count = ' + count);
  let data = [];
  for (let i = index; i <= index + count - 1; i++) {
    data.push({
      id: i,
      text: "item #" + i
    });
  }
  return data;
};

const min = 1, max = 100;

const getDataLimited = (index: number, count: number) => {
  console.log('requested index = ' + index + ', count = ' + count);
  let data = [];
  const start = Math.max(min, index);
  const end = Math.min(index + count - 1, max);
  if (start <= end) {
    for (let i = start; i <= end; i++) {
      data.push({
        id: i,
        text: "item #" + i
      });
    }
  }
  return data;
};

const datasourceGet = {
  'callback': (index: number, count: number, success) => {
    setTimeout(() => success(getData(index, count)), 50);
  },
  'observable': (index: number, count: number) => Observable.create(observer => {
    setTimeout(() => observer.next(getData(index, count)), 100);
  }),
  'promise': (index: number, count: number) => new Promise((resolve, reject) => {
    setTimeout(() => resolve(getData(index, count)), 100);
  }),
  'promiseLimited': (index: number, count: number) => new Promise((resolve, reject) => {
    setTimeout(() => resolve(getDataLimited(index, count)), 0);
  })
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  elements(token: string): string {
    const element = document.getElementById(token);
    if(!element) {
      return '';
    }
    const count = element.children[0].childElementCount || 0;
    return (count - 2).toString(10);
  }

  // basic demo

  countBasic: number = 0;
  logBasic: string = '';

  datasourceBasic: Datasource = {
    get: (index, count, success) => {
      this.logBasic = `${++this.countBasic}) get 5 items [${index}, ${index + count - 1}]\n` + this.logBasic;
      const data = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      success(data);
    }
  };

  // bufferSize setting demo

  countBuffer: number = 0;
  logBuffer: string = '';

  datasourceBuffer: Datasource = {
    get: (index, count, success) => {
      this.logBuffer = `${++this.countBuffer}) get 15 items [${index}, ${index + count - 1}]\n` + this.logBuffer;
      const data = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      success(data);
    },
    settings: {
      bufferSize: 15
    }
  };

  // padding setting demo

  countPadding: number = 0;
  logPadding: string = '';

  datasourcePadding: Datasource = {
    get: (index, count, success) => {
      this.logPadding = `${++this.countPadding}) get 5 items [${index}, ${index + count - 1}]\n` + this.logPadding;
      const data = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      success(data);
    },
    settings: {
      bufferSize: 5,
      padding: 1.5
    }
  };

  // infinite setting demo

  countInfinite: number = 0;
  logInfinite: string = '';

  datasourceInfinite: Datasource = {
    get: (index, count, success) => {
      this.logInfinite = `${++this.countInfinite}) get 5 items [${index}, ${index + count - 1}]\n` + this.logInfinite;
      const data = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      success(data);
    },
    settings: {
      infinite: true
    }
  };

  constructor() {
  }

}
