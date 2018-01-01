var Data = (function () {
    function Data() {
    }
    Data.setSource = function (datasource) {
        if (!datasource || typeof datasource !== 'object' || typeof datasource.get !== 'function') {
            throw new Error('Invalid datasource!');
        }
        self.source = datasource;
    };
    Data.setScrollerId = function () {
        // todo dhilt : need to calculate
        self.scrollerId = '0';
    };
    Data.getItemId = function (index) {
        return 'i-' + self.scrollerId + '-' + index.toString();
    };
    Data.getFirstVisibleItemIndex = function () {
        for (var i = 0; i < self.items.length; i++) {
            if (!self.items[i].invisible) {
                return i;
            }
        }
        return -1;
    };
    Data.getFirstVisibleItem = function () {
        var index = self.getFirstVisibleItemIndex();
        if (index >= 0) {
            return self.items[index];
        }
    };
    Data.getLastVisibleItemIndex = function () {
        for (var i = self.items.length - 1; i >= 0; i--) {
            if (!self.items[i].invisible) {
                return i;
            }
        }
        return -1;
    };
    Data.getLastVisibleItem = function () {
        var index = self.getLastVisibleItemIndex();
        if (index >= 0) {
            return self.items[index];
        }
    };
    Data.initialize = function (context) {
        self.setSource(context.datasource);
        self.setScrollerId();
        context.getItems = function () { return self.items; };
        context.getItemId = self.getItemId.bind(context);
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
var self = Data;
export default Data;
//# sourceMappingURL=data.js.map