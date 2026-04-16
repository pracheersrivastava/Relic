const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

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
  role?: 'user' | 'admin';
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponse {
  user: User;
}

// Dashboard stats type
export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalOrders: number;
  totalRevenue: number;
}

// Course type from backend
export interface Course {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  price: number;
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Extended course type with progress information (used by /my-courses-with-progress)
export interface CourseWithProgress extends Course {
  progress: number;
  totalLessons: number;
  completedLessons: number;
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

// Section type from backend
export interface Section {
  _id: string;
  courseId: string;
  title: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// Review type
export interface Review {
  _id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Lesson type from backend
export interface Lesson {
  _id: string;
  sectionId: string;
  title: string;
  videoUrl: string;
  duration: number;  // in seconds
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// Learning data for a course (used by course/[id] page)
export interface CourseLearningSection {
  _id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface CourseLearningData {
  course: Course;
  sections: CourseLearningSection[];
  completedLessonIds: string[];
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

// Handle response and check for auth errors (401 = unauthorized/token expired)
const handleAuthError = async (response: Response): Promise<boolean> => {
  if (response.status === 401) {
    // Try to get error message from response
    try {
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      const message = data.message || data.error || '';
      if (message.toLowerCase().includes('expired') ||
        message.toLowerCase().includes('invalid token') ||
        message.toLowerCase().includes('unauthorized')) {
        clearAuthOnExpiry();
        return true;
      }
    } catch {
      // If can't parse JSON, still clear auth on 401
      clearAuthOnExpiry();
      return true;
    }
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
        // Check for auth errors (expired token, etc.) and redirect if needed
        if (await handleAuthError(response)) {
          return {
            statusCode: 401,
            data: [],
            message: 'Session expired. Please login again.',
            success: false,
          };
        }
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

  async getEnrolledCoursesWithProgress(): Promise<ApiResponse<CourseWithProgress[]>> {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/courses/my-courses-with-progress`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (await handleAuthError(response)) {
          return {
            statusCode: 401,
            data: [],
            message: 'Session expired. Please login again.',
            success: false,
          };
        }
        return {
          statusCode: response.status,
          data: [],
          message: 'Failed to fetch enrolled courses',
          success: false,
        };
      }

      return await response.json();
    } catch {
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

      // Handle expired token - redirect to login
      if (response.status === 401) {
        await handleAuthError(response);
        return {
          statusCode: response.status,
          data: { items: [], totalPrice: 0 } as Cart,
          message: 'Session expired. Please login again.',
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

  // Change password endpoint
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      // Handle expired token
      if (response.status === 401) {
        clearAuthOnExpiry();
        return {
          statusCode: 401,
          data: null,
          message: 'Session expired. Please login again.',
          success: false,
        };
      }

      if (!response.ok) {
        const errorMessages: Record<number, string> = {
          400: 'Invalid request. Please check your passwords.',
        };

        // Try to get error message from response
        try {
          const errorData = await response.json();
          return {
            statusCode: response.status,
            data: null,
            message: errorData.message || errorMessages[response.status] || 'Failed to change password',
            success: false,
          };
        } catch {
          return {
            statusCode: response.status,
            data: null,
            message: errorMessages[response.status] || 'Failed to change password',
            success: false,
          };
        }
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: null,
        message: 'Failed to change password',
        success: false,
      };
    }
  },

  // Section endpoints
  async getCourseSections(courseId: string): Promise<ApiResponse<Section[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/section/courses/${courseId}/sections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          statusCode: response.status,
          data: [],
          message: 'Failed to fetch course sections',
          success: false,
        };
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: [],
        message: 'Failed to fetch course sections',
        success: false,
      };
    }
  },

  async getCourseLearningData(courseId: string): Promise<ApiResponse<CourseLearningData>> {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/learning-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (await handleAuthError(response)) {
          return {
            statusCode: 401,
            data: {} as CourseLearningData,
            message: 'Session expired. Please login again.',
            success: false,
          };
        }
        return {
          statusCode: response.status,
          data: {} as CourseLearningData,
          message: 'Failed to fetch course data',
          success: false,
        };
      }

      return await response.json();
    } catch {
      return {
        statusCode: 500,
        data: {} as CourseLearningData,
        message: 'Failed to fetch course data',
        success: false,
      };
    }
  },

  async getSectionById(sectionId: string): Promise<ApiResponse<Section>> {
    try {
      const response = await fetch(`${API_BASE_URL}/section/sections/${sectionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          statusCode: response.status,
          data: {} as Section,
          message: 'Failed to fetch section',
          success: false,
        };
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: {} as Section,
        message: 'Failed to fetch section',
        success: false,
      };
    }
  },

  // Lesson endpoints
  async getSectionLessons(sectionId: string): Promise<ApiResponse<Lesson[]>> {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/lessons/sections/${sectionId}/lessons`, {
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
          message: 'Failed to fetch lessons',
          success: false,
        };
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: [],
        message: 'Failed to fetch lessons',
        success: false,
      };
    }
  },

  async getLessonById(lessonId: string): Promise<ApiResponse<Lesson>> {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
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
          data: {} as Lesson,
          message: 'Failed to fetch lesson',
          success: false,
        };
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: {} as Lesson,
        message: 'Failed to fetch lesson',
        success: false,
      };
    }
  },

  async getNextLesson(lessonId: string): Promise<ApiResponse<Lesson | null>> {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/next-lesson`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      // 404 means no next lesson (end of section)
      if (response.status === 404) {
        return {
          statusCode: 404,
          data: null,
          message: 'No next lesson',
          success: true,
        };
      }

      if (!response.ok) {
        return {
          statusCode: response.status,
          data: null,
          message: 'Failed to fetch next lesson',
          success: false,
        };
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: null,
        message: 'Failed to fetch next lesson',
        success: false,
      };
    }
  },

