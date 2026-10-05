const API_BASE = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('skillshare_token');
};

export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('skillshare_token', token);
  } else {
    localStorage.removeItem('skillshare_token');
  }
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; [key: string]: any }> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      return { success: false, message: errorMsg, ...data };
    }

    return { success: true, ...data };
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error);
    return {
      success: false,
      message: error.message || 'Unable to connect to Skill Share service. Please check your connection.',
    };
  }
}
