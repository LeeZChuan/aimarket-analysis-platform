/**
 * 用户认证服务
 * 提供用户登录、注册、登出、获取用户信息等接口
 */

import { http } from './request';

/**
 * 登录请求参数
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * 用户信息
 */
export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  status: 'active' | 'inactive' | 'banned';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 认证响应
 */
export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

/**
 * 后端统一响应 data 字段（登录/注册）
 */
interface AuthResponseData {
  user?: User;
  token?: string;
}

/**
 * 修改密码请求参数
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * 认证服务
 */
export const authService = {
  /**
   * 用户登录
   * @param data 登录参数
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await http.post<AuthResponseData>('/auth/login', data);
      
      if (response.success && response.data?.token) {
        // 保存token到本地存储
        localStorage.setItem('token', response.data.token);
        // 保存用户信息
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      
      const result: AuthResponse = {
        success: response.success,
        user: response.data?.user,
        token: response.data?.token,
        message: response.message,
      };

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/612e1b3b-bc5b-4e1c-a1fd-4fad9ce18f4e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authService.ts:login',message:'authService.login mapped result',data:{success:result.success,hasUser:!!result.user,userId:result.user?.id,hasToken:!!result.token},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F',runId:'pre-fix'})}).catch(()=>{});
      // #endregion

      return result;
    } catch (error: any) {
      // 返回错误信息而不是抛出异常
      return {
        success: false,
        message: error.message || '登录失败，请稍后重试',
      };
    }
  },

  /**
   * 用户注册
   * @param data 注册参数
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await http.post<AuthResponseData>('/auth/register', data);
    
    if (response.success && response.data?.token) {
      localStorage.setItem('token', response.data.token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return {
      success: response.success,
      user: response.data?.user,
      token: response.data?.token,
      message: response.message,
    };
  },

  /**
   * 用户登出
   */
  logout: async (): Promise<void> => {
    try {
      await http.post('/auth/logout');
    } finally {
      // 无论请求成功与否，都清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * 获取当前登录用户信息
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await http.get<{ user: User }>('/auth/me');
      if (response.success && response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * 修改密码
   * @param data 修改密码参数
   */
  changePassword: async (data: ChangePasswordRequest): Promise<{ success: boolean; message?: string }> => {
    const response = await http.put<{ success: boolean; message?: string }>('/auth/password', data);
    return response.data;
  },

  /**
   * 获取本地存储的用户信息
   */
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * 检查是否已登录
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * 获取当前token
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
};
