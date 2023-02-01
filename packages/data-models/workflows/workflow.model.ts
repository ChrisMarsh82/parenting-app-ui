// NOTE - this import can lead to build issues
// https://www.codejam.info/2021/10/typescript-cannot-write-file-overwrite-input.html
import type { ITasks } from "scripts/src/tasks";
import type { IDeploymentConfig } from "../deployment.model";

export interface IWorkflowContext {
  [step_name: string]: { output: any };
}

interface IWorkflowStep {
  name: string;
  condition?: (context: IWorkflowStepContext) => Promise<boolean>;
  function: (context: IWorkflowStepContext) => Promise<any>;
}
interface IWorkflowStepContext {
  config: IDeploymentConfig;
  workflow: IWorkflowContext;
  tasks: ITasks;
  /** Positional args passed to workflow script */
  args: string[];
  options: { [optionName: string]: string | boolean };
}

export interface IWorkflow {
  /**
   * The label will be used to select the workflow from a list.
   * If omitted the workflow will not be shown for selection
   **/
  label?: string;
  steps: IWorkflowStep[];
  options?: { flags: string; description?: string; defaultValue?: string | boolean }[];
  /** Sub workflows */
  children?: IDeploymentWorkflows;
}

export interface IDeploymentWorkflows {
  [name: string]: IWorkflow;
}

// local cache bust to force recompile of tasks
const version = 1.4;
