/**
 * 基础设施层异常映射
 *
 * @description 将基础设施层错误映射到标准化异常类
 * @since 1.0.0
 */

import {
  AbstractHttpException,
  GeneralInternalServerException,
  GeneralBadRequestException,
  ExternalServiceUnavailableException,
} from "@hl8/exceptions";

/**
 * 基础设施层错误类型
 */
export type InfrastructureErrorType =
  | "DATABASE"
  | "CACHE"
  | "NETWORK"
  | "ISOLATION"
  | "SYSTEM"
  | "INTEGRATION"
  | "VALIDATION"
  | "UNKNOWN";

/**
 * 基础设施层异常映射配置
 */
export interface InfrastructureExceptionMapping {
  errorType: InfrastructureErrorType;
  exceptionClass: new (
    title: string,
    detail: string,
    data?: Record<string, unknown>,
  ) => AbstractHttpException;
  httpStatus: number;
  errorCode: string;
}

/**
 * 基础设施层异常映射表
 */
export const INFRASTRUCTURE_EXCEPTION_MAPPING: Record<
  InfrastructureErrorType,
  InfrastructureExceptionMapping
> = {
  DATABASE: {
    errorType: "DATABASE",
    exceptionClass: GeneralInternalServerException,
    httpStatus: 500,
    errorCode: "INFRA_DATABASE_ERROR",
  },
  CACHE: {
    errorType: "CACHE",
    exceptionClass: GeneralInternalServerException,
    httpStatus: 500,
    errorCode: "INFRA_CACHE_ERROR",
  },
  NETWORK: {
    errorType: "NETWORK",
    exceptionClass: ExternalServiceUnavailableException,
    httpStatus: 503,
    errorCode: "INFRA_NETWORK_ERROR",
  },
  ISOLATION: {
    errorType: "ISOLATION",
    exceptionClass: GeneralBadRequestException,
    httpStatus: 403,
    errorCode: "INFRA_ISOLATION_ERROR",
  },
  SYSTEM: {
    errorType: "SYSTEM",
    exceptionClass: GeneralInternalServerException,
    httpStatus: 500,
    errorCode: "INFRA_SYSTEM_ERROR",
  },
  INTEGRATION: {
    errorType: "INTEGRATION",
    exceptionClass: ExternalServiceUnavailableException,
    httpStatus: 502,
    errorCode: "INFRA_INTEGRATION_ERROR",
  },
  VALIDATION: {
    errorType: "VALIDATION",
    exceptionClass: GeneralBadRequestException,
    httpStatus: 400,
    errorCode: "INFRA_VALIDATION_ERROR",
  },
  UNKNOWN: {
    errorType: "UNKNOWN",
    exceptionClass: GeneralInternalServerException,
    httpStatus: 500,
    errorCode: "INFRA_UNKNOWN_ERROR",
  },
};

/**
 * 基础设施层异常转换器
 */
export class InfrastructureExceptionConverter {
  /**
   * 将原生错误转换为标准化异常
   *
   * @param _error - 原始错误对象
   * @param errorType - 错误类型
   * @param context - 上下文数据
   * @returns 标准化异常实例
   */
  static convertToStandardException(
    _error: Error,
    errorType: InfrastructureErrorType,
    context?: Record<string, unknown>,
  ): AbstractHttpException {
    const mapping = INFRASTRUCTURE_EXCEPTION_MAPPING[errorType];
    const ExceptionClass = mapping.exceptionClass;

    // 构建错误消息
    const title = this.buildErrorMessage(_error, errorType);
    const detail = this.buildErrorDetail(_error, errorType, context);

    // 构建上下文数据
    const data = {
      originalError: _error.message,
      errorType,
      stack: _error.stack,
      ...context,
    };

    return new ExceptionClass(title, detail, data);
  }

