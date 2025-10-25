/**
 * 通用类型定义
 * 包含API响应、请求等通用数据结构
 */

/**
 * 标准API响应结构
 */
export interface ApiResponse<T = any> {
  /** 响应数据 */
  data: T;
  /** 响应消息 */
  message: string;
  /** 响应状态码 */
  code: number;
  /** 请求追踪ID */
  requestId: string;
  /** 响应时间戳 */
  timestamp: number;
  /** 是否成功 */
  success: boolean;
}

/**
 * 分页请求参数
 */
export interface PaginationRequest {
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  pageSize: number;
}

/**
 * 分页响应数据
 */
export interface PaginationResponse<T = any> {
  /** 数据列表 */
  list: T[];
  /** 总条数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * API错误响应
 */
export interface ApiError {
  /** 错误代码 */
  code: number;
  /** 错误消息 */
  message: string;
  /** 错误详情 */
  details?: string;
  /** 请求追踪ID */
  requestId?: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * HTTP请求方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * HTTP请求配置
 */
export interface RequestConfig {
  /** 请求URL */
  url: string;
  /** 请求方法 */
  method?: HttpMethod;
  /** 请求参数（用于GET请求） */
  params?: Record<string, any>;
  /** 请求体（用于POST/PUT/PATCH请求） */
  data?: any;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 是否携带认证信息 */
  withCredentials?: boolean;
}

/**
 * API状态码枚举
 */
export enum ApiStatusCode {
  /** 成功 */
  SUCCESS = 200,
  /** 创建成功 */
  CREATED = 201,
  /** 无内容 */
  NO_CONTENT = 204,
  /** 错误请求 */
  BAD_REQUEST = 400,
  /** 未授权 */
  UNAUTHORIZED = 401,
  /** 禁止访问 */
  FORBIDDEN = 403,
  /** 未找到 */
  NOT_FOUND = 404,
  /** 请求超时 */
  REQUEST_TIMEOUT = 408,
  /** 服务器错误 */
  INTERNAL_SERVER_ERROR = 500,
  /** 服务不可用 */
  SERVICE_UNAVAILABLE = 503,
}

/**
 * 业务状态码枚举
 */
export enum BusinessCode {
  /** 成功 */
  SUCCESS = 0,
  /** 通用错误 */
  COMMON_ERROR = 1000,
  /** 参数错误 */
  PARAM_ERROR = 1001,
  /** 未登录 */
  NOT_LOGIN = 1002,
  /** 无权限 */
  NO_PERMISSION = 1003,
  /** 数据不存在 */
  DATA_NOT_EXIST = 1004,
  /** 数据已存在 */
  DATA_ALREADY_EXIST = 1005,
  /** 操作失败 */
  OPERATION_FAILED = 1006,
}
