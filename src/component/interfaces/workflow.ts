import { Process, ProcessSubject } from './process';
import { IDatasource } from './datasource';
import { Item } from '../classes/item';
import { Scroller } from '../scroller';

interface CallWorkflow {
  (process: ProcessSubject): any;
  interrupted?: boolean;
}

export type OnDataChanged = (items: Item[]) => void;

export interface ScrollerWorkflow {
  call: CallWorkflow;
  onDataChanged: OnDataChanged;
}

export interface ScrollerParams {
  datasource: IDatasource;
  version?: string;
  element?: HTMLElement;
  workflow?: ScrollerWorkflow;
  scroller?: Scroller; // for re-instantiation
}

export type WorkflowGetter = () => ScrollerWorkflow;

export interface WorkflowError {
  loop: string;
  time: number;
  message: string;
  process: Process;
}

export interface InterruptParams {
  process: Process;
  finalize: boolean;
  datasource: IDatasource;
}

export interface StateMachineMethods {
  run: (process: any) => (...args: any[]) => void;
  interrupt: (params: InterruptParams) => void;
  done: () => void;
  onError: (process: Process, payload: any) => void;
}

export interface StateMachineParams {
  input: ProcessSubject;
  methods: StateMachineMethods;
}
