[![ngx-ui-scroll CI](https://github.com/dhilt/ngx-ui-scroll/actions/workflows/ci.yml/badge.svg)](https://github.com/dhilt/ngx-ui-scroll/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/ngx-ui-scroll.svg)](https://www.npmjs.com/package/ngx-ui-scroll)

# ngx-ui-scroll

A directive for [Angular](https://angular.io/) framework to provide unlimited bidirectional virtual scrolling over limited viewport. Built on top of [vscroll](https://github.com/dhilt/vscroll) native virtual scrolling engine. Demo is available at [dhilt.github.io/ngx-ui-scroll](https://dhilt.github.io/ngx-ui-scroll/). 

<p dir="rtl">
<sub>can donate? go <b><a href="https://github.com/dhilt/ngx-ui-scroll?sponsor=1">here</a></b></sub><sub> 👉 <br>make open-source world better</sub></p>

- [Motivation](#motivation)
- [Features](#features)
- [Getting](#getting)
- [Usage](#usage)
- [Settings](#settings)
- [Adapter API](#adapter-api)
- [Compatibility](#compatibility)
- [Development](#development)
<br>

### Motivation

Scrolling large datasets may cause performance issues. Many DOM elements, many data-bindings, many event listeners... The common way to improve the performance is to render only a small portion of the dataset visible to a user. Other dataset elements that are not visible to a user are virtualized with upward and downward empty padding elements which should provide a consistent viewport with consistent scrollbar parameters.

The ngx-ui-scroll library provides the \*uiScroll structural directive that works like \*ngFor and renders a templated element once per item from a collection. By requesting the external Datasource (the implementation of which is a developer responsibility) the \*uiScroll directive fetches necessary portion of the dataset and renders corresponded elements until the visible part of the viewport is filled out. It starts to retrieve new data to render new elements again if a user scrolls to the edge of visible element list. It dynamically destroys elements as they become invisible and recreates them if they become visible again.
<p align="center">
  <img src="https://raw.githubusercontent.com/dhilt/ngx-ui-scroll/master/demo/assets/ngx-ui-scroll-demo.gif">
</p>

### Features

 - unlimited bidirectional virtual scroll
 - lots of virtualization settings
 - super easy templating
 - infinite mode, [demo](https://dhilt.github.io/ngx-ui-scroll/#settings#infinite-mode)
 - horizontal mode, [demo](https://dhilt.github.io/ngx-ui-scroll/#settings#horizontal-mode)
 - entire window scrollable, [demo](https://dhilt.github.io/ngx-ui-scroll/#settings#window-viewport)
 - items with non-constant heights, [demo](https://dhilt.github.io/ngx-ui-scroll/#settings#different-item-heights)
 - API Adapter object to manipulate and assess the Scroller, [demos](https://dhilt.github.io/ngx-ui-scroll/#adapter)

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

where the viewport is a scrollable area of finite height:

```css
.viewport {
    height: 300px;
    overflow-y: auto;
}
```

If the height of the viewport is not constrained, it will pull the entire content of the datasource and no scrollbar will appear.

\*uiScroll acts like \*ngFor in its simplest form, where the datasource is an object of special type (IDatasource), which implements the _get_ method used by the \*uiScroll directive to access data by _index_ and _count_ parameters. The directive calls the `Datasource.get` method each time the user scrolls the list of visible elements to the edge.

```javascript
import { IDatasource } from 'ngx-ui-scroll';

@Component({ ... })
export class AppComponent {
  datasource: IDatasource = {
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

_Datasource.get_ method must provide an array of _count_ data-items started from _index_ position. If there are no items within given range _[index; index + count - 1]_, an empty array has to be passed. Empty result (or result which length is less than _count_) is being treated as the edge of the dataset (eof/bof), and no further requests for preceding/tailing items will be issued.

_Datasource.get_ has 3 signatures: callback based, Promise based and Observable based. So, if we want some remote API to be a source of our data, basically it may look like

```javascript
  datasource: IDatasource = {
    get: (index, count) =>
      this.http.get(`${myApiUrl}?index=${index}&count=${count}`)
  };
``` 

More details could be found on the [Datasource demo page](https://dhilt.github.io/ngx-ui-scroll/#datasource).

### Settings

Datasource implementation along with _get_ method property may include _settings_ object property:

```javascript
  datasource: IDatasource = {
    get: ...,
    settings: {
      minIndex: 0,
      startIndex: 0,
      ...
    }
  };
```

Settings are being applied during the Scroller initialization and have an impact on how the Scroller behaves. Below is the list of available settings with descriptions, defaults, types and demos.

|Name|Type|Default|Description|
|:--|:----:|:----------:|:----------|
|[bufferSize](https://dhilt.github.io/ngx-ui-scroll/#settings#buffer-size)|number,<br>integer|5| Fixes minimal size of the pack of the datasource items to be requested per single _Datasource.get_ call. Can't be less than 1. |
|[padding](https://dhilt.github.io/ngx-ui-scroll/#settings#padding)|number,<br>float|0.5| Determines the viewport outlets containing real but not visible items. The value is relative to the viewport's size. For example, 0.25 means that there will be as many items at a moment as needed to fill out 100% of the visible part of the viewport, + 25% of the viewport size in the backward direction and + 25% in the forward direction. The value can't be less than 0.01. |
|[startIndex](https://dhilt.github.io/ngx-ui-scroll/#settings#start-index)|number,<br>integer|1| Specifies item index to be requested/rendered first. Can be any, but the real datasource boundaries should be taken into account. |
|[minIndex](https://dhilt.github.io/ngx-ui-scroll/#settings#min-max-indexes)|number,<br>integer|-Infinity| Fixes absolute minimal index of the dataset. The datasource left boundary. |
|[maxIndex](https://dhilt.github.io/ngx-ui-scroll/#settings#min-max-indexes)|number,<br>integer|+Infinity| Fixes absolute maximal index of the dataset. The datasource right boundary. |
|[infinite](https://dhilt.github.io/ngx-ui-scroll/#settings#infinite-mode)|boolean|false| Enables "infinite" mode, when items rendered once are never removed. |
|[horizontal](https://dhilt.github.io/ngx-ui-scroll/#settings#horizontal-mode)|boolean|false| Enables "horizontal" mode, when the viewport's orientation is horizontal. |
|[sizeStrategy](https://dhilt.github.io/ngx-ui-scroll/#settings#different-item-heights)|string&nbsp;enum, 'average'&nbsp;&#124; 'frequent'&nbsp;&#124; 'constant' | 'average' | Defines how the default item size is calculated. If item has never been rendered, its size is assumed to be the default size: an average or most frequent among all items that have been rendered before, or constant. This has an impact on the process of virtualization. |
|[windowViewport](https://dhilt.github.io/ngx-ui-scroll/#settings#window-viewport)|boolean|false| Enables "entire window scrollable" mode, when the entire window becomes the scrollable viewport. |

### Adapter API

The Scroller has API to assess its parameters and provide some manipulations at runtime. This API is available via special Adapter object. The datasource needs to be instantiated via operator "new" for the Adapter object to be added to it:

```javascript
import { Datasource } from 'ngx-ui-scroll';
...
  datasource = new Datasource({
    get: ... ,
    settings: { ... }
  });
```

Then `this.datasource.adapter.packageInfo`, `this.datasource.adapter.reload()` and other Adapter expressions become available. For better typing, it is recommended to specify the Datasource Item type as follows:

```typescript
import { Datasource } from 'ngx-ui-scroll';
...
  datasource = new Datasource<MyItem>({
    get: ... ,
    settings: { ... }
  });
```

`MyItem` should reflect the structure of items that the Datasource will deal with. It is "unknown" by default, and if not set, for example, `this.datasource.adapter.firstVisible.data.id` expression will produce typescript error: Object is of type 'unknown'. There are some Adapter props and methods dealing with `MyItem`, and if used, `MyItem` should be specified.

Below is the list of read-only properties of the Adapter API with descriptions and links to demos.

|Name|Type|Description|
|:--|:----|:----------|
|[packageInfo](https://dhilt.github.io/ngx-ui-scroll/#adapter#package-info)|IPackages {<br>&nbsp;&nbsp;consumer: IPackage;<br>&nbsp;&nbsp;core: IPackage;<br>}<br><br>IPackage {<br>&nbsp;&nbsp;name: string;<br>&nbsp;&nbsp;version: string<br>}|Information about versions of the library ant its core. For example: "ngx-ui-scroll" v3.1.0 (consumer), "vscroll" v1.5.5 (core).|
|[init](https://dhilt.github.io/ngx-ui-scroll/#adapter#init)|boolean|Indicates whether the Scroller is initialized ot not. |
|[init$](https://dhilt.github.io/ngx-ui-scroll/#adapter#init)|Subject&lt;boolean&gt;|An Observable version of "init" property. |
|[isLoading](https://dhilt.github.io/ngx-ui-scroll/#adapter#is-loading)|boolean|Indicates whether the Scroller is working ot not. |
|[isLoading$](https://dhilt.github.io/ngx-ui-scroll/#adapter#is-loading)|Subject&lt;boolean&gt;|An Observable version of "isLoading" property. |
|[itemsCount](https://dhilt.github.io/ngx-ui-scroll/#adapter#items-count)|number|A number of items that are rendered in the viewport at a moment.|
|[bufferInfo](https://dhilt.github.io/ngx-ui-scroll/#adapter#buffer-info)|IBufferInfo {<br>&nbsp;&nbsp;firstIndex:&nbsp;number;<br>&nbsp;&nbsp;lastIndex:&nbsp;number;<br>&nbsp;&nbsp;minIndex:&nbsp;number;<br>&nbsp;&nbsp;maxIndex:&nbsp;number;<br>&nbsp;&nbsp;absMinIndex:&nbsp;number;<br>&nbsp;&nbsp;absMaxIndex:&nbsp;number;<br>}|<li>firstIndex & lastIndex are the first and the last indexes in the current Buffer.</li><li>minIndex & maxIndex are min and max indexes that were present in the Buffer.</li><li>absMinIndex & absMaxIndex are min and max indexes that can be present in the Buffer.</li>|
|[bof](https://dhilt.github.io/ngx-ui-scroll/#adapter#bof-eof)|boolean|Indicates whether the beginning of the dataset is reached or not.|
|[bof$](https://dhilt.github.io/ngx-ui-scroll/#adapter#bof-eof)|Subject&lt;boolean&gt;|An Observable version of "bof" property.|
|[eof](https://dhilt.github.io/ngx-ui-scroll/#adapter#bof-eof)|boolean|Indicates whether the end of the dataset is reached or not.|
|[eof$](https://dhilt.github.io/ngx-ui-scroll/#adapter#bof-eof)|Subject&lt;boolean&gt;|An Observable version of "eof" property.|
|[firstVisible](https://dhilt.github.io/ngx-ui-scroll/#adapter#first-last-visible-items)|ItemAdapter&lt;MyItem&gt; {<br>&nbsp;&nbsp;$index:&nbsp;number;<br>&nbsp;&nbsp;data:&nbsp;MyItem;<br>&nbsp;&nbsp;element?:&nbsp;HTMLElement;<br>}|Object of ItemAdapter type containing information about first visible item, where "$index" corresponds to the Datasource item index value, "data" is exactly the item's content passed via Datasource, "element" is a link to DOM element which is relevant to the item. |
|[firstVisible$](https://dhilt.github.io/ngx-ui-scroll/#adapter#first-last-visible-items)|BehaviorSubject<br>&lt;ItemAdapter&lt;MyItem&gt;&gt;|An observable version of "firstVisible" property. |
|[lastVisible](https://dhilt.github.io/ngx-ui-scroll/#adapter#first-last-visible-items)|ItemAdapter&lt;MyItem&gt; {<br>&nbsp;&nbsp;$index:&nbsp;number;<br>&nbsp;&nbsp;data:&nbsp;MyItem;<br>&nbsp;&nbsp;element?:&nbsp;HTMLElement;<br>}|Object of ItemAdapter type containing information about last visible item. |
|[lastVisible$](https://dhilt.github.io/ngx-ui-scroll/#adapter#first-last-visible-items)|BehaviorSubject<br>&lt;ItemAdapter&lt;MyItem&gt;&gt;|An observable version of "lastVisible" property. |
|[paused](https://dhilt.github.io/ngx-ui-scroll/#adapter#pause-resume)|boolean|Indicates whether the Scroller is paused ot not. |
|[paused$](https://dhilt.github.io/ngx-ui-scroll/#adapter#pause-resume)|Subject&lt;boolean&gt;|An Observable version of "paused" property. |

Below is the list of invocable methods of the Adapter API with description and links to demos.

|Name|Parameters|Description|
|:--|:----|:----------|
|[relax](https://dhilt.github.io/ngx-ui-scroll/#adapter#relax)|(callback?: Function)|Resolves asynchronously when there are no pending processes. If the _callback_ is set, it will be executed right before resolving. Basically, it needs to protect with the _relax_ every piece of the App logic, that might be sensitive to the internal processes of the Scroller, to avoid interference and race conditions. Also, every Adapter method returns the same promise as the _relax_ method, so for example, explicitly waiting for the async result of the _append_ method is equivalent to waiting for the async result of the _relax_ method right after synchronous calling the _append_ method. |
|[reload](https://dhilt.github.io/ngx-ui-scroll/#adapter#reload)|(startIndex?:&nbsp;number)|Resets the items buffer, resets the viewport params and starts fetching items from _startIndex_ (if set). |
|[reset](https://dhilt.github.io/ngx-ui-scroll/#adapter#reset)|(datasource?: IDatasource)|Performs hard reset of the Scroller's internal state by re-instantiating all its entities (instead of reusing them when _reload_). If _datasource_ argument is passed, it will be treated as new Datasource. All props of the _datasource_ are optional and the result Datasource will be a combination (merge) of the original one and the one passed as an argument. |
|[pause](https://dhilt.github.io/ngx-ui-scroll/#adapter#pause-resume)| |Pauses the Scroller, so the scroll events are not processed by the engine. Also, when paused, the Adapter methods do nothing but resolve immediately without affecting UI (except Adapter.resume and Adapter.reset). |
|[resume](https://dhilt.github.io/ngx-ui-scroll/#adapter#pause-resume)| |Resumes the Scroller if it was paused. |
|[check](https://dhilt.github.io/ngx-ui-scroll/#adapter#check-size)| |Checks if any of current items changed it's size and runs a procedure to provide internal consistency and new items fetching if needed. |
|[clip](https://dhilt.github.io/ngx-ui-scroll/#adapter#clip)|(options: {<br>&nbsp;&nbsp;forwardOnly?:&nbsp;boolean,<br>&nbsp;&nbsp;backwardOnly?:&nbsp;boolean<br>})|Removes out-of-viewport items on demand. The direction in which invisible items should be clipped can be specified by passing an options object. If no options is passed (or both properties are set to _true_), clipping will occur in both directions. |
|[append](https://dhilt.github.io/ngx-ui-scroll/#adapter#append-prepend)|(options: {<br>&nbsp;&nbsp;items:&nbsp;MyItem[],<br>&nbsp;&nbsp;eof?:&nbsp;boolean,<br>&nbsp;&nbsp;virtualize?:&nbsp;boolean<br>&nbsp;&nbsp;decrease?:&nbsp;boolean<br>})|Adds _items_ to the end of the Scroller's buffer. If neither _eof_ nor _virtualize_ flag is set, items are inserted and rendered after the last item in the DOM. If _eof_ is _true_, rendering occurs only when the right border of the buffer aligns with the right border of the dataset (end-of-file is reached). Otherwise, items are added to the dataset but not rendered (they are virtualized). Setting the _virtualize_ flag instead of _eof_ enables hard virtualization: new _items_ will be virtualized even if EOF has been reached. Only one of the _eof_ or _virtualize_ flags can be used at a time. Indexes increase by default. If _decrease_ is set to true, indexes are decremented. See also [bof/eof](https://dhilt.github.io/ngx-ui-scroll/#adapter#bof-eof). |
|[prepend](https://dhilt.github.io/ngx-ui-scroll/#adapter#append-prepend)|(options: {<br>&nbsp;&nbsp;items:&nbsp;MyItem[],<br>&nbsp;&nbsp;bof?:&nbsp;boolean,<br>&nbsp;&nbsp;virtualize?:&nbsp;boolean<br>&nbsp;&nbsp;increase?:&nbsp;boolean<br>})|Adds _items_ to the beginning of the Scroller's buffer. If neither _bof_ nor _virtualize_ flag is set, items are inserted and rendered before the first item in the DOM. If _bof_ is true, rendering occurs only when the left border of the buffer aligns with the left border of the dataset (begin-of-file is reached). Otherwise, items are added to the dataset but not rendered (they are virtualized). Setting the _virtualize_ flag instead of _bof_ enables hard virtualization: new items will be virtualized even if BOF has been reached. Only one of the _bof_ or _virtualize_ flags can be used at a time. Indexes decrease by default. If _increase_ is set to true, indexes are decremented. For historical reasons, items are reversed when performing the prepend operation. To maintain the original order when prepending items, you can either reverse the array before calling Adapter.prepend, or use the Adapter.insert method instead. See also [bof/eof](https://dhilt.github.io/ngx-ui-scroll/#adapter#bof-eof). |
|[insert](https://dhilt.github.io/ngx-ui-scroll/#adapter#insert)|(options: {<br>&nbsp;&nbsp;items:&nbsp;MyItem[],<br>&nbsp;&nbsp;before?:&nbsp;ItemsPredicate,<br>&nbsp;&nbsp;after?:&nbsp;ItemsPredicate,<br>&nbsp;&nbsp;beforeIndex?:&nbsp;number,<br>&nbsp;&nbsp;afterIndex?:&nbsp;number,<br>&nbsp;&nbsp;decrease?:&nbsp;boolean<br>})|Inserts _items_ into the buffer or virtually. Only one of the _before_, _after_, _beforeIndex_ and _afterIndex_ options is allowed. If _before_ or _after_ option is used, the Scroller will try to insert items before or after the item that presents in the buffer and satisfies the predicate condition. If _beforeIndex_ or _afterIndex_ option is used, the Scroller will try to insert items by index. If the index to insert is out of the buffer but still belongs to the known datasource boundaries, then the _items_ will be virtualized. Indexes increase by default. Decreasing strategy can be enabled via _decrease_ option. |
|[remove](https://dhilt.github.io/ngx-ui-scroll/#adapter#remove)|(options: {<br>&nbsp;&nbsp;predicate?:&nbsp;ItemsPredicate,<br>&nbsp;&nbsp;indexes?:&nbsp;number[],<br>&nbsp;&nbsp;increase?:&nbsp;boolean<br>}) <br><br> type&nbsp;ItemsPredicate&nbsp;=<br>&nbsp;&nbsp;(item: ItemAdapter)&nbsp;=><br>&nbsp;&nbsp;&nbsp;&nbsp;boolean|Removes items form buffer and/or virtually. Predicate is a function to be applied to every item presently in the buffer. Predicate must return a boolean value. If predicate's return value is true, the item will be removed. Alternatively, if _indexes_ array is passed, the items whose indexes match the list will be removed. Only one of the _predicate_ and _indexes_ options is allowed. In case of _indexes_, the deletion is performed also virtually. By default, indexes of the items following the deleted ones are decremented. Instead, if _increase_ is set to _true_, the indexes of the items before the removed ones are incremented. |
|[replace](https://dhilt.github.io/ngx-ui-scroll/#adapter#replace)|(options: {<br>&nbsp;&nbsp;predicate:&nbsp;ItemsPredicate,<br>&nbsp;&nbsp;items:&nbsp;MyItem[],<br>&nbsp;&nbsp;fixRight?:&nbsp;boolean<br>})|Replaces items that continuously match the _predicate_ with an array of new _items_. Indexes are maintained on the assumption that the left border of the dataset is fixed. To release the left border and fix the right one the _fixRight_ option should be set to _true_. |
|[update](https://dhilt.github.io/ngx-ui-scroll/#adapter#update)|(options: {<br>&nbsp;&nbsp;predicate:&nbsp;BufferUpdater,<br>&nbsp;&nbsp;fixRight?:&nbsp;boolean<br>}) <br><br> type&nbsp;BufferUpdater&nbsp;=<br>&nbsp;&nbsp;(item: ItemAdapter)&nbsp;=><br>&nbsp;&nbsp;&nbsp;&nbsp;unknown|Updates existing items by running the _predicate_ function over the Scroller's buffer. The return value of the _predicate_ determines the operation: falsy or empty array to remove, truthy or array with only 1 current item to keep unchanged, non-empty array to replace/insert. Indexes are maintained on the assumption that the left border of the dataset is fixed. To release the left border and fix the right one the _fixRight_ option should be set to _true_. |

Along with the documented API there are some undocumented features that can be treated as experimental. They are not tested enough and might change over time. Some of them can be found on the [experimental tab](https://dhilt.github.io/ngx-ui-scroll/#experimental) of the demo app.

All Adapter methods are asynchronous because they interact with the DOM, which can be a time-consuming operation. Each Adapter method returns a Promise that resolves when the Scroller has terminated all internal processes triggered by that specific method call. This is called the [Adapter Return API](https://dhilt.github.io/ngx-ui-scroll/#adapter#return-value). The Promise returned by each Adapter method has exactly the same nature as the promise of the [Adapter.relax method](https://dhilt.github.io/ngx-ui-scroll/#experimental#adapter-relax). Both the "Relax" method and the "Return API" serve as tools for normalizing App-Scroller processes. In many cases, it is crucial to perform certain logic only after the Scroller has finished its work and entered a relaxed state. Below is an example of how to safely implement a sequence of Adapter method calls:

```js
const { adapter } = this.datasource;
const predicate = ({ $index }) => $index === indexToReplace;
await adapter.relax();
await adapter.remove({ predicate });
await adapter.insert({ items: [itemToReplace], before: predicate });
console.log('Two-phase replacement done');
```

For more information, see [Adapter demo page](https://dhilt.github.io/ngx-ui-scroll/#adapter).


### Compatibility

The ngx-ui-scroll library has no breaking changes in its API, but there are inevitable changes in how it is built and distributed to the host app depending on the version of the Angular. This means that while your code using the library’s API remains compatible across versions, you may need to select the appropriate ngx-ui-scroll package version to match your Angular project’s build system and compatibility requirements.

|ngx-ui-scroll|Angular|compiled|vscroll (core)|support
|:--|:--|:--|:--|:--|
|v1|5-12|View Engine|no dependencies (vscroll is not extracted)|no
|v2|5-12|View Engine|vscroll is a bundle-dependency|maintenance
|v3|12+|Ivy|vscroll is a peer-dependency|maintenance
|v4|17+|Ivy|vscroll is a peer-dependency|active

Note: Starting from v4, the @for block syntax is used instead of *ngFor.


### Development

There are some npm scripts available from package.json:

- `npm start` to run demo App on port 4200
- `npm test` to run Karma tests
- `npm run build:lib` to build the ngx-ui-scroll module into the ./dist/scroller folder
- `npm run build:demo` to build the demo App into the ./dist/demo folder

Along with settings object the datasource implementation may include also devSettings object: 

```javascript
import { Datasource } from 'ngx-ui-scroll';
...
  datasource = new Datasource({
    get: ... ,
    settings: { ... },
    devSettings: {
      debug: true,
      immediateLog: true,
      ...
    }
  });
```

The development settings are not documented. Information about it can be taken directly from the [source code](https://github.com/dhilt/vscroll/blob/main/src/classes/settings.ts). The Scroller has "debug" mode with powerful logging which can be enabled via `devSettings.debug = true`, see [Dev Log](https://github.com/dhilt/vscroll/wiki/Dev-Log) doc.

Below is the quick guide for vscroll/ngx-ui-scroll integrated development (this is relevant since ngx-ui-scroll v2 depends on vscroll):

 - clone both ngx-ui-scroll and [vscroll](https://github.com/dhilt/vscroll) repositories into the same folder
 - replace "vscroll" import with local sources [here](https://github.com/dhilt/ngx-ui-scroll/blob/v3.0.0/src/vscroll.ts#L19) and [here](https://github.com/dhilt/ngx-ui-scroll/blob/v3.0.0/tests/miscellaneous/vscroll.ts#L17).

Also, there are some environment variables for additional customization of the dev process. In accordance with [dotenv](https://www.npmjs.com/package/dotenv) approach, the `.env` file should be placed in the root folder, and it may contain the following variables.

|Name|Value|Description|
|:--|:----|:----------|
|DEV_SERVER_PORT|4200|Port the dev server (webpack) will use. Need to run `npm run start:env` instead of `npm run` to make this setting work.|
|TEST_BROWSER|default&nbsp;&#124; chrome&nbsp;&#124; firefox|Platform for running tests. By default a headless chrome is used; "chrome" or "firefox" are for running tests in real (chrome/ff) browser |
|TEST_SERVER_PORT|9876|Port that will be used by non-default testing browser |

Any support and participation are welcome, so feel free to <a href="https://github.com/dhilt/ngx-ui-scroll?sponsor=1">donate</a>, submit new [Issues](https://github.com/dhilt/ngx-ui-scroll/issues) and open [Pull Requests](https://github.com/dhilt/ngx-ui-scroll/pulls).

__________

2025 &copy; dhilt
