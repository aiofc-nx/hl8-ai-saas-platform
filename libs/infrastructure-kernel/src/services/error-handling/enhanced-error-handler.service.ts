/**
 * 增强的错误处理器服务
 *
 * @description 集成标准化异常系统的错误处理服务
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import {
  ErrorHandlerService,
  ErrorHandleResult,
  ErrorInfo,
} from "./error-handler.js";
import {
  InfrastructureExceptionConverter,
  InfrastructureErrorType,
} from "../../exceptions/infrastructure-exception.mapping.js";
import {
  AbstractHttpException,
  GeneralInternalServerException,
} from "@hl8/exceptions";

/**
 * 增强的错误处理器服务
 */
@Injectable()
export class EnhancedErrorHandlerService extends ErrorHandlerService {
  /**
   * 处理错误并转换为标准化异常
   *
   * @param error - 原始错误对象
   * @param context - 错误上下文
   * @returns 错误处理结果
   */
  async handleError(
    error: Error,
    context?: Record<string, unknown>,
  ): Promise<ErrorHandleResult> {
    try {
      // 检查是否为基础设施层错误
      const isInfrastructureError =
        InfrastructureExceptionConverter.isInfrastructureError(error);

      if (isInfrastructureError) {
        // 推断错误类型
        const errorType =
          InfrastructureExceptionConverter.inferErrorType(error);

        // 转换为标准化异常
        const standardException =
          InfrastructureExceptionConverter.convertToStandardException(
            error,
            errorType,
            context,
          );

        // 记录标准化异常
        await this.logStandardException(standardException, context);

        // 调用父类处理逻辑
        const result = await super.handleError(standardException, context);

        return result;
      }

      // 对于非基础设施层错误，使用原有处理逻辑
      return await super.handleError(error, context);
    } catch (handlerError) {
      // 如果错误处理器本身出错，记录并返回基本信息
      console.error("Enhanced error handler failed:", handlerError);

      return {
        success: false,
        processingTime: 0,
      };
    }
  }

  /**
   * 处理基础设施层特定错误
   *
   * @param error - 原始错误
   * @param errorType - 错误类型
   * @param context - 上下文数据
   * @returns 错误处理结果
   */
  async handleInfrastructureError(
    error: Error,
    errorType: InfrastructureErrorType,
    context?: Record<string, unknown>,
  ): Promise<ErrorHandleResult> {
    // 转换为标准化异常
    const standardException =
      InfrastructureExceptionConverter.convertToStandardException(
        error,
        errorType,
        context,
      );

    // 记录标准化异常
    await this.logStandardException(standardException, context);

    // 调用父类处理逻辑
    return await super.handleError(standardException, context);
  }

  /**
   * 批量处理错误
   *
   * @param errors - 错误数组
   * @param context - 共享上下文
   * @returns 批量处理结果
   */
  async handleBatchErrors(
    errors: Array<{
      error: Error;
      type?: InfrastructureErrorType;
      context?: Record<string, unknown>;
    }>,
    sharedContext?: Record<string, unknown>,
  ): Promise<Array<ErrorHandleResult>> {
    const results = [];

    for (const { error, type, context } of errors) {
      const mergedContext = { ...sharedContext, ...context };

      if (type) {
        // 使用指定的错误类型
        const result = await this.handleInfrastructureError(
          error,
          type,
          mergedContext,
        );
        results.push(result);
      } else {
        // 自动推断错误类型
        const result = await this.handleError(error, mergedContext);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * 记录标准化异常
   *
   * @param exception - 标准化异常
   * @param context - 上下文数据
   */
  private async logStandardException(
    exception: AbstractHttpException,
    context?: Record<string, unknown>,
  ): Promise<void> {
    try {
      // 记录异常信息
      const logData = {
        errorCode: exception.errorCode,
        message: exception.message,
        detail: exception.detail,
        status: exception.getStatus(),
        timestamp: new Date().toISOString(),
        context,
        stack: exception.stack,
      };

      // 根据严重级别选择日志级别
      const severity = this.determineSeverity(exception);

      switch (severity) {
        case "CRITICAL":
          console.error("CRITICAL Infrastructure Error:", logData);
          break;
        case "HIGH":
          console.error("HIGH Infrastructure Error:", logData);
          break;
        case "MEDIUM":
          console.warn("MEDIUM Infrastructure Error:", logData);
          break;
        case "LOW":
          console.info("LOW Infrastructure Error:", logData);
          break;
      }

      // 可以在这里添加发送到监控系统的逻辑
      await this.sendToMonitoring(exception, context);
    } catch (logError) {
      console.error("Failed to log standard exception:", logError);
    }
  }

  /**
   * 确定异常严重级别
   *
   * @param exception - 异常对象
   * @returns 严重级别
   */
  private determineSeverity(
    exception: AbstractHttpException,
  ): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    const status = exception.getStatus();
    const errorCode = exception.errorCode;

    // 根据HTTP状态码确定严重级别
    if (status >= 500) {
      return "CRITICAL";
    }
    if (status >= 400) {
      return "HIGH";
    }
    if (status >= 300) {
      return "MEDIUM";
    }

    // 根据错误代码进一步细化
    if (errorCode.includes("CRITICAL") || errorCode.includes("FATAL")) {
      return "CRITICAL";
    }
    if (errorCode.includes("HIGH") || errorCode.includes("ERROR")) {
      return "HIGH";
    }
    if (errorCode.includes("MEDIUM") || errorCode.includes("WARNING")) {
      return "MEDIUM";
    }

    return "LOW";
  }

  /**
   * 发送到监控系统
   *
   * @param exception - 异常对象
   * @param context - 上下文数据
   */
  private async sendToMonitoring(
    exception: AbstractHttpException,
    context?: Record<string, unknown>,
  ): Promise<void> {
    try {
      // 这里可以集成实际的监控系统，如 Sentry、DataDog 等
      const monitoringData = {
        errorCode: exception.errorCode,
        message: exception.message,
        detail: exception.detail,
        status: exception.getStatus(),
        timestamp: new Date().toISOString(),
        context,
        tags: {
          layer: "infrastructure",
          severity: this.determineSeverity(exception),
        },
      };

      // 示例：发送到监控系统
      // await this.monitoringService.sendError(monitoringData);

      console.log("Monitoring data prepared:", monitoringData);
    } catch (monitoringError) {
      console.error("Failed to send to monitoring:", monitoringError);
    }
  }

  /**
   * 获取错误统计信息
   *
   * @returns 错误统计信息
   */
  async getErrorStatistics(): Promise<{
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: Array<{
      errorCode: string;
      message: string;
      timestamp: Date;
      severity: string;
    }>;
  }> {
    // 这里可以实现实际的统计逻辑
    return {
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      recentErrors: [],
    };
  }
}
