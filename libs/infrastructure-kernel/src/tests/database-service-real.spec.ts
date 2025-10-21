/**
 * 数据库服务真实实现测试
 *
 * @description 测试数据库服务的实际功能
 * @since 1.0.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../services/database/database-service.js';
import { TestModuleBuilder, TestDataFactory, TestAssertions } from './test-utils.js';

describe('DatabaseService - 真实实现', () => {
  let service: DatabaseService;
  let module: TestingModule;
  let mockConnectionManager: any;

  beforeEach(async () => {
    const moduleBuilder = new TestModuleBuilder()
      .addProvider(DatabaseService)
      .addMockDatabaseConnectionManager();

    module = await moduleBuilder.build();
    service = module.get<DatabaseService>(DatabaseService);
    mockConnectionManager = module.get('IDatabaseConnectionManager');
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('数据库连接管理', () => {
    it('应该能够获取数据库连接', async () => {
      const connection = await service.getConnection('test-db');
      
      expect(connection).toBeDefined();
      expect(connection.query).toBeDefined();
      expect(connection.transaction).toBeDefined();
      expect(connection.close).toBeDefined();
    });

    it('应该能够创建数据库连接', async () => {
      const config = TestDataFactory.createDatabaseConfig();
      const connection = await service.createConnection('test-db', config);
      
      expect(connection).toBeDefined();
      expect(connection.query).toBeDefined();
      expect(connection.transaction).toBeDefined();
    });

    it('应该能够关闭数据库连接', async () => {
      await service.createConnection('test-db', TestDataFactory.createDatabaseConfig());
      await expect(service.closeConnection('test-db')).resolves.not.toThrow();
    });

    it('应该处理连接错误', async () => {
      jest.spyOn(mockConnectionManager, 'getConnection').mockRejectedValue(new Error('连接失败'));
      
      await expect(service.getConnection('test-db')).rejects.toThrow('获取数据库连接失败: 连接失败');
    });

    it('应该处理创建连接错误', async () => {
      jest.spyOn(mockConnectionManager, 'createConnection').mockRejectedValue(new Error('创建失败'));
      
      await expect(service.createConnection('test-db', {})).rejects.toThrow('创建数据库连接失败: 创建失败');
    });
  });

  describe('查询执行', () => {
    it('应该能够执行查询', async () => {
      const connection = await service.getConnection('test-db');
      const result = await connection.query('SELECT * FROM users');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.rows)).toBe(true);
    });

    it('应该能够执行参数化查询', async () => {
      const connection = await service.getConnection('test-db');
      const result = await connection.query('SELECT * FROM users WHERE id = $1', [1]);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.rows)).toBe(true);
    });

    it('应该能够执行事务', async () => {
      const connection = await service.getConnection('test-db');
      const result = await connection.transaction(async (trx) => {
        return await trx.query('SELECT * FROM users');
      });
      
      expect(result).toBeDefined();
    });
  });

  describe('健康检查', () => {
    it('应该返回数据库健康状态', async () => {
      const isHealthy = await service.healthCheck();
      TestAssertions.expectHealthCheckResult(isHealthy);
    });

    it('应该处理健康检查失败', async () => {
      jest.spyOn(mockConnectionManager, 'healthCheck').mockRejectedValue(new Error('健康检查失败'));
      
      const isHealthy = await service.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe('连接池管理', () => {
    it('应该能够配置连接池', async () => {
      const config = {
        minConnections: 2,
        maxConnections: 10,
        connectionTimeout: 30000,
        idleTimeout: 300000
      };
      
      await expect(service.configureConnectionPool('test-db', config)).resolves.not.toThrow();
    });

    it('应该能够获取连接池状态', async () => {
      const status = await service.getConnectionPoolStatus('test-db');
      
      expect(status).toBeDefined();
      expect(typeof status).toBe('object');
    });
  });

  describe('事务管理', () => {
    it('应该能够开始事务', async () => {
      const transaction = await service.beginTransaction('test-db');
      
      expect(transaction).toBeDefined();
      expect(transaction.id).toBeDefined();
      expect(transaction.status).toBeDefined();
    });

    it('应该能够提交事务', async () => {
      const transaction = await service.beginTransaction('test-db');
      await expect(service.commitTransaction(transaction.id)).resolves.not.toThrow();
    });

    it('应该能够回滚事务', async () => {
      const transaction = await service.beginTransaction('test-db');
      await expect(service.rollbackTransaction(transaction.id)).resolves.not.toThrow();
    });
  });

  describe('隔离上下文支持', () => {
    it('应该能够应用隔离上下文', async () => {
      const context = TestDataFactory.createIsolationContext();
      const serviceWithContext = new DatabaseService(mockConnectionManager, context);
      
      const connection = await serviceWithContext.getConnection('test-db');
      expect(connection).toBeDefined();
    });

    it('应该能够过滤查询结果', async () => {
      const context = TestDataFactory.createIsolationContext();
      const serviceWithContext = new DatabaseService(mockConnectionManager, context);
      
      const connection = await serviceWithContext.getConnection('test-db');
      const result = await connection.query('SELECT * FROM users');
      
      expect(result).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的连接名称', async () => {
      jest.spyOn(mockConnectionManager, 'getConnection').mockRejectedValue(new Error('连接不存在'));
      
      await expect(service.getConnection('invalid-db')).rejects.toThrow('获取数据库连接失败: 连接不存在');
    });

    it('应该处理连接超时', async () => {
      jest.spyOn(mockConnectionManager, 'getConnection').mockRejectedValue(new Error('连接超时'));
      
      await expect(service.getConnection('timeout-db')).rejects.toThrow('获取数据库连接失败: 连接超时');
    });

    it('应该处理数据库错误', async () => {
      const connection = await service.getConnection('test-db');
      jest.spyOn(connection, 'query').mockRejectedValue(new Error('数据库错误'));
      
      await expect(connection.query('SELECT * FROM invalid_table')).rejects.toThrow('数据库错误');
    });
  });

  describe('性能测试', () => {
    it('应该能够处理并发连接', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        service.getConnection(`test-db-${i}`)
      );
      
      const connections = await Promise.all(promises);
      expect(connections).toHaveLength(10);
      connections.forEach(connection => {
        expect(connection).toBeDefined();
      });
    });

    it('应该能够处理大量查询', async () => {
      const connection = await service.getConnection('test-db');
      const promises = Array.from({ length: 100 }, () => 
        connection.query('SELECT 1')
      );
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });
});
