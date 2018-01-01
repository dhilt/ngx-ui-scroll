import { Directive, Input, TemplateRef, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { UiScrollComponent } from '../component/ui-scroll.component';
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
        { type: Directive, args: [{ selector: '[uiScroll][uiScrollOf]' },] },
    ];
    /** @nocollapse */
    UiScrollDirective.ctorParameters = function () { return [
        { type: TemplateRef, },
        { type: ViewContainerRef, },
        { type: ComponentFactoryResolver, },
    ]; };
    UiScrollDirective.propDecorators = {
        "uiScrollOf": [{ type: Input },],
    };
    return UiScrollDirective;
}());
export { UiScrollDirective };
//# sourceMappingURL=ui-scroll.directive.js.map