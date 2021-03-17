const PuppeteerPath = require('puppeteer').executablePath();
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const dotenv = require('dotenv');

process.env.CHROME_BIN = PuppeteerPath;

const config = dotenv.config();
if (config.error) {
  console.error(config.error.toString());
}
const TEST_SERVER_PORT = process.env.TEST_SERVER_PORT || 9876;

module.exports = function (config) {

  const configuration = {

    basePath: '',

    frameworks: ['jasmine'],

    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-webpack'),
      require('karma-sourcemap-loader'),
      require('karma-spec-reporter')
    ],

    files: [
      'tests/miscellaneous/styles.css',
      { pattern: './tests/_index.js', watched: false }
    ],

    exclude: [],

    preprocessors: {
      './tests/_index.js': ['webpack', 'sourcemap']
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
            use: [
              { loader: 'ts-loader' },
              { loader: 'angular2-template-loader' },
              { loader: 'source-map-loader' }
            ],
            exclude: /node_modules/
          },
          {
            test: /\.html$/,
            use: 'raw-loader'
          },
          {
            test: /\.css$/,
            use: [
              { loader: 'to-string-loader' },
              { loader: 'css-loader' }]
          },
          {
            test: /\.scss$/,
            use: [
              { loader: 'raw-loader' },
              { loader: 'sass-loader' }
            ]
          }
        ],
        exprContextCritical: false
      },
      devtool: 'inline-source-map',
      performance: { hints: false },
      /* Workaround for https://github.com/angular/angular/issues/21560 */
      plugins: [
        new FilterWarningsPlugin({
          exclude: /System.import/
        })
      ]
    },

    webpackServer: {
      noInfo: true
    },

    reporters: ['spec'],

    port: TEST_SERVER_PORT,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: !process.env.CI,
    singleRun: !!process.env.CI,

    browsers: process.env.CI || !process.env.NOT_HEADLESS ?
      ['ChromeHeadlessSized'] :
      [process.platform === 'linux' ? 'Chromium' : 'ChromeSized'],

    customLaunchers: {
      'ChromeHeadlessSized': {
        base: 'ChromeHeadless',
        flags: ['--window-size=1024,768']
      },
      'ChromeSized': {
        base: 'Chrome',
        flags: ['--window-size=1024,768']
      }
    }
  };

  config.set(configuration);

};
