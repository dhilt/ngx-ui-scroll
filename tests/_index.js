import 'core-js';
import 'zone.js/dist/zone';
import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy.js';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/jasmine-patch';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

import 'rxjs';
import { config } from 'rxjs';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

const testContext = require.context(
  './',
  false,
  /\.spec\.ts/
  //(adapter\-promises)\.spec\.ts/
  //(adapter\.append\-prepend)\.spec\.ts/
  //(adapter\.check)\.spec\.ts/
  //(adapter\.clip)\.spec\.ts/
  //(adapter\.insert)\.spec\.ts/
  //(adapter\.prepend)\.spec\.ts/
  //(adapter\.reload)\.spec\.ts/
  //(adapter\.remove)\.spec\.ts/
  //(adapter\.reset\-persistence)\.spec\.ts/
  //(adapter\.reset)\.spec\.ts/
  //(bug)\.spec\.ts/
  //(common)\.spec\.ts/
  //(datasource\-get)\.spec\.ts/
  //(dynamic\-height\-reload)\.spec\.ts/
  //(dynamic\-height\-scroll)\.spec\.ts/
  //(dynamic\-size)\.spec\.ts/
  //(eof)\.spec\.ts/
  //(initial\-load)\.spec\.ts/
  //(min\-max\-indexes)\.spec\.ts/
  //(scroll\-basic)\.spec\.ts/
  //(scroll\-delay)\.spec\.ts/
  //(scroll\-fast)\.spec\.ts/
  //(validation)\.spec\.ts/
);

testContext.keys().map(testContext);
