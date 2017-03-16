import { Ng2UiScrollAppPage } from './app.po';

describe('ng2-ui-scroll-app App', () => {
  let page: Ng2UiScrollAppPage;

  beforeEach(() => {
    page = new Ng2UiScrollAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
