import Elements from '../elements';
import Direction from '../direction';
var Adjust = (function () {
    function Adjust() {
    }
    Adjust.run = function (direction, items) {
        if (direction === Direction.top) {
            self.runTop(items);
        }
        if (direction === Direction.bottom) {
            self.runBottom(items);
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
        var height = self.processInvisibleItems(items);
        var _paddingBottomHeight = parseInt(Elements.paddingBottom.style.height, 10) || 0;
        var paddingBottomHeight = Math.max(_paddingBottomHeight - height, 0);
        Elements.paddingBottom.style.height = paddingBottomHeight + 'px';
    };
    Adjust.runTop = function (items) {
        var _scrollTop = Elements.viewport.scrollTop;
        var height = self.processInvisibleItems(items);
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
var self = Adjust;
export default Adjust;
//# sourceMappingURL=adjust.js.map