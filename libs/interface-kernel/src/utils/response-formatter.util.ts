/**
 * @fileoverview 响应格式化工具
 * @description 提供统一的API响应格式化功能
 */

import type {
  ApiResponse,
  ResponseMeta,
  PaginationMeta,
} from "../types/index.js";

/**
 * 响应格式化工具类
 * @description 提供统一的API响应格式化功能
 */
export class ResponseFormatter {
  /**
   * 格式化成功响应
   * @description 格式化成功的API响应
   * @param data 响应数据
   * @param meta 响应元数据
   * @returns 格式化的响应
   */
  static success<T>(data: T, meta?: Partial<ResponseMeta>): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
        ...meta,
      },
    };
  }

  /**
   * 格式化错误响应
   * @description 格式化错误的API响应
   * @param code 错误代码
   * @param message 错误消息
   * @param details 错误详情
   * @param meta 响应元数据
   * @returns 格式化的错误响应
   */
  static error(
    code: string,
    message: string,
    details?: Record<string, any>,
    meta?: Partial<ResponseMeta>,
  ): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
        ...meta,
      },
    };
  }

  /**
   * 格式化分页响应
   * @description 格式化带分页的API响应
   * @param data 响应数据
   * @param pagination 分页信息
   * @param meta 响应元数据
   * @returns 格式化的分页响应
   */
  static paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    meta?: Partial<ResponseMeta>,
  ): ApiResponse<T[]> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
        pagination,
        ...meta,
      },
    };
  }

  /**
   * 格式化验证错误响应
   * @description 格式化数据验证错误的API响应
   * @param errors 验证错误列表
   * @param meta 响应元数据
   * @returns 格式化的验证错误响应
   */
  static validationError(
    errors: string[],
    meta?: Partial<ResponseMeta>,
  ): ApiResponse {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Data validation failed",
        details: { errors },
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
        ...meta,
      },
    };
  }

  /**
   * 格式化认证错误响应
   * @description 格式化认证失败的API响应
   * @param message 错误消息
   * @param meta 响应元数据
   * @returns 格式化的认证错误响应
   */
  static authenticationError(
    message: string = "Authentication required",
    meta?: Partial<ResponseMeta>,
  ): ApiResponse {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message,
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
        ...meta,
      },
    };
  }

  /**
   * 格式化授权错误响应
   * @description 格式化授权失败的API响应
   * @param message 错误消息
   * @param meta 响应元数据
   * @returns 格式化的授权错误响应
   */
  static authorizationError(
    message: string = "Insufficient permissions",
    meta?: Partial<ResponseMeta>,
  ): ApiResponse {
    return {
      success: false,
      error: {
        code: "FORBIDDEN",
        message,
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
        ...meta,
      },
    };
  }

  /**
   * 格式化速率限制错误响应
   * @description 格式化速率限制的API响应
   * @param message 错误消息
   * @param meta 响应元数据
   * @returns 格式化的速率限制错误响应
   */
  static rateLimitError(
    message: string = "Too many requests",
    meta?: Partial<ResponseMeta>,
  ): ApiResponse {
    return {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message,
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
        ...meta,
      },
    };
  }

  /**
   * 格式化内部错误响应
   * @description 格式化内部服务器错误的API响应
   * @param message 错误消息
   * @param meta 响应元数据
   * @returns 格式化的内部错误响应
   */
  static internalError(
    message: string = "Internal server error",
    meta?: Partial<ResponseMeta>,
  ): ApiResponse {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message,
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
        ...meta,
      },
    };
  }

  /**
   * 格式化未找到错误响应
   * @description 格式化资源未找到的API响应
   * @param message 错误消息
   * @param meta 响应元数据
   * @returns 格式化的未找到错误响应
   */
  static notFoundError(
    message: string = "Resource not found",
    meta?: Partial<ResponseMeta>,
  ): ApiResponse {
    return {
      success: false,
      error: {
        code: "NOT_FOUND",
        message,
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
        ...meta,
      },
    };
  }

  /**
   * 生成请求ID
   * @description 生成唯一的请求ID
   * @returns 请求ID
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 计算分页信息
   * @description 计算分页元数据
   * @param page 当前页码
   * @param limit 每页数量
   * @param total 总数量
   * @returns 分页元数据
   */
  static calculatePagination(
    page: number,
    limit: number,
    total: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * 格式化健康检查响应
   * @description 格式化健康检查的API响应
   * @param health 健康检查结果
   * @returns 格式化的健康检查响应
   */
  static healthCheck(health: any): ApiResponse {
    return {
      success: health.status === "healthy" || health.status === "degraded",
      data: health,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
      },
    };
  }

  /**
   * 格式化指标响应
   * @description 格式化监控指标的API响应
   * @param metrics 指标数据
   * @returns 格式化的指标响应
   */
  static metrics(metrics: any): ApiResponse {
    return {
      success: true,
      data: metrics,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
      },
    };
  }
}
