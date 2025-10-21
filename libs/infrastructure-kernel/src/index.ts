/**
 * 基础设施层kernel主入口
 *
 * @description 提供基础设施层的核心功能，包括数据库、缓存、隔离、监控、错误处理等
 * @since 1.0.0
 */

// 类型定义
export * from './types/database.types.js';
export * from './types/cache.types.js';
export * from './types/isolation.types.js';
export * from './types/logging.types.js';
export * from './types/health.types.js';

// 接口定义
export * from './interfaces/database-adapter.interface.js';
export * from './interfaces/cache-service.interface.js';
export * from './interfaces/logging-service.interface.js';
export * from './interfaces/health-service.interface.js';
export * from './interfaces/isolation-service.interface.js';

// 数据库相关
export * from './entities/database-connection.entity.js';
export * from './entities/postgresql-connection.entity.js';
export * from './entities/mongodb-connection.entity.js';
export * from './entities/database-config.entity.js';

export * from './adapters/database/postgresql-adapter.js';
export * from './adapters/database/mongodb-adapter.js';
export * from './adapters/database/connection-manager.js';
export * from './adapters/database/database-factory.js';

export * from './repositories/base/base-repository-adapter.js';
export * from './repositories/aggregate/aggregate-repository-adapter.js';
export * from './repositories/event-store/event-store-adapter.js';
export * from './repositories/read-model/read-model-repository-adapter.js';

export * from './services/database/database-service.js';
export * from './services/database/connection-pool-service.js';
export * from './services/database/transaction-service.js';

// CQRS支持
export * from './services/cqrs/command-handler-service.js';
export * from './services/cqrs/query-handler-service.js';
export * from './services/cqrs/use-case-executor.js';
export * from './services/cqrs/event-handler-service.js';

// 缓存支持
export * from './services/cache/cache-service.js';
export * from './services/cache/cache-strategy.js';
export * from './services/cache/cache-warming.js';

// 隔离支持
export * from './services/isolation/isolation-context-manager.js';
export * from './services/isolation/access-control-service.js';
export * from './services/isolation/audit-log-service.js';
export * from './services/isolation/security-monitor-service.js';
export * from './services/isolation/isolation-manager.js';

// 性能监控
export * from './services/performance/performance-monitor.js';
export * from './services/performance/health-check-service.js';
export * from './services/performance/metrics-collector.js';
export * from './services/performance/performance-optimizer.js';
export * from './services/performance/monitoring-dashboard.js';

// 错误处理
export * from './services/error-handling/error-handler.js';
export * from './services/error-handling/circuit-breaker.js';
export * from './services/error-handling/retry-manager.js';

// 集成服务
export * from './integration/application-kernel-integration.js';
export * from './integration/domain-kernel-integration.js';