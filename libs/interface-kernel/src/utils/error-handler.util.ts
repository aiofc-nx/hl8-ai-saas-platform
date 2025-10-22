/**
 * @fileoverview 错误处理工具
 * @description 提供统一的错误处理功能
 */

import { Logger } from "@nestjs/common";
import type { ApiResponse } from "../types/index.js";

/**
 * 错误处理工具类
 * @description 提供统一的错误处理功能
 */
export class ErrorHandler {
  private static readonly logger = new Logger(ErrorHandler.name);

  /**
   * 处理错误
   * @description 统一处理各种错误并返回标准化的错误响应
   * @param error 错误对象
   * @param context 错误上下文
   * @returns 标准化的错误响应
   */
  static handleError(error: any, context?: any): ApiResponse {
    try {
      this.logger.error(`Error occurred: ${error.message}`, error.stack);

      // 记录错误上下文
      if (context) {
        this.logger.debug(`Error context: ${JSON.stringify(context)}`);
      }

      // 根据错误类型返回相应的响应
      if (error.name === "ValidationError") {
        return this.handleValidationError(error);
      }

      if (error.name === "UnauthorizedError") {
        return this.handleUnauthorizedError(error);
      }

      if (error.name === "ForbiddenError") {
        return this.handleForbiddenError(error);
      }

      if (error.name === "NotFoundError") {
        return this.handleNotFoundError(error);
      }

      if (error.name === "RateLimitError") {
        return this.handleRateLimitError(error);
      }

      if (error.name === "TimeoutError") {
        return this.handleTimeoutError(error);
      }

      if (error.name === "DatabaseError") {
        return this.handleDatabaseError(error);
      }

      if (error.name === "NetworkError") {
        return this.handleNetworkError(error);
      }

      // 默认内部错误处理
      return this.handleInternalError(error);
    } catch (handlerError) {
      this.logger.error(
        `Error handler failed: ${handlerError instanceof Error ? handlerError.message : String(handlerError)}`,
      );

      return {
        success: false,
        error: {
          code: "HANDLER_ERROR",
          message: "Error handler failed",
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: "1.0.0",
        },
      };
    }
  }

  /**
   * 处理验证错误
   * @description 处理数据验证错误
   * @param error 验证错误
   * @returns 验证错误响应
   */
  private static handleValidationError(error: any): ApiResponse {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Data validation failed",
        details: {
          errors: error.errors || [error.message],
          field: error.field,
          value: error.value,
        },
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
      },
    };
  }

  /**
   * 处理认证错误
   * @description 处理认证失败错误
   * @param error 认证错误
   * @returns 认证错误响应
   */
  private static handleUnauthorizedError(error: any): ApiResponse {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: error.message || "Authentication required",
        details: {
          reason: error.reason,
          token: error.token ? "present" : "missing",
        },
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
      },
    };
  }

  /**
   * 处理授权错误
   * @description 处理授权失败错误
   * @param error 授权错误
   * @returns 授权错误响应
   */
  private static handleForbiddenError(error: any): ApiResponse {
    return {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: error.message || "Insufficient permissions",
        details: {
          resource: error.resource,
          action: error.action,
          requiredPermissions: error.requiredPermissions,
        },
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
      },
    };
  }

  /**
   * 处理未找到错误
   * @description 处理资源未找到错误
   * @param error 未找到错误
   * @returns 未找到错误响应
   */
  private static handleNotFoundError(error: any): ApiResponse {
    return {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: error.message || "Resource not found",
        details: {
          resource: error.resource,
          id: error.id,
        },
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
      },
    };
  }

  /**
   * 处理速率限制错误
   * @description 处理速率限制错误
   * @param error 速率限制错误
   * @returns 速率限制错误响应
   */
  private static handleRateLimitError(error: any): ApiResponse {
    return {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: error.message || "Too many requests",
        details: {
          limit: error.limit,
          remaining: error.remaining,
          resetTime: error.resetTime,
        },
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
      },
    };
  }

  /**
   * 处理超时错误
   * @description 处理请求超时错误
   * @param error 超时错误
   * @returns 超时错误响应
   */
  private static handleTimeoutError(error: any): ApiResponse {
    return {
      success: false,
      error: {
        code: "TIMEOUT",
        message: error.message || "Request timeout",
        details: {
          timeout: error.timeout,
          operation: error.operation,
        },
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
      },
    };
  }

  /**
   * 处理数据库错误
   * @description 处理数据库相关错误
   * @param error 数据库错误
   * @returns 数据库错误响应
   */
  private static handleDatabaseError(error: any): ApiResponse {
    return {
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Database operation failed",
        details: {
          operation: error.operation,
          table: error.table,
          constraint: error.constraint,
        },
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
      },
    };
  }

  /**
   * 处理网络错误
   * @description 处理网络相关错误
   * @param error 网络错误
   * @returns 网络错误响应
   */
  private static handleNetworkError(error: any): ApiResponse {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: error.message || "Network operation failed",
        details: {
          url: error.url,
          method: error.method,
          statusCode: error.statusCode,
        },
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
      },
    };
  }

  /**
   * 处理内部错误
   * @description 处理内部服务器错误
   * @param error 内部错误
   * @returns 内部错误响应
   */
  private static handleInternalError(error: any): ApiResponse {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
        details: {
          type: "UnknownError",
          message: error?.message || "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: "1.0.0",
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
   * 记录错误
   * @description 记录错误信息到日志
   * @param error 错误对象
   * @param context 错误上下文
   */
  static logError(error: any, context?: any): void {
    if (!error) {
      this.logger.error("Error: Unknown error");
      return;
    }

    this.logger.error(
      `Error: ${error.message || "Unknown error"}`,
      error.stack,
    );

    if (context) {
      this.logger.debug(`Context: ${JSON.stringify(context)}`);
    }
  }

  /**
   * 检查是否为可重试错误
   * @description 检查错误是否可以通过重试解决
   * @param error 错误对象
   * @returns 是否可重试
   */
  static isRetryableError(error: any): boolean {
    if (!error) {
      return false;
    }

    const retryableErrors = [
      "NetworkError",
      "TimeoutError",
      "DatabaseError",
      "ECONNRESET",
      "ECONNREFUSED",
      "ETIMEDOUT",
      "Connection reset by peer",
    ];

    return retryableErrors.some(
      (errorType) =>
        error.name === errorType ||
        error.code === errorType ||
        error.message?.includes(errorType),
    );
  }

  /**
   * 获取错误严重程度
   * @description 获取错误的严重程度
   * @param error 错误对象
   * @returns 错误严重程度
   */
  static getErrorSeverity(error: any): "low" | "medium" | "high" | "critical" {
    if (!error) {
      return "critical";
    }

    if (
      error.name === "ValidationError" ||
      error.name === "UnauthorizedError"
    ) {
      return "low";
    }

    if (error.name === "ForbiddenError" || error.name === "NotFoundError") {
      return "medium";
    }

    if (error.name === "RateLimitError" || error.name === "TimeoutError") {
      return "medium";
    }

    if (error.name === "DatabaseError" || error.name === "NetworkError") {
      return "high";
    }

    return "critical";
  }
}
