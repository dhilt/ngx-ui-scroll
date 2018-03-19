import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TestComponentInterface } from '../scaffolding/testComponent';
import { TestBedConfig } from '../scaffolding/runner';

import { Direction, Datasource } from '../../src/component/interfaces';
import { UiScrollComponent } from '../../src/ui-scroll.component';
import { Workflow } from '../../src/component/workflow';
import { WorkflowRunner } from '../../src/component/runner';

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
  workflowRunner: WorkflowRunner;
  workflow: Workflow;
  padding = {};
  horizontal: boolean;

  itemHeight = 20;
  itemWidth = 90;

  constructor(fixture: ComponentFixture <any>) {
    this.fixture = fixture;
    this.testComponent = fixture.componentInstance;
    this.datasource = this.testComponent.datasource;
    this.uiScrollElement = this.fixture.debugElement.query(By.css('ui-scroll'));
    this.uiScrollComponent = this.uiScrollElement.componentInstance;
    this.viewportElement = this.uiScrollElement.parent;
    this.workflowRunner = this.uiScrollComponent.workflowRunner;
    this.workflow = this.uiScrollComponent.workflowRunner.workflow;
    this.horizontal = this.workflow.settings.horizontal;
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
    return this.fixture.nativeElement.querySelectorAll(`[id^=${this.workflow.settings.itemIdPrefix}]`);
  }

  getElement(index: number) {
    return this.fixture.nativeElement.querySelector(`#${this.workflow.settings.itemIdPrefix}${index}`);
  }

  getElementText(index: number): string {
    const element = this.getElement(index);
    return element ? element.innerText.trim() : null;
  }

  checkElementId(element, index: number) {
    return element.id === `${this.workflow.settings.itemIdPrefix}${index}`;
  }

  getElementIndex(element) {
    const index = element.id.replace(this.workflow.settings.itemIdPrefix, '');
    return parseInt(index, 10) || null;
  }

  getScrollableSize(): number {
    return this.viewportElement.nativeElement[this.horizontal ? 'scrollWidth' : 'scrollHeight'];
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
