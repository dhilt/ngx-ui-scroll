import Data from '../data';
import Elements from '../elements';
import Direction from '../direction';
var Fetch = (function () {
    function Fetch() {
    }
    Fetch.run = function (direction) {
        if (direction === Direction.top) {
            return self.runTop();
        }
        if (direction === Direction.bottom) {
            return self.runBottom();
        }
    };
    Fetch.shouldLoadBottom = function () {
        if (self.pendingBottom) {
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
        if (self.pendingTop) {
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
            if (self.shouldLoadTop()) {
                self.pendingTop = true;
                var start_1 = (Data.items.length ?
                    Data.items[0].$index :
                    (Data.lastIndex !== null ? Data.lastIndex : Data.startIndex))
                    - Data.bufferSize;
                Data.source.get(start_1, Data.bufferSize).subscribe(function (result) {
                    self.pendingTop = false;
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
            if (self.shouldLoadBottom()) {
                self.pendingBottom = true;
                var start_2 = Data.items.length ?
                    Data.items[Data.items.length - 1].$index + 1 :
                    (Data.lastIndex !== null ? Data.lastIndex + 1 : Data.startIndex);
                Data.source.get(start_2, Data.bufferSize).subscribe(function (result) {
                    self.pendingBottom = false;
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
var self = Fetch;
export default Fetch;
//# sourceMappingURL=fetch.js.map