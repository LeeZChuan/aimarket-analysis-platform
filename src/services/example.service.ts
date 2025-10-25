/**
 * 示例服务 - 展示如何使用通用HTTP请求服务
 * 这是一个参考示例，展示了如何基于http服务创建业务服务
 */

import { http } from './request';
import { ApiResponse } from '../types/common';

/**
 * 示例：用户数据接口
 */
interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * 示例服务类
 */
class ExampleService {
  private readonly apiPrefix = '/api/v1';

  /**
   * 示例：GET请求 - 获取用户列表
   */
  async getUserList(page: number = 1, pageSize: number = 10): Promise<ApiResponse<User[]>> {
    return http.get<User[]>(`${this.apiPrefix}/users`, {
      page,
      pageSize,
    });
  }

  /**
   * 示例：GET请求 - 获取单个用户
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return http.get<User>(`${this.apiPrefix}/users/${userId}`);
  }

  /**
   * 示例：POST请求 - 创建用户
   */
  async createUser(userData: Omit<User, 'id'>): Promise<ApiResponse<User>> {
    return http.post<User>(`${this.apiPrefix}/users`, userData);
  }

  /**
   * 示例：PUT请求 - 更新用户
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return http.put<User>(`${this.apiPrefix}/users/${userId}`, userData);
  }

  /**
   * 示例：DELETE请求 - 删除用户
   */
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return http.delete<void>(`${this.apiPrefix}/users/${userId}`);
  }

  /**
   * 示例：带自定义配置的请求
   */
  async getUserWithCustomConfig(userId: string): Promise<ApiResponse<User>> {
    return http.get<User>(`${this.apiPrefix}/users/${userId}`, undefined, {
      headers: {
        'X-Custom-Header': 'custom-value',
      },
      timeout: 5000,
    });
  }

  /**
   * 示例：错误处理
   */
  async getUserSafely(userId: string): Promise<User | null> {
    try {
      const response = await http.get<User>(`${this.apiPrefix}/users/${userId}`);

      if (response.success && response.data) {
        return response.data;
      }

      console.warn('获取用户失败:', response.message);
      return null;
    } catch (error) {
      console.error('获取用户出错:', error);
      return null;
    }
  }

  /**
   * 示例：直接返回数据（简化版）
   */
  async getUsers(): Promise<User[]> {
    const response = await http.get<User[]>(`${this.apiPrefix}/users`);
    return response.data || [];
  }
}

/**
 * 导出服务实例
 */
export const exampleService = new ExampleService();

/**
 * 使用说明：
 *
 * 1. 基础使用：
 *    const response = await exampleService.getUserList(1, 10);
 *    console.log(response.data); // 用户列表
 *
 * 2. 处理响应：
 *    const response = await exampleService.getUserById('123');
 *    if (response.success) {
 *      console.log('用户数据:', response.data);
 *    } else {
 *      console.error('获取失败:', response.message);
 *    }
 *
 * 3. 错误处理：
 *    try {
 *      const response = await exampleService.createUser({ name: 'John', email: 'john@example.com' });
 *      console.log('创建成功:', response.data);
 *    } catch (error) {
 *      console.error('创建失败:', error);
 *    }
 *
 * 4. 简化使用（直接返回数据）：
 *    const users = await exampleService.getUsers();
 *    console.log(users); // 直接得到用户数组
 */
