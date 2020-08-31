import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { filter, take } from 'rxjs/operators';

import { TestComponentInterface } from '../scaffolding/testComponent';
import { TestBedConfig } from '../scaffolding/runner';
import { generateItem } from './items';

import { Direction, DatasourceGet, IAdapter } from '../../src/component/interfaces';
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
  uiScrollElement: DebugElement;
  viewportElement: DebugElement;
  uiScrollComponent: UiScrollComponent;
  workflow: Workflow;
  scroller: Scroller;
  datasource: Datasource;
  adapter: IAdapter;
  padding: {
    forward: Padding;
    backward: Padding;
  };
  horizontal: boolean;
  window: boolean;

  itemHeight = 20;
  itemWidth = 90;
  shared: any = {};

  constructor(fixture: ComponentFixture<TestComponentInterface>) {
    this.fixture = fixture;
    this.testComponent = fixture.componentInstance;
    this.uiScrollElement = fixture.debugElement.query(By.css('[ui-scroll]'));
    this.uiScrollComponent = this.uiScrollElement.componentInstance;
    this.viewportElement = this.uiScrollElement.parent as DebugElement;
    this.workflow = this.uiScrollComponent.workflow;
    this.scroller = this.workflow.scroller;
    this.datasource = this.testComponent.datasource as Datasource;
    this.adapter = this.datasource.adapter;
    const { horizontal, windowViewport } = this.scroller.settings;
    this.horizontal = horizontal;
    this.window = windowViewport;
    this.padding = {
      forward: new Padding(fixture, Direction.forward, horizontal),
      backward: new Padding(fixture, Direction.backward, horizontal)
    };
  }

  spyOnGet(): jasmine.Spy<DatasourceGet> {
    return spyOn(this.scroller.datasource, 'get').and.callThrough();
  }

  getViewportSize(settings: TestBedConfig): number {
    return this.scroller.viewport.getSize();
    // return settings.templateSettings[this.horizontal ? 'viewportWidth' : 'viewportHeight'];
  }

  getItemSize(): number {
    return this.horizontal ? this.itemWidth : this.itemHeight;
  }

  getElements(): HTMLElement[] {
    return this.fixture.nativeElement.querySelectorAll(`[data-sid]`);
  }

  getElement(index: number): HTMLElement {
    return this.fixture.nativeElement.querySelector(`[data-sid="${index}"]`);
  }

  getElementText(index: number): string | null {
    const element = this.getElement(index);
    return element ? element.innerText.trim() : null;
  }

  checkElementContentByIndex(index: number | null): boolean {
    return index !== null && this.getElementText(index) === index + ' : ' + generateItem(index).text;
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
      this.adapter.fix({ scrollPosition: value });
    }
  }

  scrollMin() {
    this.scrollTo(0);
  }

  scrollMax() {
    this.scrollTo(999999);
  }

  relaxNext(): Promise<void> {
    return new Promise(resolve =>
      this.adapter.isLoading$.pipe(
        filter(pending => !pending),
        take(1)
      ).subscribe(() => resolve())
    );
  }
}
