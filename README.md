[![Build Status](https://travis-ci.org/dhilt/ngx-ui-scroll.svg?branch=master)](https://travis-ci.org/dhilt/ngx-ui-scroll) 

# NgxUiScroll

Unlimited bidirectional scrolling over limited viewport. A directive for [Angular](https://angular.io/ "Angular") framework. Built with [angular-library-starter](https://github.com/robisim74/angular-library-starter). Inspired by [angular-ui-scroll](https://github.com/angular-ui/ui-scroll) (AngularJS, since 2013). Demo is available at [dhilt.github.io/ngx-ui-scroll](https://dhilt.github.io/ngx-ui-scroll/).

- [Motivation](#motivation)
- [Getting](#getting)
- [Usage](#usage)
- [Developing](#developing)

### Motivation

The common way to present a list of data elements of undefined length is to start with a small portion - just enough to fill the space on the page. Additional blocks are added to the list as the user scrolls to the edge of the list. The problem with this approach is that even though blocks at the edge of the list become invisible as they scroll out of the view, they are still a part of the page and still consume resources.

The \*uiScroll directive dynamically destroys elements as they become invisible and recreating them if they become visible again. This is structural directive that works like \*ngFor and instantiates a template once per item from a collection. The \*uiScroll directive is asking the datasource for data to build and render elements until it has enough elements to fill out the viewport. It will start retrieving new data for new elements again if the user scrolls to the edge of visible element list.
<p align="center">
  <img src="https://raw.githubusercontent.com/dhilt/ngx-ui-scroll/master/demo/assets/ngx-ui-scroll-demo.gif">
</p>

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

\*uiScroll acts like \*ngFor, but the datasource is an object of special type Datasource that can be imported to the host component from UiScrollModule. It implements method _get_ to be used by the \*uiScroll directive to access the data by _index_ and _count_ parameters.

```javascript
import { Datasource } from 'ngx-ui-scroll';

export class AppComponent {

  public datasource: Datasource = {
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
  public datasource: Datasource = {
    get: (index, count) =>
      this.http.get(`${myApiUrl}?index=${index}&count=${count}`)
  };
```

More details could be found at the API section (in progress) and on the [DEMO page](https://dhilt.github.io/ngx-ui-scroll/).

### Developing

The work has just begun. We have great plans and any participation is welcome! So, feel free to submit new issues and open PRs.

There are some npm scripts available from package.json:

- `npm start` to run demo App on port 4200
- `npm test` to run Karma tests
- `npm run build` to build the ngx-ui-scroll module into the ./dist folder
- `npm run install-package` to build tar-gzipped version of package and install it locally into ./node_modules

