/**
 * Task management tests
 *
 * Starter specs covering the core CRUD flows and filter behavior.
 * Candidates should extend these with edge cases and API-level tests.
 *
 * Suggested areas to explore:
 *  - Creating tasks with all priority levels
 *  - Editing a task and verifying the update persists
 *  - Due-date display and overdue styling
 *  - Search returns correct subset of tasks
 *  - Active task count updates correctly after each action
 *  - Bulk interactions (create many, filter, delete)
 *  - API contract tests (send malformed bodies, missing fields)
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { TaskPage } = require('../pages/TaskPage');

// Shared login helper
async function loginAs(page, username = 'admin', password = 'password123') {
  const lp = new LoginPage(page);
  await lp.goto();
  await lp.login(username, password);
  await page.getByTestId('task-board').waitFor({ state: 'visible' });
}

test.describe('Task Board', () => {
  let taskPage;

  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    taskPage = new TaskPage(page);
  });

  test('displays the task board with seeded tasks', async ({ page }) => {
    await expect(taskPage.board).toBeVisible();
    const items = taskPage.getTaskItems();
    await expect(items).not.toHaveCount(0);
  });

  test('shows active task count in the subtitle', async () => {
    await expect(taskPage.activeCount).toBeVisible();
    await expect(taskPage.activeCount).toContainText(/\d+ task/);
  });

  test('adds a new task and it appears in the list', async () => {
    const title = `Test task ${Date.now()}`;

    await taskPage.openAddForm();
    await taskPage.fillAndSubmitTask({ title, priority: 'High' });

    await expect(taskPage.taskForm).not.toBeVisible();
    await expect(taskPage.getTaskByTitle(title)).toBeVisible();
  });

  test('shows a validation error when submitting an empty title', async () => {
    await taskPage.openAddForm();
    await taskPage.taskFormSubmit.click();   // submit without filling title

    await expect(taskPage.taskFormError).toBeVisible();
    await expect(taskPage.taskFormError).toContainText('required');
  });

  test('marks a task as completed and it gets a strikethrough', async ({ page }) => {
    const title = `Complete me ${Date.now()}`;

    // Add a fresh task
    await taskPage.openAddForm();
    await taskPage.fillAndSubmitTask({ title });

    // Toggle it
    await taskPage.completeTask(title);

    // The item should now have the completed class
    const taskItem = taskPage.getTaskByTitle(title);
    await expect(taskItem).toHaveClass(/task-item--completed/);
  });

  test('deletes a task and removes it from the list', async ({ page }) => {
    const title = `Delete me ${Date.now()}`;

    await taskPage.openAddForm();
    await taskPage.fillAndSubmitTask({ title });
    await expect(taskPage.getTaskByTitle(title)).toBeVisible();

    await taskPage.deleteTask(title);

    await expect(taskPage.getTaskByTitle(title)).not.toBeVisible();
  });

  test('cancels the add-task form without creating a task', async () => {
    await taskPage.openAddForm();
    await taskPage.taskTitleInput.fill('I will not be saved');
    await taskPage.taskFormCancel.click();

    await expect(taskPage.taskForm).not.toBeVisible();
  });

  // TODO (candidate): Test editing an existing task
  // TODO (candidate): Test that active count decrements after completing a task
  // TODO (candidate): Test that active count decrements after deleting an active task
});

test.describe('Task Filters', () => {
  let taskPage;

  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    taskPage = new TaskPage(page);
  });

  test('"Active" filter shows only incomplete tasks', async ({ page }) => {
    await taskPage.filterBy('active');

    // Every visible task should NOT have the completed class
    const items = taskPage.getTaskItems();
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      await expect(items.nth(i)).not.toHaveClass(/task-item--completed/);
    }
  });

  test('"Completed" filter shows only completed tasks', async ({ page }) => {
    await taskPage.filterBy('completed');

    const items = taskPage.getTaskItems();
    const count = await items.count();

    // Either there are completed tasks, or we see the empty state
    if (count === 0) {
      await expect(taskPage.emptyState).toBeVisible();
    } else {
      for (let i = 0; i < count; i++) {
        await expect(items.nth(i)).toHaveClass(/task-item--completed/);
      }
    }
  });

  test('search narrows down the task list', async ({ page }) => {
    // Use a term from the seeded data that is unique enough
    await taskPage.search('automat');

    const items = taskPage.getTaskItems();
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const titleEl = items.nth(i).getByTestId('task-title');
      const text = await titleEl.textContent();
      expect(text.toLowerCase()).toContain('automat');
    }
  });

  // TODO (candidate): Test that switching filter tabs resets search
  // TODO (candidate): Test empty state message when search returns no results
});
