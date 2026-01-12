const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

interface User {
  _id: string;
  email: string;
  fullname: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponse {
  user: User;
}

// Store tokens
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const api = {
  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    
    // Handle error responses - backend may return HTML or JSON
    if (!response.ok) {
      // Map status codes to user-friendly messages
      const errorMessages: Record<number, string> = {
        400: 'Please fill in all fields',
        404: 'User not found',
        410: 'Invalid password',
        500: 'Server error. Please try again later.',
      };
      
      return {
        statusCode: response.status,
        data: {} as LoginResponse,
        message: errorMessages[response.status] || 'Login failed',
        success: false,
      };
    }
    
    const data = await response.json();
    
    if (data.success && data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
    }
    
    return data;
  },

  async register(fullname: string, email: string, password: string): Promise<ApiResponse<RegisterResponse>> {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullname, email, password }),
    });
    
    // Handle error responses - backend may return HTML or JSON
    if (!response.ok) {
      // Map status codes to user-friendly messages
      const errorMessages: Record<number, string> = {
        400: 'Please fill in all fields',
        409: 'Email already exists',
        500: 'Server error. Please try again later.',
      };
      
      return {
        statusCode: response.status,
        data: {} as RegisterResponse,
        message: errorMessages[response.status] || 'Registration failed',
        success: false,
      };
    }
    
    const data = await response.json();
    return data;
  },

  async logout(): Promise<ApiResponse<null>> {
    const token = getAccessToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      // Clear local storage regardless of response
      setAccessToken(null);
      
      if (!response.ok) {
        return {
          statusCode: response.status,
          data: null,
          message: 'Logout failed',
          success: false,
        };
      }
      
      return await response.json();
    } catch (error) {
      // Clear local storage even if request fails
      setAccessToken(null);
      return {
        statusCode: 500,
        data: null,
        message: 'Logout failed',
        success: false,
      };
    }
  },

  // Check if user is logged in
  isAuthenticated(): boolean {
    return !!getAccessToken();
  },
};
