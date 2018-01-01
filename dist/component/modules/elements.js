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
export default Elements;
//# sourceMappingURL=elements.js.map