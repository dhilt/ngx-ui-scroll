// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp
  ): {
    keys(): string[];
    <T>(id: string): T;
  };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  { teardown: { destroyAfterEach: true } }
);

// Then we find all the tests.
const context = require.context(
  './',
  false,
  /\.spec\.ts/
  //(adapter-promises)\.spec\.ts/
  //(adapter\.append-prepend)\.spec\.ts/
  //(adapter\.check)\.spec\.ts/
  //(adapter\.clip)\.spec\.ts/
  //(adapter\.insert)\.spec\.ts/
  //(adapter\.prepend)\.spec\.ts/
  //(adapter\.reload)\.spec\.ts/
  //(adapter\.remove)\.spec\.ts/
  //(adapter\.replace)\.spec\.ts/
  //(adapter\.reset-persistence)\.spec\.ts/
  //(adapter\.reset)\.spec\.ts/
  //(adapter\.update)\.spec\.ts/
  //(bug)\.spec\.ts/
  //(common)\.spec\.ts/
  //(datasource)\.spec\.ts/
  //(direction-priority)\.spec\.ts/
  //(dynamic-height-reload)\.spec\.ts/
  //(dynamic-height-scroll)\.spec\.ts/
  //(dynamic-height-update)\.spec\.ts/
  //(dynamic-size\.average)\.spec\.ts/
  //(dynamic-size\.frequent)\.spec\.ts/
  //(dynamic-size\.zero)\.spec\.ts/
  //(eof)\.spec\.ts/
  //(initial-load)\.spec\.ts/
  //(min-max-indexes)\.spec\.ts/
  //(recreation)\.spec\.ts/
  //(scroll-basic)\.spec\.ts/
  //(scroll-delay)\.spec\.ts/
  //(scroll-fast)\.spec\.ts/
  //(viewport)\.spec\.ts/
);

context.keys().map(context);
