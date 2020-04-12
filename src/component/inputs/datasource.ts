import { VALIDATORS } from './validation';
import { ICommonProps } from '../interfaces/index';

const { OBJECT, FUNC_WITH_X_AND_MORE_ARGUMENTS } = VALIDATORS;

export enum DatasourceProps {
  get = 'get',
  settings = 'settings',
  devSettings = 'devSettings',
}

export const DATASOURCE: ICommonProps<DatasourceProps> = {
  [DatasourceProps.get]: {
    validators: [FUNC_WITH_X_AND_MORE_ARGUMENTS(2)],
    mandatory: true
  },
  [DatasourceProps.settings]: {
    validators: [OBJECT]
  },
  [DatasourceProps.devSettings]: {
    validators: [OBJECT]
  }
};
