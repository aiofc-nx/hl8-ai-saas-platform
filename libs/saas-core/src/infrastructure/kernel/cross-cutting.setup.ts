/**
 * @hl8 横切关注点组件基础设置
 * 配置异常处理、缓存、配置、日志等横切关注点
 */

import {
  DomainException,
  BusinessException,
  ValidationException,
  NotFoundException,
} from "@hl8/exceptions";
import { ICacheService } from "@hl8/caching";
import { ConfigService } from "@hl8/config";
import { Logger } from "@hl8/nestjs-fastify";

/**
 * 横切关注点组件配置
 */
export class CrossCuttingSetup {
  /**
   * 配置异常处理
   */
  static configureExceptionHandling(): void {
    // 异常处理配置
    process.env.EXCEPTION_HANDLING_ENABLED = "true";
    process.env.EXCEPTION_LOGGING_ENABLED = "true";
    process.env.EXCEPTION_STACK_TRACE = "true";

    // 异常重试配置
    process.env.EXCEPTION_RETRY_ATTEMPTS = "3";
    process.env.EXCEPTION_RETRY_DELAY = "1000"; // 1秒延迟
  }

  /**
   * 配置缓存服务
   */
  static configureCacheService(): void {
    // 缓存配置
    process.env.CACHE_ENABLED = "true";
    process.env.CACHE_DEFAULT_TTL = "3600"; // 1小时
    process.env.CACHE_MAX_SIZE = "1000";

    // 缓存策略
    process.env.CACHE_STRATEGY = "LRU"; // Least Recently Used
    process.env.CACHE_PERSISTENCE = "true";
  }

  /**
   * 配置配置服务
   */
  static configureConfigService(): void {
    // 配置服务设置
    process.env.CONFIG_VALIDATION_ENABLED = "true";
    process.env.CONFIG_CACHE_ENABLED = "true";
    process.env.CONFIG_CACHE_TTL = "300"; // 5分钟缓存

    // 环境配置
    process.env.NODE_ENV = process.env.NODE_ENV || "development";
    process.env.LOG_LEVEL = process.env.LOG_LEVEL || "info";
  }

  /**
   * 配置日志服务
   */
  static configureLogger(): void {
    // 日志配置
    process.env.LOG_LEVEL = "info";
    process.env.LOG_FORMAT = "json";
    process.env.LOG_TIMESTAMP = "true";

    // 日志输出
    process.env.LOG_CONSOLE = "true";
    process.env.LOG_FILE = "true";
    process.env.LOG_FILE_PATH = "./logs/saas-core.log";

    // 日志轮转
    process.env.LOG_ROTATION_ENABLED = "true";
    process.env.LOG_MAX_SIZE = "10mb";
    process.env.LOG_MAX_FILES = "5";
  }

  /**
   * 配置性能监控
   */
  static configurePerformanceMonitoring(): void {
    // 性能监控配置
    process.env.PERFORMANCE_MONITORING_ENABLED = "true";
    process.env.PERFORMANCE_METRICS_ENABLED = "true";

    // 性能阈值
    process.env.PERFORMANCE_THRESHOLD_RESPONSE_TIME = "200"; // 200ms
    process.env.PERFORMANCE_THRESHOLD_MEMORY_USAGE = "80"; // 80%
    process.env.PERFORMANCE_THRESHOLD_CPU_USAGE = "80"; // 80%
  }

  /**
   * 配置审计日志
   */
  static configureAuditLogging(): void {
    // 审计日志配置
    process.env.AUDIT_LOGGING_ENABLED = "true";
    process.env.AUDIT_LOG_LEVEL = "info";

    // 审计事件
    process.env.AUDIT_EVENTS_ENABLED = "true";
    process.env.AUDIT_EVENT_RETENTION_DAYS = "90"; // 90天保留期
  }

  /**
   * 初始化横切关注点
   */
  static initialize(): void {
    this.configureExceptionHandling();
    this.configureCacheService();
    this.configureConfigService();
    this.configureLogger();
    this.configurePerformanceMonitoring();
    this.configureAuditLogging();
  }
}
