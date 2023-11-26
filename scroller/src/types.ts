import { Workflow } from './vscroll';

type WorkflowParams = ConstructorParameters<typeof Workflow>;
export type RoutinesClassType = WorkflowParams[0]['Routines'];
