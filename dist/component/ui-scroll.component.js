import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ElementRef, Renderer2 } from '@angular/core';
import debouncedRound from './modules/debouncedRound';
import Direction from './modules/direction';
import Workflow from './modules/workflow';
import Elements from './modules/elements';
import Data from './modules/data';
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
        { type: Component, args: [{
                    selector: 'ui-scroll',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    templateUrl: './ui-scroll.component.html',
                    styleUrls: ["./ui-scroll.component.css"]
                },] },
    ];
    /** @nocollapse */
    UiScrollComponent.ctorParameters = function () { return [
        { type: ChangeDetectorRef, },
        { type: ElementRef, },
        { type: Renderer2, },
    ]; };
    return UiScrollComponent;
}());
export { UiScrollComponent };
//# sourceMappingURL=ui-scroll.component.js.map