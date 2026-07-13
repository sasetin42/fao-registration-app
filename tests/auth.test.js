import test from 'node:test';
import assert from 'node:assert';
import axios from 'axios';

// Ensure required environment variables are set for the test run
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-123-456-789';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://mock-supabase-url.supabase.co';
process.env.SUPABASE_KEY = process.env.SUPABASE_KEY || 'mock-supabase-key-123';
process.env.ADMIN_USER = process.env.ADMIN_USER || 'admin';
process.env.ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

// Import the app after environment variables are defined
import app from '../api/index.js';

test.describe('Authentication and API Error Audit', () => {
  let server;
  let baseUrl;
  let originalPost;
  let originalGet;

  // Stubs for Supabase/axios calls
  let mockPostHandler = null;
  let mockGetHandler = null;

  test.before(() => {
    // Start Express server on an ephemeral port
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Stub axios methods to mock Supabase interactions
    originalPost = axios.post;
    originalGet = axios.get;

    axios.post = async (url, data, config) => {
      if (mockPostHandler) {
        return mockPostHandler(url, data, config);
      }
      return { data: {} };
    };

    axios.get = async (url, config) => {
      if (mockGetHandler) {
        return mockGetHandler(url, config);
      }
      return { data: {} };
    };
  });

  test.after(() => {
    // Restore original axios methods and close server
    axios.post = originalPost;
    axios.get = originalGet;
    server.close();
  });

  test.beforeEach(() => {
    // Reset mock handlers before each test
    mockPostHandler = null;
    mockGetHandler = null;
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 1. Traditional Admin Login Verification
  // ════════════════════════════════════════════════════════════════════════════
  test.describe('Traditional Admin Login', () => {
    test('succeeds with correct default credentials and returns a token', async () => {
      const response = await fetch(`${baseUrl}/v1/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: process.env.ADMIN_USER,
          password: process.env.ADMIN_PASS
        })
      });

      assert.strictEqual(response.status, 200);
      const body = await response.json();
      assert.strictEqual(body.success, true);
      assert.ok(body.token);
    });

    test('fails with incorrect credentials with 401 status', async () => {
      const response = await fetch(`${baseUrl}/v1/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: process.env.ADMIN_USER,
          password: 'wrongpassword'
        })
      });

      assert.strictEqual(response.status, 401);
      const body = await response.json();
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.message, 'Invalid credentials');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. Super Admin Login & Verification Fallback
  // ════════════════════════════════════════════════════════════════════════════
  test.describe('Super Admin Login via Supabase Fallback', () => {
    test('succeeds with admin@gmail.com when Supabase returns valid credentials', async () => {
      // Mock Supabase returning token for admin@gmail.com
      mockPostHandler = (url, data, config) => {
        if (url.includes('/auth/v1/token')) {
          assert.strictEqual(data.email, 'admin@gmail.com');
          assert.strictEqual(data.password, 'superpass123');
          return {
            data: {
              access_token: 'valid-supabase-token-xyz',
              user: {
                id: '6ef5eb76-57f4-48bd-a20e-9445a4e5564e',
                email: 'admin@gmail.com'
              }
            }
          };
        }
      };

      const response = await fetch(`${baseUrl}/v1/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin@gmail.com',
          password: 'superpass123'
        })
      });

      assert.strictEqual(response.status, 200);
      const body = await response.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.token, 'valid-supabase-token-xyz');
    });

    test('fails when Supabase auth rejects login credentials', async () => {
      mockPostHandler = (url, data, config) => {
        if (url.includes('/auth/v1/token')) {
          const error = new Error('Unauthorized');
          error.response = { status: 400, data: { error_description: 'Invalid login credentials' } };
          throw error;
        }
      };

      const response = await fetch(`${baseUrl}/v1/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin@gmail.com',
          password: 'wrongpassword'
        })
      });

      assert.strictEqual(response.status, 401);
      const body = await response.json();
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.message, 'Invalid credentials or login failed');
    });

    test('validates Super Admin token in middleware against Supabase user endpoint fallback', async () => {
      // Mock Supabase returning user profile for auth check
      mockGetHandler = (url, config) => {
        if (url.includes('/auth/v1/user')) {
          assert.strictEqual(config.headers.Authorization, 'Bearer valid-supabase-token-xyz');
          return {
            data: {
              id: '6ef5eb76-57f4-48bd-a20e-9445a4e5564e',
              email: 'admin@gmail.com'
            }
          };
        }
        if (url.includes('/rest/v1/registration_list')) {
          return { data: [] };
        }
      };

      const response = await fetch(`${baseUrl}/v1/admin/stats`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-supabase-token-xyz'
        }
      });

      assert.strictEqual(response.status, 200);
      const body = await response.json();
      assert.strictEqual(body.success, true);
      assert.ok(body.data);
    });

    test('rejects token in middleware when Supabase verification fails', async () => {
      mockGetHandler = (url, config) => {
        if (url.includes('/auth/v1/user')) {
          const error = new Error('Unauthorized');
          error.response = { status: 401, data: { message: 'Invalid token' } };
          throw error;
        }
      };

      const response = await fetch(`${baseUrl}/v1/admin/stats`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-supabase-token'
        }
      });

      assert.strictEqual(response.status, 401);
      const body = await response.json();
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error, 'Unauthorized');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. API Error Response Audits
  // ════════════════════════════════════════════════════════════════════════════
  test.describe('API Error Response Audits', () => {
    test('returns 404 JSON response for non-existent route', async () => {
      const response = await fetch(`${baseUrl}/v1/non-existent-endpoint`);
      assert.strictEqual(response.status, 404);
      const body = await response.json();
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.message, 'Not found');
    });

    test('returns 401 JSON response for protected route missing Authorization header', async () => {
      const response = await fetch(`${baseUrl}/v1/admin/stats`);
      assert.strictEqual(response.status, 401);
      const body = await response.json();
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error, 'Unauthorized');
    });

    test('returns 401 JSON response for protected route with invalid token', async () => {
      const response = await fetch(`${baseUrl}/v1/admin/stats`, {
        headers: { 'Authorization': 'Bearer invalid-format-token' }
      });
      assert.strictEqual(response.status, 401);
      const body = await response.json();
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error, 'Unauthorized');
    });
  });
});
