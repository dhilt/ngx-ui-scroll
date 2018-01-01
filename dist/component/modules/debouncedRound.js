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
var ɵ0 = runTimer;
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
var ɵ1 = debouncedRound;
export default debouncedRound;
export { ɵ0, ɵ1 };
//# sourceMappingURL=debouncedRound.js.map