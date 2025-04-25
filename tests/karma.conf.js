const PuppeteerPath = require('puppeteer').executablePath();

try {
  const dotenv = require('dotenv');
  const { error } = dotenv.config({ path: '../.env' });
  if (error) {
    throw error;
  }
} catch (e) {
  console.log("Can't read .env");
}

process.env.CHROME_BIN = PuppeteerPath;
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
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      '@angular-devkit/build-angular/plugins/karma',
      'karma-spec-reporter'
    ],
    files: ['miscellaneous/styles.css'],
    client: {
      clearContext: false
    },
    reporters: ['spec'],

    port: TEST_SERVER_PORT,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: !process.env.CI,
    singleRun: !!process.env.CI,
    restartOnFileChange: true,

    browsers,
    customLaunchers
  });
