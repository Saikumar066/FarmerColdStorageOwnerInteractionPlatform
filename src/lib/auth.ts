export const AUTH_TOKEN_KEY = "authToken";
export const AUTH_ROLE_KEY = "authRole";

export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getAuthRole = (): string | null => {
  return localStorage.getItem(AUTH_ROLE_KEY);
};

export const setAuthToken = (token: string, role: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_ROLE_KEY, role);
};

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
};

export const getAuthHeaders = (tokenOverride?: string | null): Record<string, string> => {
  const token = tokenOverride ?? getAuthToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
