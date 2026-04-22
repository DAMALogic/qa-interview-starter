/**
 * TaskPage — Page Object Model
 *
 * Encapsulates all interactions with the Task Board.
 * Candidates should extend this POM and consider adding:
 *   - API-based helpers (bypass UI for setup / teardown)
 *   - Assertions as reusable methods
 *   - Fixtures for common user states
 */
class TaskPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Board elements
    this.board        = page.getByTestId('task-board');
    this.addTaskBtn   = page.getByTestId('add-task-btn');
    this.searchInput  = page.getByTestId('search-input');
    this.taskList     = page.getByTestId('task-list');
    this.emptyState   = page.getByTestId('tasks-empty');
    this.activeCount  = page.getByTestId('active-count');

    // Filter tabs
    this.filterAll       = page.getByTestId('filter-all');
    this.filterActive    = page.getByTestId('filter-active');
    this.filterCompleted = page.getByTestId('filter-completed');

    // Form elements
    this.taskForm         = page.getByTestId('task-form');
    this.taskTitleInput   = page.getByTestId('task-title-input');
    this.taskPriority     = page.getByTestId('task-priority-select');
    this.taskDueDate      = page.getByTestId('task-due-date-input');
    this.taskFormSubmit   = page.getByTestId('task-form-submit');
    this.taskFormCancel   = page.getByTestId('task-form-cancel');
    this.taskFormError    = page.getByTestId('task-form-error');
  }

  /** Click "Add Task" to open the form */
  async openAddForm() {
    await this.addTaskBtn.click();
    await this.taskForm.waitFor({ state: 'visible' });
  }

  /**
   * Fill and submit the task form
   * @param {{ title: string, priority?: string, dueDate?: string }} data
   */
  async fillAndSubmitTask({ title, priority, dueDate } = {}) {
    if (title !== undefined)    await this.taskTitleInput.fill(title);
    if (priority !== undefined) await this.taskPriority.selectOption(priority);
    if (dueDate !== undefined)  await this.taskDueDate.fill(dueDate);
    await this.taskFormSubmit.click();
  }

  /** Return all task-item locators currently visible */
  getTaskItems() {
    return this.page.getByTestId('task-item');
  }

  /** Return the task item that contains the given title text */
  getTaskByTitle(title) {
    return this.page
      .getByTestId('task-item')
      .filter({ has: this.page.getByText(title, { exact: true }) });
  }

  /** Toggle the complete checkbox on a task by title */
  async completeTask(title) {
    await this.getTaskByTitle(title).getByTestId('task-checkbox').click();
  }

  /** Click the edit button on a task by title */
  async editTask(title) {
    await this.getTaskByTitle(title).getByTestId('task-edit-btn').click();
  }

  /** Click delete (handles the confirm dialog automatically) */
  async deleteTask(title) {
    this.page.on('dialog', (d) => d.accept());
    await this.getTaskByTitle(title).getByTestId('task-delete-btn').click();
  }

  /** Filter to a given tab: 'all' | 'active' | 'completed' */
  async filterBy(tab) {
    await this.page.getByTestId(`filter-${tab}`).click();
  }

  /** Type into the search box */
  async search(query) {
    await this.searchInput.fill(query);
  }
}

module.exports = { TaskPage };
