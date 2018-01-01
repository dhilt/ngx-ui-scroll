import { TemplateRef, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
export declare class UiScrollDirective {
    private templateRef;
    private viewContainer;
    private resolver;
    private datasource;
    constructor(templateRef: TemplateRef<any>, viewContainer: ViewContainerRef, resolver: ComponentFactoryResolver);
    uiScrollOf: any;
    ngOnInit(): void;
}
