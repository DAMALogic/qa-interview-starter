/**
 * LoginPage — Page Object Model
 *
 * Encapsulates all interactions with the Login screen.
 * Candidates are encouraged to extend or refactor this POM
 * to demonstrate their design approach.
 */
class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Locators
    this.usernameInput = page.getByTestId('username-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitBtn    = page.getByTestId('login-submit');
    this.errorAlert   = page.getByTestId('login-error');
    this.loginForm    = page.getByTestId('login-form');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
  }

  async getErrorMessage() {
    return this.errorAlert.textContent();
  }
}

module.exports = { LoginPage };
