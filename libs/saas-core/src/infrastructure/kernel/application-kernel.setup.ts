/**
 * @hl8/application-kernel 基础设置
 * 配置应用内核组件的基础设施
 */

import {
  BaseUseCase,
  BaseCommand,
  BaseQuery,
  CommandHandler,
  QueryHandler,
} from "@hl8/application-kernel";

/**
 * 应用内核组件配置
 */
export class ApplicationKernelSetup {
  /**
   * 配置CQRS基础设施
   */
  static configureCQRS(): void {
    // 配置命令总线
    process.env.COMMAND_BUS_ENABLED = "true";
    process.env.COMMAND_BUS_TIMEOUT = "30000"; // 30秒超时

    // 配置查询总线
    process.env.QUERY_BUS_ENABLED = "true";
    process.env.QUERY_BUS_TIMEOUT = "10000"; // 10秒超时

    // 配置事件总线
    process.env.EVENT_BUS_ENABLED = "true";
    process.env.EVENT_BUS_ASYNC = "true";
  }

  /**
   * 配置用例基础设施
   */
  static configureUseCases(): void {
    // 配置用例超时
    process.env.USE_CASE_TIMEOUT = "60000"; // 60秒超时

    // 配置用例重试
    process.env.USE_CASE_RETRY_ATTEMPTS = "3";
    process.env.USE_CASE_RETRY_DELAY = "1000"; // 1秒延迟
  }

  /**
   * 配置处理器基础设施
   */
  static configureHandlers(): void {
    // 配置命令处理器
    process.env.COMMAND_HANDLER_TIMEOUT = "30000";
    process.env.COMMAND_HANDLER_RETRY_ATTEMPTS = "3";

    // 配置查询处理器
    process.env.QUERY_HANDLER_TIMEOUT = "10000";
    process.env.QUERY_HANDLER_CACHE_TTL = "300"; // 5分钟缓存
  }

  /**
   * 初始化应用内核
   */
  static initialize(): void {
    this.configureCQRS();
    this.configureUseCases();
    this.configureHandlers();
  }
}
