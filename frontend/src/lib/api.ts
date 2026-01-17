const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface User {
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

// Course type from backend
export interface Course {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

// Cart types
export interface CartItem {
  courseId: Course;
  price: number;
  addedAt: string;
}

export interface Cart {
  _id?: string;
  cartId?: string;
  userId?: string;
  items: CartItem[];
  totalPrice?: number;
  totalAmount?: number;
}

// Order type
export interface Order {
  _id: string;
  userId: string;
  items: Array<{ courseId: string; price: number }>;
  totalAmount: number;
  status: string;
  createdAt: string;
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

// Clear all auth data when token expires
const clearAuthOnExpiry = () => {
  accessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    // Trigger a page reload to reset auth state
    window.location.href = '/login';
  }
};

// Handle response and check for auth errors
const handleAuthError = (response: Response): boolean => {
  if (response.status === 401) {
    clearAuthOnExpiry();
    return true;
  }
  return false;
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

  // Course endpoints
  async getAllCourses(): Promise<ApiResponse<Course[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/all-courses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return {
          statusCode: response.status,
          data: [],
          message: 'Failed to fetch courses',
          success: false,
        };
      }
      
      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: [],
        message: 'Failed to fetch courses',
        success: false,
      };
    }
  },

  async getEnrolledCourses(): Promise<ApiResponse<Course[]>> {
    const token = getAccessToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/courses/my-courses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        return {
          statusCode: response.status,
          data: [],
          message: 'Failed to fetch enrolled courses',
          success: false,
        };
      }
      
      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: [],
        message: 'Failed to fetch enrolled courses',
        success: false,
      };
    }
  },

  // Cart endpoints
  async getCart(): Promise<ApiResponse<Cart>> {
    const token = getAccessToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      // Handle expired token - don't redirect, just return empty
      if (response.status === 401) {
        return {
          statusCode: response.status,
          data: { items: [], totalPrice: 0 } as Cart,
          message: 'Session expired',
          success: false,
        };
      }
      
      if (!response.ok) {
        return {
          statusCode: response.status,
          data: {} as Cart,
          message: 'Failed to fetch cart',
          success: false,
        };
      }
      
      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: {} as Cart,
        message: 'Failed to fetch cart',
        success: false,
      };
    }
  },

  async addToCart(courseId: string): Promise<ApiResponse<Cart>> {
    const token = getAccessToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ courseId }),
      });
      
      // Handle expired token
      if (response.status === 401) {
        clearAuthOnExpiry();
        return {
          statusCode: 401,
          data: {} as Cart,
          message: 'Session expired. Please login again.',
          success: false,
        };
      }
      
      if (!response.ok) {
        const errorMessages: Record<number, string> = {
          400: 'Course already in cart',
          404: 'Course not found',
        };
        
        return {
          statusCode: response.status,
          data: {} as Cart,
          message: errorMessages[response.status] || 'Failed to add to cart',
          success: false,
        };
      }
      
      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: {} as Cart,
        message: 'Failed to add to cart',
        success: false,
      };
    }
  },

  async removeFromCart(courseId: string): Promise<ApiResponse<Cart>> {
    const token = getAccessToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/cart/remove/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        return {
          statusCode: response.status,
          data: {} as Cart,
          message: 'Failed to remove from cart',
          success: false,
        };
      }
      
      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: {} as Cart,
        message: 'Failed to remove from cart',
        success: false,
      };
    }
  },

  async checkout(): Promise<ApiResponse<Order>> {
    const token = getAccessToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/cart/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      // Handle expired token
      if (response.status === 401) {
        clearAuthOnExpiry();
        return {
          statusCode: 401,
          data: {} as Order,
          message: 'Session expired. Please login again.',
          success: false,
        };
      }
      
      if (!response.ok) {
        const errorMessages: Record<number, string> = {
          400: 'Cart is empty',
        };
        
        return {
          statusCode: response.status,
          data: {} as Order,
          message: errorMessages[response.status] || 'Checkout failed',
          success: false,
        };
      }
      
      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: {} as Order,
        message: 'Checkout failed',
        success: false,
      };
    }
  },

  async clearCart(): Promise<ApiResponse<null>> {
    const token = getAccessToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        return {
          statusCode: response.status,
          data: null,
          message: 'Failed to clear cart',
          success: false,
        };
      }
      
      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: null,
        message: 'Failed to clear cart',
        success: false,
      };
    }
  },
};
