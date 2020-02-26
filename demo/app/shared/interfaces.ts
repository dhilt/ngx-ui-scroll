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
  scope?: string;
  title: string;
  titleId: string;
  viewportId: string;
  addClass?: string;
  noWorkView?: boolean;
  logViewOnly?: boolean;
  noInfo?: boolean;

  // dynamic data
  count: number;
  log: string;
}
