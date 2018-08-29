import { Process, ItemAdapter, Direction } from './index';
import { FetchModel } from '../classes/fetch';

export interface State {
  initTime: number;
  cycleCount: number;
  isInitialCycle: boolean;
  workflowCycleCount: number;
  isInitialWorkflowCycle: boolean;
  countDone: number;

  process: Process;
  startIndex: number;
  scroll: boolean;
  direction: Direction | null;
  fetch: FetchModel;
  clip: boolean;
  lastPosition: number;

  pending: boolean;
  firstVisibleItem: ItemAdapter;
  lastVisibleItem: ItemAdapter;
}
