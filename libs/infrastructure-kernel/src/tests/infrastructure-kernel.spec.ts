/**
 * 基础设施层kernel测试
 *
 * @description 测试基础设施层的核心功能
 * @since 1.0.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { InfrastructureKernelService } from '../services/infrastructure-kernel.service.js';
import { DatabaseService } from '../services/database/database-service.js';
import { CacheService } from '../services/cache/cache-service.js';
import { IsolationManager } from '../services/isolation/isolation-manager.js';
import { PerformanceMonitorService } from '../services/performance/performance-monitor.js';
import { ErrorHandlerService } from '../services/error-handling/error-handler.js';

describe('InfrastructureKernelService', () => {
  let service: InfrastructureKernelService;
  let module: TestingModule;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        InfrastructureKernelService,
        {
          provide: DatabaseService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            disconnectAll: jest.fn().mockResolvedValue(undefined)
          }
        },
        {
          provide: CacheService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            shutdown: jest.fn().mockResolvedValue(undefined)
          }
        },
        {
          provide: IsolationManager,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
            shutdown: jest.fn().mockResolvedValue(undefined)
          }
        },
        {
          provide: PerformanceMonitorService,
          useValue: {
            startMonitoring: jest.fn(),
            stopMonitoring: jest.fn(),
            healthCheck: jest.fn().mockResolvedValue(true)
          }
        },
        {
          provide: ErrorHandlerService,
          useValue: {
            initialize: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true)
          }
        }
      ]
    }).compile();

    service = moduleRef.get<InfrastructureKernelService>(InfrastructureKernelService);
    module = moduleRef;
  });

  afterEach(async () => {
    await module.close();
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
  });

  describe('健康检查', () => {
    it('应该返回所有服务的健康状态', async () => {
      const healthChecks = await service.healthCheck();
      
      expect(healthChecks).toHaveProperty('database');
      expect(healthChecks).toHaveProperty('cache');
      expect(healthChecks).toHaveProperty('isolation');
      expect(healthChecks).toHaveProperty('performanceMonitor');
      expect(healthChecks).toHaveProperty('errorHandler');
    });

    it('应该处理健康检查失败', async () => {
      const databaseService = module.get<DatabaseService>(DatabaseService);
      jest.spyOn(databaseService, 'healthCheck').mockRejectedValue(new Error('数据库健康检查失败'));

      const healthChecks = await service.healthCheck();
      expect(healthChecks.database).toBe(false);
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
    });
  });

  describe('关闭', () => {
    it('应该成功关闭基础设施层', async () => {
      await service.initialize();
      await expect(service.shutdown()).resolves.not.toThrow();
    });
  });
});
