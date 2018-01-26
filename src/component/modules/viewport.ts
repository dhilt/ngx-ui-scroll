import { ElementRef } from '@angular/core';

export class Viewport {

  element = null;
  scrollable = null;
  paddingBackward = null;
  paddingForward = null;

  disabledScrollEvent: Function;

  get scrollPosition(): number {
    return this.scrollable.scrollTop;
  }
  set scrollPosition(value: number) {
    this.disabledScrollEvent();
    this.scrollable.scrollTop += value;
  }

  constructor(elementRef: ElementRef, disabledScroll: Function) {
    this.element = elementRef.nativeElement;
    this.scrollable = elementRef.nativeElement.parentElement;
    this.paddingBackward = this.element.querySelector('[data-padding-backward]');
    this.paddingForward = this.element.querySelector('[data-padding-forward]');
    this.disabledScrollEvent = disabledScroll;
  }

}
