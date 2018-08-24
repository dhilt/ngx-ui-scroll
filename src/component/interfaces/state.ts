import { Process, ItemAdapter } from './index';
import { FetchModel } from '../classes/fetch';
import { ClipModel } from '../classes/clip';

export interface State {
  initTime: number;
  cycleCount: number;
  isInitialCycle: boolean;
  workflowCycleCount: number;
  isInitialWorkflowCycle: boolean;
  countDone: number;

  process: Process;
  startIndex: number;
  position: number;
  scroll: boolean;
  fetch: FetchModel;
  clip: ClipModel;

  pending: boolean;
  firstVisibleItem: ItemAdapter;
  lastVisibleItem: ItemAdapter;
}
