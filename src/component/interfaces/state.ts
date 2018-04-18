import { Direction } from './direction';
import { FetchModel } from '../classes/fetch';
import { ClipModel } from '../classes/clip';

export interface State {
  countStart: number;
  countDone : number;
  pending: boolean;
  direction: Direction;
  scroll: boolean;
  fetch: FetchModel;
  clip: ClipModel;
}
