const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiOptions {
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('claimwise-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

async function getRefreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('claimwise-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.refreshToken ?? null;
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const newToken = data?.data?.accessToken;

  if (newToken && typeof window !== 'undefined') {
    const raw = localStorage.getItem('claimwise-auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.state.accessToken = newToken;
      localStorage.setItem('claimwise-auth', JSON.stringify(parsed));
    }
  }

  return newToken ?? null;
}

async function request<T>(method: Method, path: string, options: ApiOptions = {}): Promise<T> {
  let token = await getAccessToken();

  const makeRequest = async (authToken: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    return fetch(`${API_BASE}${path}`, {
      method,
      headers,
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  };

  let res = await makeRequest(token);

  // Token expired — try refresh
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await makeRequest(newToken);
    } else {
      // Refresh failed — clear auth and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('claimwise-auth');
        window.location.href = '/auth';
      }
      throw new ApiError(401, 'Session expired. Please log in again.');
    }
  }

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || 'An error occurred');
  }

  return data;
}

export const api = {
  get: <T>(path: string, opts?: ApiOptions) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: ApiOptions) => request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: ApiOptions) => request<T>('PUT', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: ApiOptions) => request<T>('PATCH', path, { ...opts, body }),
  delete: <T>(path: string, opts?: ApiOptions) => request<T>('DELETE', path, opts),
};

export { ApiError };

// ── Typed API calls ───────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; name: string; postcode?: string }) =>
    api.post('/api/v1/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/v1/auth/login', data),
  logout: (refreshToken: string) =>
    api.post('/api/v1/auth/logout', { refreshToken }),
  me: () => api.get('/api/v1/auth/me'),
  updateProfile: (data: { name?: string; postcode?: string; householdSize?: number }) =>
    api.patch('/api/v1/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/api/v1/auth/change-password', data),
  forgotPassword: (email: string) =>
    api.post('/api/v1/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/api/v1/auth/reset-password', { token, password }),
  deleteAccount: (password?: string) =>
    request('DELETE', '/api/v1/auth/account', { body: password ? { password } : undefined }),
};

export const dashboardApi = {
  getDashboard: () => api.get('/api/v1/dashboard'),
  getSavings: () => api.get('/api/v1/dashboard/savings'),
  markSavingClaimed: (id: string) => api.patch(`/api/v1/dashboard/savings/${id}/claimed`),
};

export const benefitsApi = {
  check: (profile: unknown) => api.post('/api/v1/benefits/check', profile),
  getLatest: () => api.get('/api/v1/benefits/latest'),
  getHistory: () => api.get('/api/v1/benefits/history'),
};

export const billsApi = {
  upload: async (formData: FormData) => {
    const makeUploadRequest = async (authToken: string) => {
      return fetch(`${API_BASE}/api/v1/bills/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });
    };

    let token = await getAccessToken() ?? '';
    let res = await makeUploadRequest(token);

    // Token expired during upload — refresh and retry once
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        token = newToken;
        res = await makeUploadRequest(newToken);
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('claimwise-auth');
          window.location.href = '/auth';
        }
        throw new ApiError(401, 'Session expired. Please log in again.');
      }
    }

    const data = await res.json();
    if (!res.ok) throw new ApiError(res.status, data?.error || 'Upload failed');
    return data;
  },
  getBills: (type?: string) => api.get(`/api/v1/bills${type ? `?type=${type}` : ''}`),
  getBill: (id: string) => api.get(`/api/v1/bills/${id}`),
  deleteBill: (id: string) => api.delete(`/api/v1/bills/${id}`),
};

export const energyApi = {
  scan: (data: { currentSupplier?: string; currentTariff?: string; annualUsageKwh?: number; postcode: string }) =>
    api.post('/api/v1/energy/scan', data),
  getHistory: () => api.get('/api/v1/energy/history'),
  clickAffiliate: (partner: string, type: string) =>
    api.post('/api/v1/energy/click-affiliate', { partner, type }),
};

export const alertsApi = {
  getAlerts: (status?: string) => {
    const normalizedStatus = status?.trim().toUpperCase();
    return api.get(`/api/v1/alerts${normalizedStatus ? `?status=${normalizedStatus}` : ''}`);
  },
  markRead: (id: string) => api.patch(`/api/v1/alerts/${id}/read`),
  markAllRead: () => api.patch('/api/v1/alerts/read-all'),
  dismiss: (id: string) => api.delete(`/api/v1/alerts/${id}`),
};

export const subscriptionApi = {
  getPlans: () => api.get('/api/v1/subscription/plans'),
  getCurrent: () => api.get('/api/v1/subscription/current'),
  createCheckout: (plan: string) => api.post('/api/v1/subscription/create-checkout', { plan }),
};

export const googleAuthApi = {
  signIn: (idToken: string) => api.post('/api/v1/auth/google', { idToken }),
};
