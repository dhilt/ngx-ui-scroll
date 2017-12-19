import { Injectable } from '@angular/core';

@Injectable()
export class UiScrollService {
  private datasource;
  private _templateRef;

  public setDatasource(datasource) {
    this.datasource = datasource;
  }

  public getDatasource() {
    return this.datasource;
  }

  public setTemplateRef(templateRef) {
    this._templateRef = templateRef;
  }

  public getTemplateRef() {
    return this._templateRef;
  }
}
