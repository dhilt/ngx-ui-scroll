[![Build Status](https://travis-ci.org/dhilt/ngx-ui-scroll.svg?branch=master)](https://travis-ci.org/dhilt/ngx-ui-scroll) 

# NgxUiScroll

Unlimited bidirectional scrolling over limited viewport. A directive for [Angular](https://angular.io/ "Angular") framework. Built with [angular-library-starter](https://github.com/robisim74/angular-library-starter). AngularJS version: [angular-ui-scroll](https://github.com/angular-ui/ui-scroll).

- [Motivation](#motivation)
- [Getting](#getting)
- [Usage](#usage)
- [Developing](#developing)

### Motivation

The common way to present a list of data elements of undefined length is to start with a small portion - just enough to fill the space on the page. Additional blocks are added to the list as the user scrolls to the edge of the list. The problem with this approach is that even though blocks at the edge of the list become invisible as they scroll out of the view, they are still a part of the page and still consume resources.

The \*uiScroll directive dynamically destroys elements as they become invisible and recreating them if they become visible again. This is structural directive that works like \*ngFor and instantiates a template once per item from a collection. The \*uiScroll directive is asking the datasource for data to build and render elements until it has enough elements to fill out the viewport. It will start retrieving new data for new elements again if the user scrolls to the edge of visible element list.

![](https://raw.githubusercontent.com/angular-ui/ui-scroll/master/demo/ui-scroll-demo.gif)

### Getting

The UiScrollModule is available via npm –

`npm install ngx-ui-scroll`

It should be imported in the App/feature module where it is going to be used.

```javascript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { UiScrollModule } from 'ngx-ui-scroll';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    UiScrollModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Usage


### Developing

Any participation is welcome! There are some npm scripts available package.json:

- `npm start` to run demo App on port 4200
- `npm test` to run Karma tests
- `npm run build` to build the ngx-ui-scroll module into the ./dist folder
- `npm run install-package` to build tar-gzipped version of package and install it into ./node_modules

