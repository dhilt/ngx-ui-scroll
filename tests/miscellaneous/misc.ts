import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { debounceTime, filter, take } from 'rxjs/operators';

import { IAdapter, IDatasource } from 'ngx-ui-scroll';
import { UiScrollComponent } from '../../scroller/src/ui-scroll.component';

import {
  Workflow,
  Direction,
  DatasourceGet,
  IAdapter as IAdapterInternal
} from './vscroll';

import { TestComponentInterface } from '../scaffolding/testComponent';
import { DatasourceProcessor } from '../scaffolding/datasources/class';
import { Data, generateItem, IndexedItem, Processor } from './items';

export class Padding<Comp = TestComponentInterface> {
  direction: Direction;
  horizontal: boolean;
  element: DebugElement;
  style: CSSStyleDeclaration;

  constructor(
    fixture: ComponentFixture<Comp>,
    direction: Direction,
    horizontal: boolean
  ) {
    this.direction = direction;
    this.horizontal = horizontal;
    this.element = fixture.debugElement.query(
      By.css(`[data-padding-${direction}]`)
    );
    this.style = this.element.nativeElement.style;
  }

  getSize(): number {
    const size = this.style[this.horizontal ? 'width' : 'height'] || '';
    return parseInt(size, 10) || 0;
  }
}

type Scroller = Workflow<Data>['scroller'];

export class Misc<Comp = TestComponentInterface> {
  fixture: ComponentFixture<Comp>;
  testComponent: Comp;
  uiScrollElement: DebugElement;
  viewportElement: DebugElement;
  uiScrollComponent: UiScrollComponent<Data>;
  workflow: Workflow<Data>;
  datasource: IDatasource<Data>;
  adapter: IAdapter<Data>;
  internalAdapter: IAdapterInternal<Data>;
  routines: Scroller['routines'];
  padding: {
    forward: Padding;
    backward: Padding;
  };
  horizontal: boolean;
  window: boolean;

  itemHeight = 20;
  itemWidth = 100;
  shared: { [key: string]: unknown } = {};

  get scroller(): Scroller {
    return this.workflow.scroller;
  }
  get innerLoopCount(): number {
    return this.scroller.state.cycle.innerLoop.total;
  }

  constructor(fixture: ComponentFixture<Comp>) {
    this.fixture = fixture;
    this.testComponent = fixture.componentInstance;
    this.uiScrollElement = fixture.debugElement.query(By.css('[ui-scroll]'));
    this.uiScrollComponent = this.uiScrollElement.componentInstance;
    this.viewportElement = this.uiScrollElement.parent as DebugElement;
    this.workflow = this.uiScrollComponent.workflow;
    this.datasource = (
      this.testComponent as unknown as TestComponentInterface
    ).datasource;
    this.adapter = this.datasource.adapter as IAdapter<Data>;
    this.internalAdapter = this.scroller.adapter as IAdapterInternal<Data>;
    this.routines = this.scroller.routines;
    const { horizontal, windowViewport } = this.scroller.settings;
    this.horizontal = horizontal;
    this.window = windowViewport;
    this.padding = {
      forward: new Padding(fixture, Direction.forward, horizontal),
      backward: new Padding(fixture, Direction.backward, horizontal)
    };
  }

  getComponent(): UiScrollComponent<Data> {
    return this.fixture.debugElement.query(By.css('[ui-scroll]'))
      .componentInstance;
  }

  getWorkflow(): Workflow<Data> {
    return this.getComponent().workflow;
  }

  generateFakeWorkflow(settings?: Scroller['settings']): Workflow {
    return new Workflow({
      consumer: { name: 'fake', version: 'x.x.x' },
      element: this.scroller.routines.element,
      datasource: { get: (_a: unknown, _b: unknown) => null, settings },
      run: _ => null
    });
  }

  spyOnGet(): jasmine.Spy<DatasourceGet<Data>> {
    return spyOn(this.datasource, 'get').and.callThrough();
  }

  getViewportSize(): number {
    return this.scroller.viewport.getSize();
  }

  getItemSize(): number {
    return this.horizontal ? this.itemWidth : this.itemHeight;
  }

  getElements(): HTMLElement[] {
    return this.fixture.nativeElement.querySelectorAll('[data-sid]');
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
    return (
      !isNaN(i) && this.getElementText(i) === i + ': ' + generateItem(i).text
    );
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

  getScrollableElement(): HTMLElement {
    return this.window
      ? document.scrollingElement
      : this.viewportElement.nativeElement;
  }

  getScrollPosition(): number {
    return this.getScrollableElement()[
      this.horizontal ? 'scrollLeft' : 'scrollTop'
    ];
  }

  getMaxScrollPosition(): number {
    return this.getScrollableSize() - this.getViewportSize();
  }

  scrollTo(value: number): void {
    this.adapter.fix({ scrollPosition: value });
  }

  scrollMin(): void {
    this.scrollTo(0);
  }

  scrollMax(): void {
    this.scrollTo(Infinity);
  }

  scrollToRelax(value: number): Promise<void> {
    this.scrollTo(value);
    return this.relaxNext();
  }

  scrollMinRelax(): Promise<void> {
    this.scrollMin();
    return this.relaxNext();
  }

  scrollMaxRelax(): Promise<void> {
    this.scrollMax();
    return this.relaxNext();
  }

  relaxNext(debounce?: number): Promise<void> {
    return new Promise(resolve =>
      (debounce
        ? this.adapter.isLoading$.pipe(
            filter(pending => !pending),
            debounceTime(debounce),
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

  async scrollToIndexRecursively(index: number, limit = 20): Promise<void> {
    const { adapter } = this;
    let leftDiff: number,
      rightDiff: number,
      step = 0;
    do {
      leftDiff = index - adapter.bufferInfo.firstIndex;
      rightDiff = index - adapter.bufferInfo.lastIndex;
      const position = this.getScrollPosition();
      adapter.fix({
        scrollToItem: ({ $index }) => {
          if (leftDiff >= 0 && rightDiff <= 0) {
            return $index === index;
          }
          return (
            $index ===
            (rightDiff > 0
              ? adapter.bufferInfo.lastIndex
              : adapter.bufferInfo.firstIndex)
          );
        }
      });
      if (position !== this.getScrollPosition()) {
        await this.relaxNext();
      }
    } while ((rightDiff > 0 || leftDiff < 0) && ++step < limit);
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
  }

  setDatasourceProcessor(processor: Processor): void {
    const setProcessor = (this.datasource as unknown as DatasourceProcessor)
      .setProcessGet;
    if (typeof processor === 'function') {
      setProcessor.call(this.datasource, processor);
    }
  }

  setItemProcessor(itemUpdater: (item: IndexedItem) => unknown): void {
    this.setDatasourceProcessor((result: IndexedItem[]) =>
      result.forEach(itemUpdater)
    );
  }

  logStat(text = ''): void {
    const debug = this.scroller.logger.debug;
    (this.scroller.logger as unknown as { debug: boolean }).debug = true;
    console.log(this.scroller.logger.stat(text));
    (this.scroller.logger as unknown as { debug: boolean }).debug = debug;
  }
}
