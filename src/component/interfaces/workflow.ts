import { Process, ProcessSubject } from './process';
import { IDatasourceOptional } from './datasource';

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
  datasource?: IDatasourceOptional;
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
