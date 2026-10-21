const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('ideaproof_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear token if expired
    if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      localStorage.removeItem('ideaproof_token');
      localStorage.removeItem('ideaproof_user');
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
  }

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (typeof data === 'object' && (data?.error || data?.message || data?.detail)) 
      ? (data.error || data.message || data.detail) 
      : `HTTP Error ${response.status}`;
    throw new ApiError(errorMsg, response.status, data);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    register: (payload: { email: string; password: string; name?: string; role?: string }) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
    login: (payload: { email: string; password: string }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    me: () => request('/auth/me'),
    updateMe: (payload: { name?: string; role?: string }) =>
      request('/auth/me', { method: 'PATCH', body: JSON.stringify(payload) }),
  },

  // Ideas
  ideas: {
    list: () => request('/ideas'),
    create: (data: any) => request('/ideas', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => request(`/ideas/${id}`),
    update: (id: string, data: any) => request(`/ideas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/ideas/${id}`, { method: 'DELETE' }),
    seedDemo: () => request('/ideas/demo/seed', { method: 'POST' }),
  },

  // AI Modules
  ai: {
    analyzeIdea: (id: string) => request(`/ideas/${id}/analyze`, { method: 'POST' }),
    marketResearch: (id: string, data?: any) => request(`/ideas/${id}/market-research`, { method: 'POST', body: JSON.stringify(data || {}) }),
    competitorAnalysis: (id: string) => request(`/ideas/${id}/competitor-analysis`, { method: 'POST' }),
    validateFull: (id: string) => request(`/ideas/${id}/validate`, { method: 'POST' }),
    sharemarketAnalysis: (id: string) => request<{ sharemarket_analysis: any }>(`/ideas/${id}/sharemarket-analysis`),
    refreshSharemarketAnalysis: (id: string) => request<{ sharemarket_analysis: any }>(`/ideas/${id}/sharemarket-analysis`, { method: 'POST' }),
    notifyStability: (id: string) => request<{ notification_result: any }>(`/ideas/${id}/notify-stability`, { method: 'POST' }),
  },

  // Surveys
  surveys: {
    list: (ideaId: string) => request(`/ideas/${ideaId}/surveys`),
    create: (ideaId: string, data: any) => request(`/ideas/${ideaId}/surveys`, { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => request(`/surveys/${id}`),
    update: (id: string, data: any) => request(`/surveys/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    generateQuestions: (data: { title: string; problem_statement?: string; target_customers?: string }) =>
      request('/surveys/generate-questions', { method: 'POST', body: JSON.stringify(data) }),
    getAnalytics: (id: string) => request(`/surveys/${id}/analytics`),
    getExportCsvUrl: (id: string) => `${API_BASE_URL}/surveys/${id}/export-csv`,
  },

  // Public Survey Access
  publicSurvey: {
    get: (token: string) => request(`/public/surveys/${token}`),
    submit: (token: string, answers: Record<string, any>) =>
      request(`/public/surveys/${token}/responses`, { method: 'POST', body: JSON.stringify({ answers }) }),
  },

  // Competitors
  competitors: {
    list: (ideaId: string) => request(`/ideas/${ideaId}/competitors`),
    create: (ideaId: string, data: any) => request(`/ideas/${ideaId}/competitors`, { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/competitors/${id}`, { method: 'DELETE' }),
  },

  // Financial Simulator
  financial: {
    get: (ideaId: string) => request(`/ideas/${ideaId}/financial-analysis`),
    simulate: (ideaId: string, inputs: any) =>
      request(`/ideas/${ideaId}/financial-analysis`, { method: 'POST', body: JSON.stringify(inputs) }),
  },

  // Risks
  risks: {
    list: (ideaId: string) => request(`/ideas/${ideaId}/risks`),
    create: (ideaId: string, data: any) => request(`/ideas/${ideaId}/risks`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/risks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/risks/${id}`, { method: 'DELETE' }),
  },

  // Roadmap
  roadmap: {
    list: (ideaId: string) => request(`/ideas/${ideaId}/roadmap`),
    create: (ideaId: string, data: any) => request(`/ideas/${ideaId}/roadmap`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/roadmap/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/roadmap/${id}`, { method: 'DELETE' }),
  },

  // Reports
  reports: {
    list: (ideaId: string) => request(`/ideas/${ideaId}/reports`),
    create: (ideaId: string) => request(`/ideas/${ideaId}/reports`, { method: 'POST' }),
    downloadPdfUrl: (reportId: string) => `${API_BASE_URL}/reports/${reportId}/download`,
  },

  // Dashboard & Team
  dashboard: {
    summary: () => request('/dashboard/summary'),
    activity: () => request('/activity'),
  },
  team: {
    get: () => request('/team'),
    invite: (data: { email: string; role?: string }) => request('/team/invite', { method: 'POST', body: JSON.stringify(data) }),
  },
};
