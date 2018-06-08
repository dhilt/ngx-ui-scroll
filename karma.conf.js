module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-webpack'),
      require('karma-spec-reporter'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-sourcemap-loader'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter')
    ],
    files: [
      'tests/miscellaneous/styles.css',
      { pattern: './tests/miscellaneous/entry-files.js', watched: false }
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'), reports: [ 'html', 'lcovonly' ],
      fixWebpackSourcePaths: true
    },

    preprocessors: {
      './tests/miscellaneous/entry-files.js': ['webpack', 'sourcemap']
    },
    webpack: {
      mode: 'development',
      resolve: {
        extensions: ['.ts', '.js']
      },
      module: {
        rules: [
          {
            test: /\.ts/,
            loaders: ['ts-loader'],
            exclude: /node_modules/
          }
        ],
        exprContextCritical: false
      },
      performance: { hints: false },
      devtool: 'inline-source-map'
    },
    webpackServer: {
      noInfo: true
    },

    reporters: ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: !process.env.TRAVIS,
    browsers: process.env.TRAVIS ?
      ['Firefox'] :
      [process.platform === 'linux' ? 'Chromium' : 'Chrome'],
    singleRun: !!process.env.TRAVIS
  });
};
