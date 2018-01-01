import Elements from './elements';
import Data from './data';
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
export default Direction;
//# sourceMappingURL=direction.js.map