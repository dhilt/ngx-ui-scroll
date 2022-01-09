const PuppeteerPath = require('puppeteer').executablePath();
const dotenv = require('dotenv');

process.env.CHROME_BIN = PuppeteerPath;

const { error } = dotenv.config();
if (error) {
  console.error(error.toString());
}
const TEST_SERVER_PORT = process.env.TEST_SERVER_PORT || 9876;
const BROWSERS = {
  DEFAULT: 'headless',
  CHROME: 'chrome',
  FF: 'firefox',
};
const browser = Object.values(BROWSERS).find(b => b === process.env.TEST_BROWSER) || BROWSERS.DEFAULT;
const flags = ['--window-size=1024,768'];

module.exports = function (config) {

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    files: [
      'miscellaneous/styles.css',
    ],
    client: {
      jasmine: {
        // available possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
      },
      clearContext: false
    },
    reporters: ['dots'],

    port: TEST_SERVER_PORT,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: !process.env.CI,
    singleRun: !!process.env.CI,
    restartOnFileChange: true,

    browsers: process.env.CI || browser === BROWSERS.DEFAULT
      ? ['ChromeHeadlessSized']
      : (browser === BROWSERS.FF
        ? ['FirefoxSized']
        : process.platform === 'linux'
          ? ['ChromiumSized']
          : ['ChromeSized']
      ),

    customLaunchers: {
      'ChromeHeadlessSized': { base: 'ChromeHeadless', flags },
      'ChromiumSized': { base: 'Chromium', flags },
      'ChromeSized': { base: 'Chrome', flags },
      'FirefoxSized': { base: 'Firefox', flags }
    }
  });
};
