/**
 * 通用HTTP请求服务
 * 基于fetch封装，提供统一的请求处理、错误处理、拦截器等功能
 */

import {
  ApiResponse,
  ApiError,
  RequestConfig,
  HttpMethod,
  ApiStatusCode,
  BusinessCode,
} from '../types/common';

/**
 * 请求拦截器函数类型
 */
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

/**
 * 响应拦截器函数类型
 */
type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;

/**
 * 错误拦截器函数类型
 */
type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

/**
 * HTTP请求服务类
 */
class HttpService {
  private baseURL: string = '';
  private timeout: number = 30000;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  /**
   * 设置基础URL
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  /**
   * 设置超时时间
   */
  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * 添加错误拦截器
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 构建完整URL（包含查询参数）
   */
  private buildURL(url: string, params?: Record<string, any>): string {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    if (!params || Object.keys(params).length === 0) {
      return fullURL;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${fullURL}?${queryString}` : fullURL;
  }

  /**
   * 执行请求拦截器
   */
  private async executeRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let modifiedConfig = { ...config };

    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }

    return modifiedConfig;
  }

  /**
   * 执行响应拦截器
   */
  private async executeResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let modifiedResponse = { ...response };

    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }

    return modifiedResponse;
  }

  /**
   * 执行错误拦截器
   */
  private async executeErrorInterceptors(error: ApiError): Promise<ApiError> {
    let modifiedError = { ...error };

    for (const interceptor of this.errorInterceptors) {
      modifiedError = await interceptor(modifiedError);
    }

    return modifiedError;
  }

  /**
   * 处理请求错误
   */
  private async handleError(error: any, requestId: string): Promise<never> {
    const apiError: ApiError = {
      code: ApiStatusCode.INTERNAL_SERVER_ERROR,
      message: error.message || '请求失败',
      details: error.stack,
      requestId,
      timestamp: Date.now(),
    };

    const processedError = await this.executeErrorInterceptors(apiError);
    throw processedError;
  }

  /**
   * 通用请求方法
   */
  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId();

    try {
      const processedConfig = await this.executeRequestInterceptors(config);

      const {
        url,
        method = 'GET',
        params,
        data,
        headers = {},
        timeout = this.timeout,
      } = processedConfig;

      const fullURL = this.buildURL(url, method === 'GET' ? params : undefined);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
          ...headers,
        },
        signal: controller.signal,
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        fetchOptions.body = JSON.stringify(data);
      }

      const response = await fetch(fullURL, fetchOptions);
      clearTimeout(timeoutId);

      let responseData: any;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        return this.handleError(
          {
            message: responseData.message || `HTTP ${response.status}: ${response.statusText}`,
            code: response.status,
          },
          requestId
        );
      }

      const apiResponse: ApiResponse<T> = {
        data: responseData.data !== undefined ? responseData.data : responseData,
        message: responseData.message || 'Success',
        code: responseData.code !== undefined ? responseData.code : BusinessCode.SUCCESS,
        requestId: responseData.requestId || requestId,
        timestamp: responseData.timestamp || Date.now(),
        success: responseData.success !== undefined ? responseData.success : true,
      };

      return this.executeResponseInterceptors(apiResponse);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return this.handleError(
          { message: '请求超时', code: ApiStatusCode.REQUEST_TIMEOUT },
          requestId
        );
      }

      return this.handleError(error, requestId);
    }
  }

  /**
   * GET请求
   */
  async get<T = any>(url: string, params?: Record<string, any>, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      params,
      ...config,
    });
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...config,
    });
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      ...config,
    });
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, params?: Record<string, any>, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      params,
      ...config,
    });
  }

  /**
   * PATCH请求
   */
  async patch<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PATCH',
      data,
      ...config,
    });
  }
}

/**
 * 导出HTTP服务单例
 */
export const http = new HttpService();

/**
 * 默认配置：添加通用请求拦截器
 */
http.addRequestInterceptor((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

/**
 * 默认配置：添加通用响应拦截器
 */
http.addResponseInterceptor((response) => {
  if (response.code !== BusinessCode.SUCCESS && response.code !== ApiStatusCode.SUCCESS) {
    console.warn(`API Warning [${response.requestId}]:`, response.message);
  }
  return response;
});

/**
 * 默认配置：添加通用错误拦截器
 */
http.addErrorInterceptor((error) => {
  console.error(`API Error [${error.requestId}]:`, error.message);

  if (error.code === ApiStatusCode.UNAUTHORIZED) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return error;
});

export default http;
