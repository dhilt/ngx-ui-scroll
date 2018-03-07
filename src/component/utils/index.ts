import { debouncedRound } from './debouncedRound';
import { checkDatasource } from './checkDatasource';
import { Routines } from './domRoutines';
import { calculateFlowDirection } from './flowDirection';

// todo: need to import throttle properly
// import * as throttle from 'lodash.throttle';
declare const require: any;
const throttle = require('lodash.throttle');

export { throttle, debouncedRound, checkDatasource, Routines, calculateFlowDirection };