  async markLessonCompleted(lessonId: string): Promise<ApiResponse<null>> {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/mark-completed`, {
        method: 'POST',
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
          message: 'Failed to mark lesson as completed',
          success: false,
        };
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: null,
        message: 'Failed to mark lesson as completed',
        success: false,
      };
    }
  },

  async markLessonProgress(lessonId: string, progress: number): Promise<ApiResponse<{ progress: number; completed: boolean }>> {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/mark-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ progress }),
      });

      if (!response.ok) {
        return {
          statusCode: response.status,
          data: { progress: 0, completed: false },
          message: 'Failed to update lesson progress',
          success: false,
        };
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: { progress: 0, completed: false },
        message: 'Failed to update lesson progress',
        success: false,
      };
    }
  },

  async getCompletedLessons(sectionId: string): Promise<ApiResponse<string[]>> {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/lessons/sections/${sectionId}/completed-lessons`, {
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
          message: 'Failed to fetch completed lessons',
          success: false,
        };
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: [],
        message: 'Failed to fetch completed lessons',
        success: false,
      };
    }
  },

  // Review endpoints
  async submitReview(courseId: string, rating: number, comment?: string): Promise<ApiResponse<Review>> {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/courses/my-courses/${courseId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ rating, comment }),
      });

      // Handle expired token
      if (response.status === 401) {
        clearAuthOnExpiry();
        return {
          statusCode: 401,
          data: {} as Review,
          message: 'Session expired. Please login again.',
          success: false,
        };
      }

