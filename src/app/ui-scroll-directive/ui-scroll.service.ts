import { Injectable } from '@angular/core';
 
@Injectable()
export class UiScrollService {
  private datasource;

  public setDatasource(datasource) {
    this.datasource = datasource;
  }

  public getDatasource() {
    return this.datasource;
  }
}
