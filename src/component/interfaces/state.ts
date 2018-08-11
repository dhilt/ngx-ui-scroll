import { Process, Direction, ItemAdapter } from './index';
import { FetchModel } from '../classes/fetch';
import { ClipModel } from '../classes/clip';

export interface State {
  isInitial: boolean;
  process: Process;
  wfCycleCount: number;
  cycleCount: number;
  countDone: number;
  position: number;
  direction: Direction;
  scroll: boolean;
  fetch: FetchModel;
  clip: ClipModel;
  startIndex: number;

  pending: boolean;
  firstVisibleItem: ItemAdapter;
  lastVisibleItem: ItemAdapter;
}