  /**
   * 根据错误类型和严重级别确定异常类
   *
   * @param errorType - 错误类型
   * @param severity - 错误严重级别
   * @returns 异常类构造函数
   */
  static determineExceptionClass(
    errorType: InfrastructureErrorType,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM",
  ): new (
    title: string,
    detail: string,
    data?: Record<string, unknown>,
  ) => AbstractHttpException {
    const mapping = INFRASTRUCTURE_EXCEPTION_MAPPING[errorType];

    // 根据严重级别调整异常类
    switch (severity) {
      case "CRITICAL":
        return GeneralInternalServerException;
      case "HIGH":
        return mapping.exceptionClass;
      case "MEDIUM":
        return mapping.exceptionClass;
      case "LOW":
        return GeneralBadRequestException;
      default:
        return mapping.exceptionClass;
    }
  }

  /**
   * 构建错误消息
   *
   * @param _error - 原始错误
   * @param errorType - 错误类型
   * @returns 格式化的错误消息
   */
  private static buildErrorMessage(
    _error: Error,
    errorType: InfrastructureErrorType,
  ): string {
    const typeMessages = {
      DATABASE: "数据库操作失败",
      CACHE: "缓存操作失败",
      NETWORK: "网络连接失败",
      ISOLATION: "数据隔离违规",
      SYSTEM: "系统内部错误",
      INTEGRATION: "集成服务错误",
      VALIDATION: "数据验证失败",
      UNKNOWN: "未知基础设施错误",
    };

    return typeMessages[errorType] || "基础设施错误";
  }

  /**
   * 构建错误详情
   *
   * @param _error - 原始错误
   * @param errorType - 错误类型
   * @param context - 上下文数据
   * @returns 详细的错误描述
   */
  private static buildErrorDetail(
    _error: Error,
    errorType: InfrastructureErrorType,
    context?: Record<string, unknown>,
  ): string {
    let detail = _error.message;

    // 根据错误类型添加特定详情
    switch (errorType) {
      case "DATABASE":
        detail = `数据库操作失败: ${_error.message}`;
        if (context?.operation) {
          detail += ` (操作: ${context.operation})`;
        }
        break;
      case "CACHE":
        detail = `缓存操作失败: ${_error.message}`;
        if (context?.cacheKey) {
          detail += ` (缓存键: ${context.cacheKey})`;
        }
        break;
      case "NETWORK":
        detail = `网络连接失败: ${_error.message}`;
        if (context?.endpoint) {
          detail += ` (端点: ${context.endpoint})`;
        }
        break;
      case "ISOLATION":
        detail = `数据隔离违规: ${_error.message}`;
        if (context?.tenantId) {
          detail += ` (租户: ${context.tenantId})`;
        }
        break;
      case "INTEGRATION":
        detail = `集成服务错误: ${_error.message}`;
        if (context?.serviceName) {
          detail += ` (服务: ${context.serviceName})`;
        }
        break;
    }

    return detail;
  }

  /**
   * 检查错误是否为基础设施层错误
   *
   * @param _error - 错误对象
   * @returns 是否为基础设施层错误
   */
  static isInfrastructureError(_error: Error): boolean {
    const infrastructureErrorPatterns = [
      /database/i,
      /connection/i,
      /network/i,
      /cache/i,
      /isolation/i,
      /infrastructure/i,
    ];

    return infrastructureErrorPatterns.some((pattern) =>
      pattern.test(_error.message),
    );
  }

  /**
   * 自动推断错误类型
   *
   * @param _error - 错误对象
   * @returns 推断的错误类型
   */
  static inferErrorType(_error: Error): InfrastructureErrorType {
    const message = _error.message.toLowerCase();

    if (message.includes("database") || message.includes("connection")) {
      return "DATABASE";
    }
    if (message.includes("cache") || message.includes("redis")) {
      return "CACHE";
    }
    if (message.includes("network") || message.includes("timeout")) {
      return "NETWORK";
    }
    if (message.includes("isolation") || message.includes("tenant")) {
      return "ISOLATION";
    }
    if (message.includes("validation") || message.includes("invalid")) {
      return "VALIDATION";
    }
    if (message.includes("integration") || message.includes("external")) {
      return "INTEGRATION";
    }
    if (message.includes("system") || message.includes("internal")) {
      return "SYSTEM";
    }

    return "UNKNOWN";
  }
}
