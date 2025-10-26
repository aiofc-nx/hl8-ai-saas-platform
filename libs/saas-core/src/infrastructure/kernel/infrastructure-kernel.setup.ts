/**
 * @hl8/infrastructure-kernel 基础设置
 * 配置基础设施内核组件
 */

/**
 * 基础设施内核组件配置
 */
export class InfrastructureKernelSetup {
  /**
   * 配置数据库连接
   */
  static configureDatabase(): void {
    // PostgreSQL配置
    process.env.POSTGRES_CONNECTION_POOL_MIN = "2";
    process.env.POSTGRES_CONNECTION_POOL_MAX = "10";
    process.env.POSTGRES_CONNECTION_TIMEOUT = "30000";

    // MongoDB配置
    process.env.MONGODB_CONNECTION_POOL_MIN = "1";
    process.env.MONGODB_CONNECTION_POOL_MAX = "5";
    process.env.MONGODB_CONNECTION_TIMEOUT = "30000";
  }

  /**
   * 配置缓存系统
   */
  static configureCache(): void {
    // Redis配置
    process.env.REDIS_CONNECTION_POOL_MIN = "1";
    process.env.REDIS_CONNECTION_POOL_MAX = "5";
    process.env.REDIS_CONNECTION_TIMEOUT = "10000";

    // 缓存TTL配置
    process.env.CACHE_DEFAULT_TTL = "3600"; // 1小时
    process.env.CACHE_TENANT_TTL = "7200"; // 2小时
    process.env.CACHE_USER_TTL = "1800"; // 30分钟
  }

  /**
   * 配置消息队列
   */
  static configureMessaging(): void {
    // 事件发布配置
    process.env.EVENT_PUBLISHER_TIMEOUT = "5000";
    process.env.EVENT_PUBLISHER_RETRY_ATTEMPTS = "3";

    // 消息队列配置
    process.env.MESSAGE_QUEUE_TIMEOUT = "30000";
    process.env.MESSAGE_QUEUE_RETRY_ATTEMPTS = "3";
  }

  /**
   * 配置外部服务
   */
  static configureExternalServices(): void {
    // 外部服务超时配置
    process.env.EXTERNAL_SERVICE_TIMEOUT = "10000";
    process.env.EXTERNAL_SERVICE_RETRY_ATTEMPTS = "3";

    // 服务降级配置
    process.env.SERVICE_DEGRADATION_ENABLED = "true";
    process.env.SERVICE_DEGRADATION_TIMEOUT = "5000";
  }

  /**
   * 初始化基础设施内核
   */
  static initialize(): void {
    this.configureDatabase();
    this.configureCache();
    this.configureMessaging();
    this.configureExternalServices();
  }
}
