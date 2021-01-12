import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { debounceTime, filter, take } from 'rxjs/operators';

import { Workflow, Direction } from 'vscroll';
import { DatasourceGet, IAdapter as IAdapterInternal } from 'vscroll/dist/typings/interfaces';

import { TestComponentInterface } from '../scaffolding/testComponent';
import { TestBedConfig } from '../scaffolding/runner';
import { Item, generateItem, IndexedItem } from './items';

import { UiScrollComponent } from '../../src/ui-scroll.component';
import { IAdapter, IDatasource } from '../../src/ui-scroll.datasource';

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
  scroller: Workflow['scroller'];
  datasource: IDatasource;
  adapter: IAdapter<Item>;
  internalAdapter: IAdapterInternal<Item>;
  routines: Workflow['scroller']['routines'];
  padding: {
    forward: Padding;
    backward: Padding;
  };
  horizontal: boolean;
  window: boolean;

  itemHeight = 20;
  itemWidth = 100;
  shared: any = {};

  get innerLoopCount(): number {
    return this.scroller.state.cycle.innerLoop.total;
  }

  constructor(fixture: ComponentFixture<TestComponentInterface>) {
    this.fixture = fixture;
    this.testComponent = fixture.componentInstance;
    this.uiScrollElement = fixture.debugElement.query(By.css('[ui-scroll]'));
    this.uiScrollComponent = this.uiScrollElement.componentInstance;
    this.viewportElement = this.uiScrollElement.parent as DebugElement;
    this.workflow = this.uiScrollComponent.workflow;
    this.scroller = this.workflow.scroller;
    this.datasource = this.testComponent.datasource;
    this.adapter = this.datasource.adapter as IAdapter<Item>;
    this.internalAdapter = this.scroller.adapter as IAdapterInternal<Item>;
    this.routines = this.scroller.routines;
    const { horizontal, windowViewport } = this.scroller.settings;
    this.horizontal = horizontal;
    this.window = windowViewport;
    this.padding = {
      forward: new Padding(fixture, Direction.forward, horizontal),
      backward: new Padding(fixture, Direction.backward, horizontal)
    };
  }

  generateFakeWorkflow(settings?: any): Workflow {
    return new Workflow({
      consumer: { name: 'fake', version: 'x.x.x' },
      element: this.scroller.viewport.element,
      datasource: { get: (a: any, b: any) => null, settings },
      run: () => null
    });
  }

  spyOnGet(): jasmine.Spy<DatasourceGet> {
    return spyOn(this.datasource, 'get').and.callThrough();
  }

  getViewportSize(settings?: TestBedConfig): number {
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

  checkElementContentByIndex(index: number): boolean {
    const i = Number(index);
    return !isNaN(i) && this.getElementText(i) === i + ': ' + generateItem(i).text;
  }

  checkElementContent(index: number, id: number): boolean {
    return this.getElementText(index) === index + ': ' + generateItem(id).text;
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

  getMaxScrollPosition(): number {
    return this.getScrollableSize() - this.getViewportSize();
  }

  scrollTo(value: number, native?: boolean) {
    if (native) {
      this.getScrollableElement()[this.horizontal ? 'scrollLeft' : 'scrollTop'] = value;
    } else {
      this.scroller.adapter.fix({ scrollPosition: value });
    }
  }

  scrollMin() {
    this.scrollTo(0);
  }

  scrollMax() {
    this.scrollTo(999999);
  }

  relaxNext(debounce?: boolean): Promise<void> {
    return new Promise(resolve =>
      (debounce
        ? this.adapter.isLoading$.pipe(
          filter(pending => !pending),
          debounceTime(30),
          take(1)
        )
        : this.adapter.isLoading$.pipe(
          filter(pending => !pending),
          take(1)
        )
      ).subscribe(() => resolve())
    );
  }

  async scrollDownRecursively(): Promise<void> {
    const positionMax = this.getScrollableSize() - this.getViewportSize();
    if (this.getScrollPosition() !== positionMax) {
      this.scrollMax();
      await this.relaxNext();
      return this.scrollDownRecursively();
    }
  }

  async scrollMinMax(): Promise<void> {
    if (this.getScrollPosition() !== 0) {
      this.scrollMin();
      await this.relaxNext();
      this.scrollMax();
      await this.relaxNext();
    } else {
      this.scrollMax();
      await this.relaxNext();
      this.scrollMin();
      await this.relaxNext();
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve =>
      setTimeout(() => resolve(), ms)
    );
  }

  setDatasourceProcessor(processor: Function) {
    const setProcessor = (this.datasource as any).setProcessGet;
    if (typeof processor === 'function') {
      setProcessor.call(this.datasource, processor);
    }
  }

  setItemProcessor(itemUpdater: (item: IndexedItem) => any) {
    this.setDatasourceProcessor((result: IndexedItem[]) =>
      result.forEach(itemUpdater)
    );
  }
}
