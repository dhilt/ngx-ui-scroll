const PuppeteerPath = require('puppeteer').executablePath();
const dotenv = require('dotenv');

process.env.CHROME_BIN = PuppeteerPath;

const { error } = dotenv.config({ path: '../.env' });
if (error) {
  console.log(error.toString());
}
const TEST_SERVER_PORT = process.env.TEST_SERVER_PORT || 9876;

// browser configuration
const BROWSERS = {
  DEFAULT: 'headless',
  CHROME: 'chrome',
  FF: 'firefox'
};
const browser =
  Object.values(BROWSERS).find(b => b === process.env.TEST_BROWSER) ||
  BROWSERS.DEFAULT;
const flags = ['--window-size=1024,768'];
const browsers =
  process.env.CI || browser === BROWSERS.DEFAULT
    ? ['ChromeHeadlessSized']
    : browser === BROWSERS.FF
    ? ['FirefoxSized']
    : process.platform === 'linux'
    ? ['ChromiumSized']
    : ['ChromeSized'];
const customLaunchers = {
  ChromeHeadlessSized: { base: 'ChromeHeadless', flags },
  ChromiumSized: { base: 'Chromium', flags },
  ChromeSized: { base: 'Chrome', flags },
  FirefoxSized: { base: 'Firefox', flags }
};

// karma configuration
module.exports = config =>
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    files: ['miscellaneous/styles.css'],
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

    browsers,
    customLaunchers
  });
