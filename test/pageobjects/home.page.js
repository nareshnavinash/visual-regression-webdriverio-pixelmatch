const Page = require('./page');

class HomePage extends Page {
  get searchTextbox() {return $('div input[name="q"]');}

  /**
   * a method to return whether the page is displayed or not
   * @return {boolean} returns true or false
   */
  isDisplayed() {
    return this.searchTextbox.isExisting();
  }
}

module.exports = new HomePage();
