export default {
  input: 'dist/index.js',
  output: {
    file: 'dist/bundles/ngx-ui-scroll.umd.js',
    sourcemap: false,
    format: 'umd',
    name: 'UiScroll',
    globals: {  // not correct. It should be fixed
      '@angular/core': 'ng.core',
      '@angular/common': 'ng.common',
      'rxjs/Observable': 'Rx'
    }
  }
}
