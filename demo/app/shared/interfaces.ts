export interface DemoSources {
  datasource: string;
  template: string;
  styles: string;
}

export interface DemoContext {
  // static data
  title: string;
  titleId: string;
  id: string;
  addClass?: string;

  // dynamic data
  count: number;
  log: string;
}
