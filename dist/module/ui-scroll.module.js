import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiScrollComponent } from '../component/ui-scroll.component';
import { UiScrollDirective } from '../directive/ui-scroll.directive';
var UiScrollModule = (function () {
    function UiScrollModule() {
    }
    UiScrollModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [
                        UiScrollComponent,
                        UiScrollDirective
                    ],
                    imports: [CommonModule],
                    entryComponents: [UiScrollComponent],
                    exports: [UiScrollDirective]
                },] },
    ];
    /** @nocollapse */
    UiScrollModule.ctorParameters = function () { return []; };
    return UiScrollModule;
}());
export { UiScrollModule };
//# sourceMappingURL=ui-scroll.module.js.map