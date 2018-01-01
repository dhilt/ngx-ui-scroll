import Elements from '../elements';
import Data from '../data';
var Render = (function () {
    function Render() {
    }
    Render.run = function (items, direction) {
        if (items === void 0) { items = null; }
        if (direction === void 0) { direction = null; }
        return new Promise(function (resolve, reject) {
            self.renderPending = true;
            setTimeout(function () {
                self.renderPending = false;
                if (items) {
                    self.setElements(items);
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
var self = Render;
export default Render;
//# sourceMappingURL=render.js.map