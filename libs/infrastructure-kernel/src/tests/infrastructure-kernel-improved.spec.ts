/**
 * 基础设施层kernel测试 - 改进版
 *
 * @description 测试基础设施层的核心功能，修复依赖注入问题
 * @since 1.0.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { InfrastructureKernelService } from '../services/infrastructure-kernel.service.js';
import { DatabaseService } from '../services/database/database-service.js';
import { ConnectionPoolService } from '../services/database/connection-pool-service.js';
import { TransactionService } from '../services/database/transaction-service.js';
import { CacheService } from '../services/cache/cache-service.js';
import { IsolationManager } from '../services/isolation/isolation-manager.js';
import { PerformanceMonitorService } from '../services/performance/performance-monitor.js';
import { HealthCheckService } from '../services/performance/health-check-service.js';
import { MetricsCollectorService } from '../services/performance/metrics-collector.js';
import { PerformanceOptimizerService } from '../services/performance/performance-optimizer.js';
import { MonitoringDashboardService } from '../services/performance/monitoring-dashboard.js';
import { ErrorHandlerService } from '../services/error-handling/error-handler.js';
import { CircuitBreakerService } from '../services/error-handling/circuit-breaker.js';
import { RetryManagerService } from '../services/error-handling/retry-manager.js';
import { ApplicationKernelIntegrationService } from '../integration/application-kernel-integration.js';
import { DomainKernelIntegrationService } from '../integration/domain-kernel-integration.js';

describe('InfrastructureKernelService - 改进版', () => {
  let service: InfrastructureKernelService;
  let module: TestingModule;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        InfrastructureKernelService,
        // 数据库相关服务
        {
          provide: DatabaseService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            disconnectAll: jest.fn().mockResolvedValue(undefined),
            connect: jest.fn().mockResolvedValue(undefined),
            disconnect: jest.fn().mockResolvedValue(undefined),
            getConnection: jest.fn().mockReturnValue({})
          }
        },
        {
          provide: ConnectionPoolService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            configurePool: jest.fn(),
            getPoolConfig: jest.fn().mockReturnValue({}),
            getPoolStats: jest.fn().mockReturnValue({})
          }
        },
        {
          provide: TransactionService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            beginTransaction: jest.fn().mockResolvedValue({ id: 'tx1', status: 'ACTIVE' }),
            commitTransaction: jest.fn().mockResolvedValue(undefined),
            rollbackTransaction: jest.fn().mockResolvedValue(undefined)
          }
        },
        // 缓存服务
        {
          provide: CacheService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            shutdown: jest.fn().mockResolvedValue(undefined),
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            del: jest.fn().mockResolvedValue(undefined)
          }
        },
        // 隔离管理服务
        {
          provide: IsolationManager,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            shutdown: jest.fn().mockResolvedValue(undefined),
            createIsolationContext: jest.fn().mockReturnValue({
              tenantId: 'tenant1',
              organizationId: 'org1',
              departmentId: 'dept1',
              userId: 'user1',
              sharingLevel: 'USER',
              isShared: false,
              accessRules: [],
              createdAt: new Date(),
              updatedAt: new Date()
            }),
            setCurrentIsolationContext: jest.fn(),
            getCurrentIsolationContext: jest.fn().mockReturnValue({
              tenantId: 'tenant1',
              organizationId: 'org1',
              departmentId: 'dept1',
              userId: 'user1',
              sharingLevel: 'USER',
              isShared: false,
              accessRules: [],
              createdAt: new Date(),
              updatedAt: new Date()
            }),
            validateAccess: jest.fn().mockResolvedValue(true),
            applyIsolationFilter: jest.fn().mockReturnValue({}),
            filterData: jest.fn().mockReturnValue([])
          }
        },
        // 性能监控服务
        {
          provide: PerformanceMonitorService,
          useValue: {
            startMonitoring: jest.fn(),
            stopMonitoring: jest.fn(),
            healthCheck: jest.fn().mockResolvedValue(true),
            getMetrics: jest.fn().mockReturnValue({})
          }
        },
        {
          provide: HealthCheckService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            getHealthStatus: jest.fn().mockReturnValue({ status: 'healthy' })
          }
        },
        {
          provide: MetricsCollectorService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            collectMetrics: jest.fn().mockReturnValue({}),
            getMetrics: jest.fn().mockReturnValue({})
          }
        },
        {
          provide: PerformanceOptimizerService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            optimize: jest.fn().mockReturnValue({})
          }
        },
        {
          provide: MonitoringDashboardService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            getDashboard: jest.fn().mockReturnValue({})
          }
        },
        // 错误处理服务
        {
          provide: ErrorHandlerService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            handleError: jest.fn().mockResolvedValue(undefined)
          }
        },
        {
          provide: CircuitBreakerService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            execute: jest.fn().mockResolvedValue(undefined)
          }
        },
        {
          provide: RetryManagerService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            executeWithRetry: jest.fn().mockResolvedValue(undefined)
          }
        },
        // 集成服务
        {
          provide: ApplicationKernelIntegrationService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            integrate: jest.fn().mockResolvedValue(undefined)
          }
        },
        {
          provide: DomainKernelIntegrationService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            integrate: jest.fn().mockResolvedValue(undefined)
          }
        }
      ]
    }).compile();

    service = moduleRef.get<InfrastructureKernelService>(InfrastructureKernelService);
    module = moduleRef;
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('初始化', () => {
    it('应该成功初始化基础设施层', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
      expect(service.isInitialized()).toBe(true);
    });

    it('应该处理初始化失败', async () => {
      const databaseService = module.get<DatabaseService>(DatabaseService);
      jest.spyOn(databaseService, 'initialize').mockRejectedValue(new Error('数据库初始化失败'));

      await expect(service.initialize()).rejects.toThrow('基础设施层kernel初始化失败');
    });

    it('应该能够重复初始化', async () => {
      await service.initialize();
      await expect(service.initialize()).resolves.not.toThrow();
    });
  });

  describe('健康检查', () => {
    it('应该返回所有服务的健康状态', async () => {
      const healthChecks = await service.healthCheck();
      
      expect(healthChecks).toHaveProperty('database');
      expect(healthChecks).toHaveProperty('cache');
      expect(healthChecks).toHaveProperty('isolation');
      expect(healthChecks).toHaveProperty('performanceMonitor');
      expect(healthChecks).toHaveProperty('errorHandler');
      expect(healthChecks).toHaveProperty('applicationKernelIntegration');
      expect(healthChecks).toHaveProperty('domainKernelIntegration');
    });

    it('应该处理健康检查失败', async () => {
      const databaseService = module.get<DatabaseService>(DatabaseService);
      jest.spyOn(databaseService, 'healthCheck').mockRejectedValue(new Error('数据库健康检查失败'));

      const healthChecks = await service.healthCheck();
      expect(healthChecks.database).toBe(false);
    });

    it('应该返回详细的健康状态信息', async () => {
      const healthChecks = await service.healthCheck();
      
      Object.values(healthChecks).forEach(status => {
        expect(typeof status).toBe('boolean');
      });
    });
  });

  describe('系统状态', () => {
    it('应该返回完整的系统状态', async () => {
      const systemStatus = await service.getSystemStatus();
      
      expect(systemStatus).toHaveProperty('initialized');
      expect(systemStatus).toHaveProperty('healthChecks');
      expect(systemStatus).toHaveProperty('performance');
      expect(systemStatus).toHaveProperty('isolation');
      expect(systemStatus).toHaveProperty('errors');
      expect(systemStatus).toHaveProperty('services');
    });

    it('应该包含性能指标', async () => {
      const systemStatus = await service.getSystemStatus();
      
      expect(systemStatus.performance).toBeDefined();
      expect(typeof systemStatus.performance).toBe('object');
    });

    it('应该包含隔离状态', async () => {
      const systemStatus = await service.getSystemStatus();
      
      expect(systemStatus.isolation).toBeDefined();
      expect(typeof systemStatus.isolation).toBe('object');
    });
  });

  describe('服务管理', () => {
    it('应该能够获取服务', () => {
      const databaseService = service.getService<DatabaseService>('database');
      expect(databaseService).toBeDefined();
    });

    it('应该返回所有服务', () => {
      const allServices = service.getAllServices();
      expect(allServices).toHaveProperty('database');
      expect(allServices).toHaveProperty('cache');
      expect(allServices).toHaveProperty('isolation');
      expect(allServices).toHaveProperty('performanceMonitor');
      expect(allServices).toHaveProperty('errorHandler');
    });

    it('应该能够获取特定类型的服务', () => {
      const databaseService = service.getService<DatabaseService>('database');
      const cacheService = service.getService<CacheService>('cache');
      
      expect(databaseService).toBeDefined();
      expect(cacheService).toBeDefined();
    });
  });

  describe('关闭', () => {
    it('应该成功关闭基础设施层', async () => {
      await service.initialize();
      await expect(service.shutdown()).resolves.not.toThrow();
    });

    it('应该能够重复关闭', async () => {
      await service.initialize();
      await service.shutdown();
      await expect(service.shutdown()).resolves.not.toThrow();
    });

    it('应该清理所有资源', async () => {
      await service.initialize();
      await service.shutdown();
      
      expect(service.isInitialized()).toBe(false);
    });
  });

  describe('错误处理', () => {
    it('应该处理服务初始化错误', async () => {
      const cacheService = module.get<CacheService>(CacheService);
      jest.spyOn(cacheService, 'initialize').mockRejectedValue(new Error('缓存初始化失败'));

      await expect(service.initialize()).rejects.toThrow('基础设施层kernel初始化失败');
    });

    it('应该处理健康检查错误', async () => {
      const isolationManager = module.get<IsolationManager>(IsolationManager);
      jest.spyOn(isolationManager, 'healthCheck').mockRejectedValue(new Error('隔离管理器健康检查失败'));

      const healthChecks = await service.healthCheck();
      expect(healthChecks.isolation).toBe(false);
    });
  });

  describe('性能监控', () => {
    it('应该能够获取性能指标', async () => {
      const metrics = await service.getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });

    it('应该能够获取系统负载', async () => {
      const load = await service.getSystemLoad();
      expect(load).toBeDefined();
      expect(typeof load).toBe('object');
    });
  });

  describe('隔离管理', () => {
    it('应该能够创建隔离上下文', () => {
      const context = service.createIsolationContext('tenant1', 'org1', 'dept1', 'user1');
      expect(context).toBeDefined();
      expect(context.tenantId).toBe('tenant1');
      expect(context.organizationId).toBe('org1');
      expect(context.departmentId).toBe('dept1');
      expect(context.userId).toBe('user1');
    });

    it('应该能够设置当前隔离上下文', () => {
      const context = service.createIsolationContext('tenant1');
      expect(() => service.setCurrentIsolationContext(context)).not.toThrow();
    });

    it('应该能够获取当前隔离上下文', () => {
      const context = service.getCurrentIsolationContext();
      expect(context).toBeDefined();
    });
  });
});
