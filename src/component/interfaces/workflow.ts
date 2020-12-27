import { Process, ProcessSubject } from './process';
import { IDatasource } from './datasource';
import { IAdapterConfig } from './adapter';
import { Item } from '../classes/item';
import { Datasource } from '../classes/datasource';
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
  datasource: Datasource | IDatasource;
  version?: string;
  element?: HTMLElement;
  workflow?: ScrollerWorkflow;
  adapterConfig?: IAdapterConfig;
  scroller?: Scroller; // for re-instantiation
};

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
