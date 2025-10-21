/**
 * 测试工具类
 *
 * @description 提供测试中常用的工具函数和模拟对象
 * @since 1.0.0
 */

import { Test, TestingModule } from '@nestjs/testing';

/**
 * 模拟数据库连接管理器
 */
export class MockDatabaseConnectionManager {
  private connections = new Map<string, any>();

  async getConnection(name: string) {
    if (!this.connections.has(name)) {
      this.connections.set(name, {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        transaction: jest.fn().mockImplementation(async (callback) => {
          return await callback({});
        }),
        close: jest.fn().mockResolvedValue(undefined)
      });
    }
    return this.connections.get(name);
  }

  async createConnection(name: string, config: any) {
    const connection = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      transaction: jest.fn().mockImplementation(async (callback) => {
        return await callback({});
      }),
      close: jest.fn().mockResolvedValue(undefined)
    };
    this.connections.set(name, connection);
    return connection;
  }

  async closeConnection(name: string) {
    const connection = this.connections.get(name);
    if (connection) {
      await connection.close();
      this.connections.delete(name);
    }
  }

  async healthCheck() {
    return true;
  }
}

/**
 * 模拟隔离上下文管理器
 */
export class MockIsolationContextManager {
  private currentContext: any = null;

  createContext(tenantId: string, orgId?: string, deptId?: string, userId?: string) {
    const context = {
      tenantId,
      organizationId: orgId,
      departmentId: deptId,
      userId,
      sharingLevel: userId ? 'USER' : deptId ? 'DEPARTMENT' : orgId ? 'ORGANIZATION' : 'TENANT',
      isShared: false,
      accessRules: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.currentContext = context;
    return context;
  }

  getCurrentContext() {
    return this.currentContext || this.createContext('default-tenant');
  }

  setCurrentContext(context: any) {
    this.currentContext = context;
  }

  clearCurrentContext() {
    this.currentContext = null;
  }

  validateContext(context: any) {
    return context && context.tenantId && context.tenantId.length > 0;
  }

  async healthCheck() {
    return true;
  }
}

/**
 * 模拟访问控制服务
 */
export class MockAccessControlService {
  async validateAccess(context: any, resource: any, action?: string) {
    return true;
  }

  applyIsolationFilter(query: any, context: any) {
    return {
      ...query,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      departmentId: context.departmentId,
      userId: context.userId
    };
  }

  filterData(data: any[], context: any) {
    return data.filter(item => 
      item.tenantId === context.tenantId &&
      (!context.organizationId || item.organizationId === context.organizationId) &&
      (!context.departmentId || item.departmentId === context.departmentId) &&
      (!context.userId || item.userId === context.userId)
    );
  }

  async healthCheck() {
    return true;
  }
}

/**
 * 模拟审计日志服务
 */
export class MockAuditLogService {
  async logAccess(context: any, resource: any, action: string) {
    return Promise.resolve();
  }

  async logDataAccess(context: any, data: any, operation: string) {
    return Promise.resolve();
  }

  async healthCheck() {
    return true;
  }
}

/**
 * 模拟安全监控服务
 */
export class MockSecurityMonitorService {
  async monitorAccess(context: any, resource: any, action: string) {
    return Promise.resolve();
  }

  async detectAnomalies() {
    return [];
  }

  async healthCheck() {
    return true;
  }
}

/**
 * 模拟缓存服务
 */
export class MockCacheService {
  private cache = new Map<string, any>();

  async get(key: string) {
    return this.cache.get(key) || null;
  }

  async set(key: string, value: any, ttl?: number) {
    this.cache.set(key, value);
    if (ttl) {
      setTimeout(() => this.cache.delete(key), ttl);
    }
  }

  async del(key: string) {
    return this.cache.delete(key);
  }

  async clear() {
    this.cache.clear();
  }

  async healthCheck() {
    return true;
  }

  async initialize() {
    return Promise.resolve();
  }

  async shutdown() {
    this.cache.clear();
    return Promise.resolve();
  }
}

/**
 * 模拟性能监控服务
 */
export class MockPerformanceMonitorService {
  private metrics: any = {};

  startMonitoring() {
    return Promise.resolve();
  }

  stopMonitoring() {
    return Promise.resolve();
  }

  getMetrics() {
    return this.metrics;
  }

  async healthCheck() {
    return true;
  }
}

/**
 * 测试模块构建器
 */
export class TestModuleBuilder {
  private providers: any[] = [];

  addProvider(provider: any) {
    this.providers.push(provider);
    return this;
  }

  addMockDatabaseConnectionManager() {
    this.providers.push({
      provide: 'IDatabaseConnectionManager',
      useValue: new MockDatabaseConnectionManager()
    });
    return this;
  }

  addMockIsolationContextManager() {
    this.providers.push({
      provide: 'IsolationContextManager',
      useValue: new MockIsolationContextManager()
    });
    return this;
  }

  addMockAccessControlService() {
    this.providers.push({
      provide: 'AccessControlService',
      useValue: new MockAccessControlService()
    });
    return this;
  }

  addMockAuditLogService() {
    this.providers.push({
      provide: 'AuditLogService',
      useValue: new MockAuditLogService()
    });
    return this;
  }

  addMockSecurityMonitorService() {
    this.providers.push({
      provide: 'SecurityMonitorService',
      useValue: new MockSecurityMonitorService()
    });
    return this;
  }

  addMockCacheService() {
    this.providers.push({
      provide: 'CacheService',
      useValue: new MockCacheService()
    });
    return this;
  }

  addMockPerformanceMonitorService() {
    this.providers.push({
      provide: 'PerformanceMonitorService',
      useValue: new MockPerformanceMonitorService()
    });
    return this;
  }

  async build(): Promise<TestingModule> {
    return await Test.createTestingModule({
      providers: this.providers
    }).compile();
  }
}

/**
 * 测试数据工厂
 */
export class TestDataFactory {
  static createIsolationContext(overrides: any = {}) {
    return {
      tenantId: 'test-tenant',
      organizationId: 'test-org',
      departmentId: 'test-dept',
      userId: 'test-user',
      sharingLevel: 'USER',
      isShared: false,
      accessRules: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  static createDatabaseConfig(overrides: any = {}) {
    return {
      name: 'test-db',
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: 'test',
      username: 'test',
      password: 'test',
      ...overrides
    };
  }

  static createTestData(count: number = 3) {
    return Array.from({ length: count }, (_, i) => ({
      id: `test-${i + 1}`,
      tenantId: 'test-tenant',
      organizationId: 'test-org',
      departmentId: 'test-dept',
      userId: 'test-user',
      name: `Test Item ${i + 1}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }
}

/**
 * 测试断言工具
 */
export class TestAssertions {
  static expectIsolationContext(context: any) {
    expect(context).toBeDefined();
    expect(context.tenantId).toBeDefined();
    expect(context.sharingLevel).toBeDefined();
    expect(context.createdAt).toBeInstanceOf(Date);
    expect(context.updatedAt).toBeInstanceOf(Date);
  }

  static expectHealthCheckResult(result: any) {
    expect(typeof result).toBe('boolean');
  }

  static expectServiceResponse(response: any) {
    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
  }
}
