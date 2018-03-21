import { debouncedRound } from './debouncedRound';
import { checkDatasource } from './checkDatasource';
import { calculateFlowDirection } from './flowDirection';

// todo: need to import throttle properly
// import * as throttle from 'lodash.throttle';
declare const require: any;
const throttle = require('lodash.throttle');

export { throttle, debouncedRound, checkDatasource, calculateFlowDirection };
