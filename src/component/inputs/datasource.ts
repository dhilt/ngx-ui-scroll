import { VALIDATORS } from './validation';
import { ICommonProps } from '../interfaces/index';

const { MANDATORY, OBJECT, FUNC_WITH_X_AND_MORE_ARGUMENTS } = VALIDATORS;

enum DatasourceProps {
  get = 'get',
  settings = 'settings',
  devSettings = 'devSettings',
}

export const DATASOURCE: ICommonProps<DatasourceProps> = {
  [DatasourceProps.get]: {
    validators: [MANDATORY, FUNC_WITH_X_AND_MORE_ARGUMENTS(2)]
  },
  [DatasourceProps.settings]: {
    validators: [OBJECT]
  },
  [DatasourceProps.devSettings]: {
    validators: [OBJECT]
  }
};