      if (!response.ok) {
        const errorMessages: Record<number, string> = {
          400: 'Invalid rating. Please select 1-5 stars.',
          403: 'You must be enrolled to review this course.',
          409: 'You have already reviewed this course.',
        };

        // Try to get error message from response
        try {
          const errorData = await response.json();
          return {
            statusCode: response.status,
            data: {} as Review,
            message: errorData.message || errorMessages[response.status] || 'Failed to submit review',
            success: false,
          };
        } catch {
          return {
            statusCode: response.status,
            data: {} as Review,
            message: errorMessages[response.status] || 'Failed to submit review',
            success: false,
          };
        }
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: {} as Review,
        message: 'Failed to submit review',
        success: false,
      };
    }
  },

  async getUserReview(courseId: string): Promise<ApiResponse<Review | null>> {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/courses/my-courses/${courseId}/review`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        return {
          statusCode: 401,
          data: null,
          message: 'Session expired',
          success: false,
        };
      }

      if (!response.ok) {
        return {
          statusCode: response.status,
          data: null,
          message: 'Failed to fetch review',
          success: false,
        };
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: null,
        message: 'Failed to fetch review',
        success: false,
      };
    }
  },

  async updateReview(courseId: string, rating: number, comment?: string): Promise<ApiResponse<Review>> {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/courses/my-courses/${courseId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ rating, comment }),
      });

      if (response.status === 401) {
        clearAuthOnExpiry();
        return {
          statusCode: 401,
          data: {} as Review,
          message: 'Session expired. Please login again.',
          success: false,
        };
      }

      if (!response.ok) {
        try {
          const errorData = await response.json();
          return {
            statusCode: response.status,
            data: {} as Review,
            message: errorData.message || 'Failed to update review',
            success: false,
          };
        } catch {
          return {
            statusCode: response.status,
            data: {} as Review,
            message: 'Failed to update review',
            success: false,
          };
        }
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: {} as Review,
        message: 'Failed to update review',
        success: false,
      };
    }
  },

  // Payment endpoints (Stripe)
  async createPaymentIntent(): Promise<ApiResponse<{ clientSecret: string }>> {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/payment/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        clearAuthOnExpiry();
        return {
          statusCode: 401,
          data: { clientSecret: '' },
          message: 'Session expired. Please login again.',
          success: false,
        };
      }

      if (!response.ok) {
        try {
          const errorData = await response.json();
          return {
            statusCode: response.status,
            data: { clientSecret: '' },
            message: errorData.message || 'Failed to create payment intent',
            success: false,
          };
        } catch {
          return {
            statusCode: response.status,
            data: { clientSecret: '' },
            message: 'Failed to create payment intent',
            success: false,
          };
        }
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: { clientSecret: '' },
        message: 'Failed to create payment intent',
        success: false,
      };
    }
  },

  async confirmPayment(paymentIntentId: string): Promise<ApiResponse<Order>> {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/payment/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ paymentIntentId }),
      });

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
        try {
          const errorData = await response.json();
          return {
            statusCode: response.status,
            data: {} as Order,
            message: errorData.message || 'Payment confirmation failed',
            success: false,
          };
        } catch {
          return {
            statusCode: response.status,
            data: {} as Order,
            message: 'Payment confirmation failed',
            success: false,
          };
        }
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: {} as Order,
        message: 'Payment confirmation failed',
        success: false,
      };
    }
  },

  // Admin Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const token = getAccessToken();
      if (!token) {
        return {
          statusCode: 401,
          data: {} as DashboardStats,
          message: 'Login required',
          success: false,
        };
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await handleAuthError(response);
          return {
            statusCode: 401,
            data: {} as DashboardStats,
            message: 'Session expired. Please login again.',
            success: false,
          };
        }
        if (response.status === 403) {
          return {
            statusCode: 403,
            data: {} as DashboardStats,
            message: 'Access denied. Admin privileges required.',
            success: false,
          };
        }
        return {
          statusCode: response.status,
          data: {} as DashboardStats,
          message: 'Failed to fetch dashboard stats',
          success: false,
        };
      }

      return await response.json();
    } catch (error) {
      return {
        statusCode: 500,
        data: {} as DashboardStats,
        message: 'Failed to fetch dashboard stats',
        success: false,
      };
    }
  },
};
