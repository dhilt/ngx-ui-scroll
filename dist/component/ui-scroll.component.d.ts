import { OnInit, OnDestroy, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { ElementRef, Renderer2 } from '@angular/core';
export declare class UiScrollComponent implements OnInit, OnDestroy {
    private changeDetector;
    private elementRef;
    private renderer;
    private onScrollListener;
    getItems: Function;
    template: TemplateRef<any>;
    datasource: any;
    constructor(changeDetector: ChangeDetectorRef, elementRef: ElementRef, renderer: Renderer2);
    ngOnInit(): void;
    ngOnDestroy(): void;
}
