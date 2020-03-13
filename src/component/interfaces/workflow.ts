import { Process, ProcessSubject } from './process';
import { IDatasource } from './datasource';
import { Datasource } from '../classes/datasource';

export interface ScrollerWorkflow {
  call: Function;
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
  datasource?: IDatasource | Datasource;
}

export interface StateMachineMethods {
  run: (process: any) => any;
  interrupt: (params: InterruptParams) => any;
  done: () => any;
  onError: (process: Process, payload: any) => any;
}

export interface StateMachineParams {
  input: ProcessSubject;
  methods: StateMachineMethods;
}
