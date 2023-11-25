import { Workflow } from './vscroll';

type WorkflowParams = ConstructorParameters<typeof Workflow>;
export type CustomRoutines = WorkflowParams[0]['Routines'];
