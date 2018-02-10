import { By } from '@angular/platform-browser';
import { ComponentFixture } from '@angular/core/testing';
import { TestComponent } from './testedComponent';
import { Direction } from '../../src/component/interfaces/direction';
import { Datasource } from '../../src/component/interfaces/datasource';

export class Padding {
  direction: Direction;
  element;
  style;

  constructor(fixture: ComponentFixture <any>, direction: Direction) {
    this.direction = direction;
    this.element = fixture.debugElement.query(By.css(`[data-padding-${direction}]`));
    this.style = this.element.nativeElement.style;
  }
}

export class Misc {

  fixture: ComponentFixture <TestComponent>;
  component: TestComponent;
  datasource: Datasource;
  hostElement;
  padding = {};

  constructor(fixture: ComponentFixture <any>) {
    this.fixture = fixture;
    this.component = fixture.componentInstance;
    this.datasource = this.component.datasource;
    this.hostElement = this.elementByAttr('ui-scroll');
    this.padding[Direction.forward] = new Padding(fixture, Direction.forward);
    this.padding[Direction.backward] = new Padding(fixture, Direction.backward);
  }

  elementByAttr(attr) {
    return this.fixture.debugElement.query(By.css(attr));
  }
}
