import { Direction } from './direction';

export interface Run {
  direction?: Direction;
  scroll?: boolean;
}

export interface Previous {
  backwardClipSize: number;
  forwardClipSize: number;
  direction: Direction;
}
