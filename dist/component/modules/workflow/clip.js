import Data from '../data';
import Elements from '../elements';
import Direction from '../direction';
var Clip = (function () {
    function Clip() {
    }
    Clip.run = function (direction) {
        if (direction === Direction.top) {
            return self.runTop();
        }
        if (direction === Direction.bottom) {
            return self.runBottom();
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
var self = Clip;
export default Clip;
//# sourceMappingURL=clip.js.map