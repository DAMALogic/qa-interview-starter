/**
 * API-level tests (via Playwright's `request` context)
 *
 * Starter specs covering the REST API contract independently from the UI.
 * Senior QA candidates should demonstrate comfort with both UI and API testing.
 *
 * Suggested areas to explore:
 *  - Response schema validation
 *  - Boundary / fuzz testing on title length
 *  - Concurrent requests (race conditions)
 *  - Auth token tampering
 *  - CRUD round-trip: create → read → update → delete
 */

const { test, expect } = require('@playwright/test');

const API = 'http://localhost:3001/api';

async function getAuthToken(request) {
  const res = await request.post(`${API}/auth/login`, {
    data: { username: 'admin', password: 'password123' },
  });
  const body = await res.json();
  return body.token;
}

test.describe('Auth API', () => {
  test('POST /auth/login → 200 with token for valid credentials', async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, {
      data: { username: 'tester', password: 'tester123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('token');
    expect(body.username).toBe('tester');
  });

  test('POST /auth/login → 401 for invalid credentials', async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, {
      data: { username: 'admin', password: 'wrong' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('POST /auth/login → 400 when body fields are missing', async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, {
      data: { username: 'admin' }, // missing password
    });
    expect(res.status()).toBe(400);
  });

  test('GET /tasks → 401 without auth token', async ({ request }) => {
    const res = await request.get(`${API}/tasks`);
    expect(res.status()).toBe(401);
  });
});

test.describe('Tasks API', () => {
  let token;

  test.beforeAll(async ({ request }) => {
    token = await getAuthToken(request);
  });

  function authHeaders() {
    return { 'x-auth-token': token };
  }

  test('GET /tasks → 200 and returns an array', async ({ request }) => {
    const res = await request.get(`${API}/tasks`, { headers: authHeaders() });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('POST /tasks → 201 and creates a task', async ({ request }) => {
    const res = await request.post(`${API}/tasks`, {
      headers: authHeaders(),
      data: { title: 'API test task', priority: 'High' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body.title).toBe('API test task');
    expect(body.priority).toBe('High');
    expect(body.completed).toBe(false);
  });

  test('POST /tasks → 400 when title is empty', async ({ request }) => {
    const res = await request.post(`${API}/tasks`, {
      headers: authHeaders(),
      data: { title: '' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('PUT /tasks/:id → 200 and updates a task', async ({ request }) => {
    // Create one first
    const created = await request.post(`${API}/tasks`, {
      headers: authHeaders(),
      data: { title: 'Task to update' },
    });
    const { id } = await created.json();

    // Update it
    const res = await request.put(`${API}/tasks/${id}`, {
      headers: authHeaders(),
      data: { title: 'Updated title', completed: true },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('Updated title');
    expect(body.completed).toBe(true);
  });

  test('DELETE /tasks/:id → 200 and removes the task', async ({ request }) => {
    // Create one to delete
    const created = await request.post(`${API}/tasks`, {
      headers: authHeaders(),
      data: { title: 'Task to delete' },
    });
    const { id } = await created.json();

    // Delete it
    const res = await request.delete(`${API}/tasks/${id}`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);

    // Confirm it's gone — it won't appear in the list
    const list = await request.get(`${API}/tasks`, { headers: authHeaders() });
    const tasks = await list.json();
    expect(tasks.find((t) => t.id === id)).toBeUndefined();
  });

  test('DELETE /tasks/:id → 404 for a non-existent task', async ({ request }) => {
    const res = await request.delete(`${API}/tasks/non-existent-id`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(404);
  });

  // TODO (candidate): Test GET /tasks?status=active only returns incomplete tasks
  // TODO (candidate): Test GET /tasks?search=foo filters correctly
  // TODO (candidate): Test PUT with an invalid priority value → 400
  // TODO (candidate): Test creating a task with a duplicate title (currently allowed — is this a bug?)
});
