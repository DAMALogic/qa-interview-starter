/**
 * Authentication flow tests
 *
 * These starter specs cover the happy path and two negative cases.
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { TaskPage } = require('../pages/TaskPage');

test.describe('Authentication', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('shows the login form on initial load', async ({ page }) => {
    await expect(page.getByTestId('login-page')).toBeVisible();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitBtn).toBeEnabled();
  });

  test('logs in with valid credentials and shows the task board', async ({ page }) => {
    await loginPage.login('admin', 'password123');

    await expect(page.getByTestId('task-board')).toBeVisible();
    await expect(page.getByTestId('header-username')).toContainText('admin');
  });

  test('displays an error message for invalid credentials', async ({ page }) => {
    await loginPage.login('admin', 'wrongpassword');

    await expect(loginPage.errorAlert).toBeVisible();
    await expect(loginPage.errorAlert).toContainText('Invalid credentials');
  });

  test('logs out and returns to the login screen', async ({ page }) => {
    // Login first
    await loginPage.login('admin', 'password123');
    await expect(page.getByTestId('task-board')).toBeVisible();

    // Logout
    await page.getByTestId('logout-btn').click();
    await expect(page.getByTestId('login-page')).toBeVisible();
  });
});
