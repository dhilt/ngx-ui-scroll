import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TestComponentInterface } from '../scaffolding/testComponent';
import { TestBedConfig } from '../scaffolding/runner';
import { generateItem } from './items';

import { Direction } from '../../src/component/interfaces';
import { UiScrollComponent } from '../../src/ui-scroll.component';
import { Scroller } from '../../src/component/scroller';
import { Workflow } from '../../src/component/workflow';
import { Datasource } from '../../src/component/classes/datasource';

export class Padding {
  direction: Direction;
  horizontal: boolean;
  element: DebugElement;
  style: CSSStyleDeclaration;

  constructor(fixture: ComponentFixture<any>, direction: Direction, horizontal: boolean) {
    this.direction = direction;
    this.horizontal = horizontal;
    this.element = fixture.debugElement.query(By.css(`[data-padding-${direction}]`));
    this.style = this.element.nativeElement.style;
  }

  getSize(): number {
    const size = this.style[this.horizontal ? 'width' : 'height'] || '';
    return parseInt(size, 10) || 0;
  }
}

export class Misc {

  fixture: ComponentFixture<TestComponentInterface>;
  testComponent: TestComponentInterface;
  datasource: Datasource;
  uiScrollElement: DebugElement;
  viewportElement: DebugElement;
  uiScrollComponent: UiScrollComponent;
  workflow: Workflow;
  scroller: Scroller;
  padding: {
    forward: Padding;
    backward: Padding;
  };
  horizontal: boolean;
  window: boolean;

  itemHeight = 20;
  itemWidth = 90;
  shared: any = {};

  constructor(fixture: ComponentFixture<any>) {
    this.fixture = fixture;
    this.testComponent = fixture.componentInstance;
    this.uiScrollElement = this.fixture.debugElement.query(By.css('[ui-scroll]'));
    this.uiScrollComponent = this.uiScrollElement.componentInstance;
    this.viewportElement = <DebugElement>this.uiScrollElement.parent;
    this.workflow = this.uiScrollComponent.workflow;
    this.scroller = this.uiScrollComponent.workflow.scroller;
    this.datasource = this.scroller.datasource;
    this.horizontal = this.scroller.settings.horizontal;
    this.window = this.scroller.settings.windowViewport;
    this.padding = {
      forward: new Padding(fixture, Direction.forward, this.horizontal),
      backward: new Padding(fixture, Direction.backward, this.horizontal)
    };
  }

  getViewportSize(settings: TestBedConfig): number {
    return this.scroller.viewport.getSize();
    // return settings.templateSettings[this.horizontal ? 'viewportWidth' : 'viewportHeight'];
  }

  getItemSize(): number {
    return this.horizontal ? this.itemWidth : this.itemHeight;
  }

  getElements() {
    return this.fixture.nativeElement.querySelectorAll(`[data-sid]`);
  }

  getElement(index: number) {
    return this.fixture.nativeElement.querySelector(`[data-sid="${index}"]`);
  }

  getElementText(index: number): string {
    const element = this.getElement(index);
    return element ? element.innerText.trim() : null;
  }

  checkElementContentByIndex(index: number): boolean {
    return this.getElementText(index) === index + ' : ' + generateItem(index).text;
  }

  checkElementId(element: HTMLElement, index: number): boolean {
    return element.getAttribute('data-sid') === `${index}`;
  }

  getElementIndex(element: HTMLElement): number {
    return Number(element.getAttribute('data-sid'));
  }

  getScrollableSize(): number {
    // return this.viewportElement.nativeElement[this.horizontal ? 'scrollWidth' : 'scrollHeight'];
    const params = this.uiScrollElement.nativeElement.getBoundingClientRect();
    return params[this.horizontal ? 'width' : 'height'];
  }

  getScrollableElement() {
    return this.window ? document.scrollingElement : this.viewportElement.nativeElement;
  }

  getScrollPosition(): number {
    return this.getScrollableElement()[this.horizontal ? 'scrollLeft' : 'scrollTop'];
  }

  scrollTo(value: number, native?: boolean) {
    if (native) {
      this.getScrollableElement()[this.horizontal ? 'scrollLeft' : 'scrollTop'] = value;
    } else {
      this.datasource.adapter.setScrollPosition(value);
    }
  }

  scrollMin() {
    this.scrollTo(0);
  }

  scrollMax() {
    this.scrollTo(999999);
  }
}
