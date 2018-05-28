import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TestComponentInterface } from '../scaffolding/testComponent';
import { TestBedConfig } from '../scaffolding/runner';

import { Direction, Datasource } from '../../src/component/interfaces';
import { UiScrollComponent } from '../../src/ui-scroll.component';
import { Scroller } from '../../src/component/scroller';
import { Workflow } from '../../src/component/workflow';

export class Padding {
  direction: Direction;
  horizontal: boolean;
  element: DebugElement;
  style: CSSStyleDeclaration;

  constructor(fixture: ComponentFixture <any>, direction: Direction, horizontal: boolean) {
    this.direction = direction;
    this.horizontal = horizontal;
    this.element = fixture.debugElement.query(By.css(`[data-padding-${direction}]`));
    this.style = this.element.nativeElement.style;
  }

  getSize(): number {
    return parseInt(this.style[this.horizontal ? 'width' : 'height'], 10) || 0;
  }
}

export class Misc {

  fixture: ComponentFixture <TestComponentInterface>;
  testComponent: TestComponentInterface;
  datasource: Datasource;
  uiScrollElement: DebugElement;
  viewportElement: DebugElement;
  uiScrollComponent: UiScrollComponent;
  workflow: Workflow;
  scroller: Scroller;
  padding = {};
  horizontal: boolean;

  itemHeight = 20;
  itemWidth = 90;
  shared = {};

  constructor(fixture: ComponentFixture <any>) {
    this.fixture = fixture;
    this.testComponent = fixture.componentInstance;
    this.datasource = this.testComponent.datasource;
    this.uiScrollElement = this.fixture.debugElement.query(By.css('[ui-scroll]'));
    this.uiScrollComponent = this.uiScrollElement.componentInstance;
    this.viewportElement = this.uiScrollElement.parent;
    this.workflow = this.uiScrollComponent.workflow;
    this.scroller = this.uiScrollComponent.workflow.scroller;
    this.horizontal = this.scroller.settings.horizontal;
    this.padding[Direction.forward] = new Padding(fixture, Direction.forward, this.horizontal);
    this.padding[Direction.backward] = new Padding(fixture, Direction.backward, this.horizontal);
  }

  getViewportSize(settings: TestBedConfig) {
    return settings.templateSettings[this.horizontal ? 'viewportWidth' : 'viewportHeight'];
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

  checkElementId(element, index: number): boolean {
    return element.getAttribute('data-sid') === `${index}`;
  }

  getElementIndex(element): number {
    const id = element.getAttribute('data-sid');
    if (!id) {
      return null;
    }
    return parseInt(id, 10) || null;
  }

  getScrollableSize(): number {
    // return this.viewportElement.nativeElement[this.horizontal ? 'scrollWidth' : 'scrollHeight'];
    const params = this.uiScrollElement.nativeElement.getBoundingClientRect();
    return params[this.horizontal ? 'width' : 'height'];
  }

  getScrollPosition(): number {
    return this.viewportElement.nativeElement[this.horizontal ? 'scrollLeft' : 'scrollTop'];
  }

  scrollTo(value: number) {
    this.viewportElement.nativeElement[this.horizontal ? 'scrollLeft' : 'scrollTop'] = value;
  }

  scrollMin() {
    this.scrollTo(0);
  }

  scrollMax() {
    this.scrollTo(999999);
  }
}
