const HomePage = require('../pageobjects/home.page');
const ImageUtils = require('../utilities/imageUtil');

describe('Google Tests', () => {
  before(() => {
    // browser.navigateTo(config.url);
  });

  describe('google search page', () => {
    it('Validate the google search page', () => {
      browser.navigateTo(config.url);
      HomePage.isDisplayed();
      ImageUtils.compare('homepage', 0.1);
      ImageUtils.compare('secondhomepage', 0.1);
    });
  });
});
