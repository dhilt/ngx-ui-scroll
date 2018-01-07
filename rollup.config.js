import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';

const globals = {
  '@angular/core': 'ng.core',
  '@angular/common': 'ng.common',
  'rxjs/Observable': 'Rx'
};

export default {
  output: {
    format: 'umd',
    name: 'ng.uiScroll',
    globals: globals,
    external: Object.keys(globals),
    sourcemap: true,
    plugins: [resolve(), sourcemaps()],
    onwarn: () => { return },
    exports: 'named'
  }
}
