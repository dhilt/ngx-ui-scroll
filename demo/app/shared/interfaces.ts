import { IDemo } from '../routes';

export enum DemoSourceType {
  Component = 'Component',
  Template = 'Template',
  Styles = 'CSS',
  Datasource = 'Datasource',
  Server = 'Server'
}

interface DemoSource {
  name: DemoSourceType | string;
  text: string;
  active?: boolean;
}

export type DemoSources = DemoSource[];

export interface DemoContext {
  // static data
  config: IDemo;
  viewportId?: string;
  addClass?: string;
  noWorkView?: boolean;
  logViewOnly?: boolean;
  noInfo?: boolean;

  // dynamic data
  count: number;
  log: string;
}

export interface MyItem {
  id: number;
  text: string;
}
