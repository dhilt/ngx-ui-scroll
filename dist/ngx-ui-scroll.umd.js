(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('rxjs/Rx')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common', 'rxjs/Rx'], factory) :
	(factory((global.UiScroll = {}),global.ng.core,global.ng.common,global.Rx));
}(this, (function (exports,core,common,Rx) { 'use strict';

var timer = null;
var next = null;
var runTimer = function (delay) {
    timer = setTimeout(function () {
        timer = null;
        if (next) {
            next();
            next = null;
            runTimer(delay);
        }
    }, delay);
};
var debouncedRound = function (cb, delay) {
    if (!timer) {
        cb();
    }
    else {
        next = cb;
        clearTimeout(timer);
    }
    runTimer(delay);
};

var Elements = (function () {
    function Elements() {
    }
    Elements.initialize = function (elementRef) {
        Elements.viewport = elementRef.nativeElement;
        Elements.paddingTop = Elements.viewport.querySelector('[data-padding-top]');
        Elements.paddingBottom = Elements.viewport.querySelector('[data-padding-bottom]');
    };
    Elements.viewport = null;
    Elements.paddingTop = null;
    Elements.paddingBottom = null;
    return Elements;
}());

var Data = (function () {
    function Data() {
    }
    Data.setSource = function (datasource) {
        if (!datasource || typeof datasource !== 'object' || typeof datasource.get !== 'function') {
            throw new Error('Invalid datasource!');
        }
        self$1.source = datasource;
    };
    Data.setScrollerId = function () {
        // todo dhilt : need to calculate
        self$1.scrollerId = '0';
    };
    Data.getItemId = function (index) {
        return 'i-' + self$1.scrollerId + '-' + index.toString();
    };
    Data.getFirstVisibleItemIndex = function () {
        for (var i = 0; i < self$1.items.length; i++) {
            if (!self$1.items[i].invisible) {
                return i;
            }
        }
        return -1;
    };
    Data.getFirstVisibleItem = function () {
        var index = self$1.getFirstVisibleItemIndex();
        if (index >= 0) {
            return self$1.items[index];
        }
    };
    Data.getLastVisibleItemIndex = function () {
        for (var i = self$1.items.length - 1; i >= 0; i--) {
            if (!self$1.items[i].invisible) {
                return i;
            }
        }
        return -1;
    };
    Data.getLastVisibleItem = function () {
        var index = self$1.getLastVisibleItemIndex();
        if (index >= 0) {
            return self$1.items[index];
        }
    };
    Data.initialize = function (context) {
        self$1.setSource(context.datasource);
        self$1.setScrollerId();
        context.getItems = function () { return self$1.items; };
        context.getItemId = self$1.getItemId.bind(context);
    };
    Data.startIndex = 90;
    Data.bufferSize = 5;
    Data.padding = 0.5;
    Data.items = [];
    Data.bof = false;
    Data.eof = false;
    Data.position = 0;
    Data.lastIndex = null;
    return Data;
}());
var self$1 = Data;

var Direction = (function () {
    function Direction() {
    }
    Direction.opposite = function (direction) {
        if (direction === self.top) {
            return self.bottom;
        }
        else if (direction === self.bottom) {
            return self.top;
        }
        else {
            return null;
        }
    };
    Direction.byScrollTop = function () {
        if (Data.position < Elements.viewport.scrollTop) {
            return self.bottom;
        }
        if (Data.position > Elements.viewport.scrollTop) {
            return self.top;
        }
        return null;
    };
    Direction.isValid = function (value) {
        return value === self.top || value === self.bottom;
    };
    Direction.top = 'top';
    Direction.bottom = 'bottom';
    return Direction;
}());
var self = Direction;

var Fetch = (function () {
    function Fetch() {
    }
    Fetch.run = function (direction) {
        if (direction === Direction.top) {
            return self$2.runTop();
        }
        if (direction === Direction.bottom) {
            return self$2.runBottom();
        }
    };
    Fetch.shouldLoadBottom = function () {
        if (self$2.pendingBottom) {
            return false;
        }
        var lastItem = Data.getLastVisibleItem();
        if (!lastItem) {
            return true;
        }
        var viewportBottom = Elements.viewport.getBoundingClientRect().bottom;
        var lastElementBottom = lastItem.element.getBoundingClientRect().bottom;
        return lastElementBottom <= viewportBottom;
    };
    Fetch.shouldLoadTop = function () {
        if (self$2.pendingTop) {
            return false;
        }
        var firstItem = Data.getFirstVisibleItem();
        if (!firstItem) {
            return true;
        }
        var viewportTop = Elements.viewport.getBoundingClientRect().top;
        var firstElementTop = firstItem.element.getBoundingClientRect().top;
        return firstElementTop >= viewportTop;
    };
    Fetch.runTop = function () {
        return new Promise(function (resolve, reject) {
            if (self$2.shouldLoadTop()) {
                self$2.pendingTop = true;
                var start_1 = (Data.items.length ?
                    Data.items[0].$index :
                    (Data.lastIndex !== null ? Data.lastIndex : Data.startIndex))
                    - Data.bufferSize;
                Data.source.get(start_1, Data.bufferSize).subscribe(function (result) {
                    self$2.pendingTop = false;
                    Data.bof = result.length !== Data.bufferSize;
                    var items = result.map(function (item, index) {
                        return ({
                            $index: start_1 + index,
                            scope: item,
                            invisible: true
                        });
                    });
                    Data.items = items.concat(Data.items);
                    resolve(items);
                });
            }
            else {
                reject();
            }
        });
    };
    Fetch.runBottom = function () {
        return new Promise(function (resolve, reject) {
            if (self$2.shouldLoadBottom()) {
                self$2.pendingBottom = true;
                var start_2 = Data.items.length ?
                    Data.items[Data.items.length - 1].$index + 1 :
                    (Data.lastIndex !== null ? Data.lastIndex + 1 : Data.startIndex);
                Data.source.get(start_2, Data.bufferSize).subscribe(function (result) {
                    self$2.pendingBottom = false;
                    Data.eof = result.length !== Data.bufferSize;
                    var items = result.map(function (item, index) {
                        return ({
                            $index: start_2 + index,
                            scope: item,
                            invisible: true
                        });
                    });
                    Data.items = Data.items.concat(items);
                    resolve(items);
                });
            }
            else {
                reject();
            }
        });
    };
    Fetch.pendingTop = false;
    Fetch.pendingBottom = false;
    return Fetch;
}());
var self$2 = Fetch;

var Render = (function () {
    function Render() {
    }
    Render.run = function (items, direction) {
        if (items === void 0) { items = null; }
        if (direction === void 0) { direction = null; }
        return new Promise(function (resolve, reject) {
            self$3.renderPending = true;
            setTimeout(function () {
                self$3.renderPending = false;
                if (items) {
                    self$3.setElements(items);
                    resolve(items);
                }
                reject();
            });
        });
    };
    Render.setElements = function (items) {
        items.forEach(function (item) {
            for (var i = Elements.viewport.childNodes.length - 1; i >= 0; i--) {
                var node = Elements.viewport.childNodes[i];
                if (node.id) {
                    if (node.id === Data.getItemId(item.$index)) {
                        item.element = node;
                    }
                }
            }
            if (!item.element) {
                // todo: just remove this
                throw new Error('Can not associate item with element');
            }
        });
    };
    Render.renderPending = false;
    return Render;
}());
var self$3 = Render;

var Clip = (function () {
    function Clip() {
    }
    Clip.run = function (direction) {
        if (direction === Direction.top) {
            return self$4.runTop();
        }
        if (direction === Direction.bottom) {
            return self$4.runBottom();
        }
    };
    Clip.runTop = function () {
        var viewportParams = Elements.viewport.getBoundingClientRect();
        var viewportTop = viewportParams.top;
        var delta = viewportParams.height * Data.padding;
        var bottomLimit = viewportTop - delta;
        var limit = Data.items.length - 1;
        var i = 0, min = 0, cutHeight, found = -1;
        var startIndex = Data.getFirstVisibleItemIndex();
        var lastItem = Data.items[limit];
        var lastElementBottom = lastItem.element.getBoundingClientRect().bottom;
        // edge case: all items should be clipped
        if (lastElementBottom < bottomLimit) {
            cutHeight = Math.abs(Data.items[startIndex].element.getBoundingClientRect().top - lastElementBottom);
            found = limit;
        }
        else {
            for (i = startIndex; i <= limit; i++) {
                var item = Data.items[i];
                if (item.element.getBoundingClientRect().bottom > bottomLimit) {
                    found = i - 1;
                    break;
                }
            }
            if (found >= startIndex) {
                cutHeight = Data.items[found].element.getBoundingClientRect().bottom -
                    Data.items[startIndex].element.getBoundingClientRect().top;
            }
        }
        if (found >= startIndex) {
            for (i = startIndex; i <= found; i++) {
                Data.items[i].element.style.display = 'none';
            }
            var paddingHeight = parseInt(Elements.paddingTop.style.height, 10) || 0;
            Elements.paddingTop.style.height = (paddingHeight + cutHeight) + 'px';
            Data.lastIndex = found === limit ? Data.items[limit].$index : null;
            Data.items.splice(0, found + 1);
            return true;
        }
        return false;
    };
    Clip.runBottom = function () {
        var viewportParams = Elements.viewport.getBoundingClientRect();
        var viewportBottom = viewportParams.bottom;
        var delta = viewportParams.height * Data.padding;
        var topLimit = viewportBottom + delta;
        var limit = Data.items.length - 1;
        var i, cutHeight, found = -1;
        var endIndex = Data.getLastVisibleItemIndex();
        var firstItem = Data.items[0];
        var firstElementTop = firstItem.element.getBoundingClientRect().top;
        // edge case: all items should be clipped
        if (firstElementTop > topLimit) {
            cutHeight = Math.abs(Data.items[endIndex].element.getBoundingClientRect().bottom - firstElementTop);
            found = 0;
        }
        else {
            for (i = 0; i <= endIndex; i++) {
                var element = Data.items[i].element;
                if (element.getBoundingClientRect().top > topLimit) {
                    found = i;
                    break;
                }
            }
            if (found >= 0) {
                cutHeight = Data.items[endIndex].element.getBoundingClientRect().bottom -
                    Data.items[found].element.getBoundingClientRect().top;
            }
        }
        if (found >= 0) {
            for (i = found; i <= endIndex; i++) {
                Data.items[i].element.style.display = 'none';
            }
            var paddingHeight = parseInt(Elements.paddingBottom.style.height, 10) || 0;
            Elements.paddingBottom.style.height = (paddingHeight + cutHeight) + 'px';
            Data.lastIndex = found === 0 ? Data.items[0].$index : null;
            Data.items.splice(found, limit + 1 - found);
            return true;
        }
        return false;
    };
    return Clip;
}());
var self$4 = Clip;

var Adjust = (function () {
    function Adjust() {
    }
    Adjust.run = function (direction, items) {
        if (direction === Direction.top) {
            self$5.runTop(items);
        }
        if (direction === Direction.bottom) {
            self$5.runBottom(items);
        }
    };
    Adjust.processInvisibleItems = function (items) {
        for (var i = items.length - 1; i >= 0; i--) {
            var element = items[i].element.children[0];
            element.style.left = '';
            element.style.position = '';
            delete items[i].invisible;
        }
        return Math.abs(items[0].element.getBoundingClientRect().top - items[items.length - 1].element.getBoundingClientRect().bottom);
    };
    Adjust.runBottom = function (items) {
        var height = self$5.processInvisibleItems(items);
        var _paddingBottomHeight = parseInt(Elements.paddingBottom.style.height, 10) || 0;
        var paddingBottomHeight = Math.max(_paddingBottomHeight - height, 0);
        Elements.paddingBottom.style.height = paddingBottomHeight + 'px';
    };
    Adjust.runTop = function (items) {
        var _scrollTop = Elements.viewport.scrollTop;
        var height = self$5.processInvisibleItems(items);
        // now need to make "height" pixels top
        // 1) via paddingTop
        var _paddingTopHeight = parseInt(Elements.paddingTop.style.height, 10) || 0;
        var paddingTopHeight = Math.max(_paddingTopHeight - height, 0);
        Elements.paddingTop.style.height = paddingTopHeight + 'px';
        var paddingDiff = height - (_paddingTopHeight - paddingTopHeight);
        // 2) via scrollTop
        if (paddingDiff > 0) {
            height = paddingDiff;
            Elements.viewport.scrollTop += height;
            var diff = height - Elements.viewport.scrollTop - _scrollTop;
            if (diff > 0) {
                var paddingHeight = parseInt(Elements.paddingBottom.style.height, 10) || 0;
                Elements.paddingBottom.style.height = (paddingHeight + diff) + 'px';
                Elements.viewport.scrollTop += diff;
            }
        }
    };
    return Adjust;
}());
var self$5 = Adjust;

var ɵ0$1 = function (items) { return null; };
var ɵ1$1 = function (context) {
    Workflow.runChangeDetector = function (items) {
        context.changeDetector.markForCheck();
        return items;
    };
};
var ɵ2 = function (direction) {
    return Rx.Observable.create(function (observer) {
        Fetch.run(direction)
            .then(function (items) { return Workflow.runChangeDetector(items); })
            .then(function (items) { return Render.run(items, direction); })
            .then(function (items) {
            Adjust.run(direction, items);
            Data.position = Elements.viewport.scrollTop;
            if (Clip.run(Direction.opposite(direction))) {
                Workflow.runChangeDetector(null);
            }
            Data.position = Elements.viewport.scrollTop;
            console.log(direction + ' cycle is done');
            observer.next(direction);
            observer.complete();
        })
            .catch(function (error) {
            console.log('Done ' + direction);
            error && console.error(error);
            observer.complete();
        });
    });
};
var ɵ3 = function (param) {
    var direction;
    if (typeof param === 'string') {
        direction = param;
    }
    else {
        // scroll event
        console.log('FIRE!');
        direction = Direction.byScrollTop();
    }
    if (!Direction.isValid(direction)) {
        return;
    }
    var run = function () {
        return Workflow.cycle(direction).subscribe(run);
    };
    run();
};
var Workflow = {
    runChangeDetector: ɵ0$1,
    initialize: ɵ1$1,
    cycle: ɵ2,
    run: ɵ3
};

var UiScrollComponent = (function () {
    function UiScrollComponent(changeDetector, elementRef, renderer) {
        this.changeDetector = changeDetector;
        this.elementRef = elementRef;
        this.renderer = renderer;
    }
    UiScrollComponent.prototype.ngOnInit = function () {
        Elements.initialize(this.elementRef);
        Data.initialize(this);
        Workflow.initialize(this);
        this.onScrollListener = this.renderer.listen(Elements.viewport, 'scroll', function (event) {
            return debouncedRound(function () { return Workflow.run(event); }, 25);
        });
        Workflow.run(Direction.bottom);
        Workflow.run(Direction.top);
    };
    UiScrollComponent.prototype.ngOnDestroy = function () {
        this.onScrollListener();
    };
    UiScrollComponent.decorators = [
        { type: core.Component, args: [{
                    selector: 'ui-scroll',
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    templateUrl: './ui-scroll.component.html',
                    styleUrls: ["./ui-scroll.component.css"]
                },] },
    ];
    /** @nocollapse */
    UiScrollComponent.ctorParameters = function () { return [
        { type: core.ChangeDetectorRef, },
        { type: core.ElementRef, },
        { type: core.Renderer2, },
    ]; };
    return UiScrollComponent;
}());

var UiScrollDirective = (function () {
    function UiScrollDirective(templateRef, viewContainer, resolver) {
        this.templateRef = templateRef;
        this.viewContainer = viewContainer;
        this.resolver = resolver;
    }
    Object.defineProperty(UiScrollDirective.prototype, "uiScrollOf", {
        set: function (datasource) {
            this.datasource = datasource;
        },
        enumerable: true,
        configurable: true
    });
    UiScrollDirective.prototype.ngOnInit = function () {
        var templateView = this.templateRef.createEmbeddedView({});
        var compFactory = this.resolver.resolveComponentFactory(UiScrollComponent);
        var componentRef = this.viewContainer.createComponent(compFactory, null, this.viewContainer.injector, [templateView.rootNodes]);
        componentRef.instance.datasource = this.datasource;
        componentRef.instance.template = this.templateRef;
    };
    UiScrollDirective.decorators = [
        { type: core.Directive, args: [{ selector: '[uiScroll][uiScrollOf]' },] },
    ];
    /** @nocollapse */
    UiScrollDirective.ctorParameters = function () { return [
        { type: core.TemplateRef, },
        { type: core.ViewContainerRef, },
        { type: core.ComponentFactoryResolver, },
    ]; };
    UiScrollDirective.propDecorators = {
        "uiScrollOf": [{ type: core.Input },],
    };
    return UiScrollDirective;
}());

var UiScrollModule = (function () {
    function UiScrollModule() {
    }
    UiScrollModule.decorators = [
        { type: core.NgModule, args: [{
                    declarations: [
                        UiScrollComponent,
                        UiScrollDirective
                    ],
                    imports: [common.CommonModule],
                    entryComponents: [UiScrollComponent],
                    exports: [UiScrollDirective]
                },] },
    ];
    /** @nocollapse */
    UiScrollModule.ctorParameters = function () { return []; };
    return UiScrollModule;
}());

exports.UiScrollModule = UiScrollModule;

Object.defineProperty(exports, '__esModule', { value: true });

})));
