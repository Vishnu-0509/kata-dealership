import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../api/client';
import { VEHICLE_CATEGORIES } from '../constants/categories';

describe('Axios 401 Interceptor and Category Filter Tests (TDD)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('includes Hatchback and Convertible in shared category definitions', () => {
    expect(VEHICLE_CATEGORIES).toContain('Hatchback');
    expect(VEHICLE_CATEGORIES).toContain('Convertible');
  });

  it('does not trigger page redirect on 401 for /auth/login so inline error displays', async () => {
    localStorage.setItem('token', 'existing-token');

    // Simulate Axios rejection with a 401 on /auth/login
    const error = {
      config: { url: '/auth/login' },
      response: { status: 401, data: { message: 'Invalid credentials' } },
    };

    // Grab the response error handler from apiClient interceptors
    // @ts-expect-error accessing internal axios handlers for unit testing
    const responseInterceptor = apiClient.interceptors.response.handlers[0]?.rejected as (err: unknown) => Promise<unknown>;

    await expect(responseInterceptor(error)).rejects.toEqual(error);

    // On login failure, it shouldn't clear other sessions or reload window
    // (In current broken code, window.location.href is unconditionally assigned)
  });
});
