import { browser, by, element } from 'protractor';

export class AppDashboard {

  getBrowser() {
    return browser;
  }

  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.xpath('/html/body/app-dashboard/div/main/div/ng-component/div')).getText();
  }
  getBody() {
    return element(by.xpath('/html/body'));
  }
  getByCss(selector) {
    return element.all(by.css(selector));
  }
  getFooterText() {
    return element(by.className('app-footer')).getText();
  }
}
