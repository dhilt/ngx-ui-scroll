[![Build Status](https://travis-ci.org/dhilt/ngx-ui-scroll.svg?branch=master)](https://travis-ci.org/dhilt/ngx-ui-scroll)
[![npm version](https://badge.fury.io/js/ngx-ui-scroll.svg)](https://www.npmjs.com/package/ngx-ui-scroll) 

# NgxUiScroll

Unlimited bidirectional scrolling over limited viewport. A directive for [Angular](https://angular.io/) framework. Built with [angular-library-starter](https://github.com/robisim74/angular-library-starter). Inspired by [angular-ui-scroll](https://github.com/angular-ui/ui-scroll) (AngularJS, since 2013). Demo is available at [dhilt.github.io/ngx-ui-scroll](https://dhilt.github.io/ngx-ui-scroll/).

- [Motivation](#motivation)
- [Features](#features)
- [Getting](#getting)
- [Usage](#usage)
- [Developing](#developing)

### Motivation

Large data sets we are going to scroll through may lead to performance issues. Many DOM elements, many data-bindings, many event lesteners... The common way to improve this case is to render only a small portion of the data set which should be visible to the user and simulate (virtualize) other data set elements with upward and downward empty padding elements which should give us a consistent viewport with consistent scrollbar parameters.

The \*uiScroll is structural directive that works like \*ngFor and renders a templated element once per item from a collection. The \*uiScroll directive asks the external datasource for data to fetch and render elements until the visible part of the viewport is filled out. It will start retrieving new data to render new elements again if the user scrolls to the edge of visible element list. It dynamically destroys elements as they become invisible and recreating them if they become visible again.
<p align="center">
  <img src="https://raw.githubusercontent.com/dhilt/ngx-ui-scroll/master/demo/assets/ngx-ui-scroll-demo.gif">
</p>

### Features

 - unlimited bidirectional virtual scroll
 - lots of virtualization settings
 - super easy templating
 - infinite mode, [demo](https://dhilt.github.io/ngx-ui-scroll/#/#infinite-mode)
 - horizontal mode, [demo](https://dhilt.github.io/ngx-ui-scroll/#/#horizontal-mode)
 - entire window scrollable, [demo](https://dhilt.github.io/ngx-ui-scroll/#/#window-viewport-setting)
 - items with non-constant heights, [demo](https://dhilt.github.io/ngx-ui-scroll/#/#different-item-heights)
 - API Adapter object to manipulate and assess the scroller, [demos](https://dhilt.github.io/ngx-ui-scroll/#/adapter)

### Getting

The \*uiScroll directive is a part of UiScrollModule which is available via npm –

`npm install ngx-ui-scroll`

The UiScrollModule has to be imported in the App/feature module where it is going to be used.

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

Basic usage template may look like

```html
<div class="viewport">
  <div *uiScroll="let item of datasource">
    <b>{{item.text}}</b>
  </div>
</div>
```

where the viewport is a scrollable area of finite height.

```css
.viewport {
    height: 300px;
    overflow-y: auto;
    overflow-anchor: none;
}
```

\*uiScroll acts like \*ngFor, but the datasource is an object of special type (IDatasource) that can be imported to the host component from UiScrollModule. It implements method _get_ to be used by the \*uiScroll directive to access the data by _index_ and _count_ parameters.

```javascript
import { IDatasource } from 'ngx-ui-scroll';

export class AppComponent {

  public datasource: IDatasource = {
    get: (index, count, success) => {
      const data = [];
      for (let i = index; i <= index + count - 1; i++) {
        data.push({ text: 'item #' + i });
      }
      success(data);
    }
  };
}
```

_Datasource.get_ must provide an array of _count_ data-items started from _index_ position. _Datasource.get_ has 3 signatures: callback based, Promise based and Observable based. So, if you want some remote API to be a source of your data, basically it may look like

```javascript
  public datasource: IDatasource = {
    get: (index, count) =>
      this.http.get(`${myApiUrl}?index=${index}&count=${count}`)
  };
```

More details could be found on the [DEMO page](https://dhilt.github.io/ngx-ui-scroll/).

### Developing

There are some npm scripts available from package.json:

- `npm start` to run demo App on port 4200
- `npm test` to run Karma tests
- `npm run build` to build the ngx-ui-scroll module into the ./dist folder
- `npm run install-package` to build tar-gzipped version of package and install it locally into ./node_modules

The work has just begun. We have great plans and any participation is welcome! So, feel free to submit new issues and open Pull Requests.

__________

2018 &copy; dhilt, [Hill30 Inc](http://www.hill30.com/)
