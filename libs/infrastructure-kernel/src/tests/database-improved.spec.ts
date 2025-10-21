/**
 * 数据库服务测试 - 改进版
 *
 * @description 测试数据库相关功能，修复依赖注入问题
 * @since 1.0.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../services/database/database-service.js';
import { ConnectionPoolService } from '../services/database/connection-pool-service.js';
import { TransactionService } from '../services/database/transaction-service.js';

describe('DatabaseService - 改进版', () => {
  let service: DatabaseService;
  let module: TestingModule;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: 'IDatabaseConnectionManager',
          useValue: {
            getConnection: jest.fn().mockResolvedValue({
              query: jest.fn().mockResolvedValue({ rows: [] }),
              transaction: jest.fn().mockImplementation(async (callback) => {
                return await callback({});
              })
            }),
            healthCheck: jest.fn().mockResolvedValue(true),
            createConnection: jest.fn().mockResolvedValue({}),
            closeConnection: jest.fn().mockResolvedValue(undefined)
          }
        }
      ]
    }).compile();

    service = moduleRef.get<DatabaseService>(DatabaseService);
    module = moduleRef;
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('数据库连接', () => {
    it('应该能够连接到数据库', async () => {
      await expect(service.connect('test', 'postgresql', {
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        dbName: 'test'
      })).resolves.not.toThrow();
    });

    it('应该能够断开数据库连接', async () => {
      await expect(service.disconnect('test')).resolves.not.toThrow();
    });

    it('应该能够获取数据库连接', () => {
      const connection = service.getConnection('test');
      expect(connection).toBeDefined();
    });

    it('应该能够处理连接错误', async () => {
      const connectionManager = module.get('IDatabaseConnectionManager');
      jest.spyOn(connectionManager, 'createConnection').mockRejectedValue(new Error('连接失败'));

      await expect(service.connect('test', 'postgresql', {
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        dbName: 'test'
      })).rejects.toThrow('连接失败');
    });

    it('应该能够处理断开连接错误', async () => {
      const connectionManager = module.get('IDatabaseConnectionManager');
      jest.spyOn(connectionManager, 'closeConnection').mockRejectedValue(new Error('断开连接失败'));

      await expect(service.disconnect('test')).rejects.toThrow('断开连接失败');
    });
  });

  describe('健康检查', () => {
    it('应该返回数据库健康状态', async () => {
      const isHealthy = await service.healthCheck();
      expect(typeof isHealthy).toBe('boolean');
    });

    it('应该处理健康检查失败', async () => {
      const connectionManager = module.get('IDatabaseConnectionManager');
      jest.spyOn(connectionManager, 'healthCheck').mockRejectedValue(new Error('健康检查失败'));

      const isHealthy = await service.healthCheck();
      expect(isHealthy).toBe(false);
    });

    it('应该返回详细的健康状态', async () => {
      const healthStatus = await service.getHealthStatus();
      expect(healthStatus).toBeDefined();
      expect(typeof healthStatus).toBe('object');
    });
  });

  describe('查询执行', () => {
    it('应该能够执行查询', async () => {
      const result = await service.query('test', 'SELECT * FROM users');
      expect(result).toBeDefined();
      expect(Array.isArray(result.rows)).toBe(true);
    });

    it('应该能够执行参数化查询', async () => {
      const result = await service.query('test', 'SELECT * FROM users WHERE id = $1', [1]);
      expect(result).toBeDefined();
      expect(Array.isArray(result.rows)).toBe(true);
    });

    it('应该能够处理查询错误', async () => {
      const connectionManager = module.get('IDatabaseConnectionManager');
      const mockConnection = {
        query: jest.fn().mockRejectedValue(new Error('查询失败'))
      };
      jest.spyOn(connectionManager, 'getConnection').mockResolvedValue(mockConnection);

      await expect(service.query('test', 'SELECT * FROM users')).rejects.toThrow('查询失败');
    });
  });

  describe('事务管理', () => {
    it('应该能够执行事务', async () => {
      const result = await service.transaction('test', async (trx) => {
        return await trx.query('SELECT * FROM users');
      });
      expect(result).toBeDefined();
    });

    it('应该能够处理事务回滚', async () => {
      await expect(service.transaction('test', async (trx) => {
        throw new Error('事务失败');
      })).rejects.toThrow('事务失败');
    });
  });
});

describe('ConnectionPoolService - 改进版', () => {
  let service: ConnectionPoolService;
  let module: TestingModule;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionPoolService,
        {
          provide: 'IDatabaseConnectionManager',
          useValue: {
            getConnection: jest.fn().mockResolvedValue({}),
            healthCheck: jest.fn().mockResolvedValue(true),
            createConnection: jest.fn().mockResolvedValue({}),
            closeConnection: jest.fn().mockResolvedValue(undefined)
          }
        }
      ]
    }).compile();

    service = moduleRef.get<ConnectionPoolService>(ConnectionPoolService);
    module = moduleRef;
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('连接池管理', () => {
    it('应该能够配置连接池', () => {
      service.configurePool('test', {
        minConnections: 2,
        maxConnections: 10,
        connectionTimeout: 30000,
        idleTimeout: 300000,
        validationInterval: 60000,
        enabled: true
      });

      const config = service.getPoolConfig('test');
      expect(config).toBeDefined();
      expect(config?.minConnections).toBe(2);
      expect(config?.maxConnections).toBe(10);
    });

    it('应该能够获取连接池统计信息', () => {
      const stats = service.getPoolStats('test');
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });

    it('应该能够获取连接池状态', () => {
      const status = service.getPoolStatus('test');
      expect(status).toBeDefined();
      expect(typeof status).toBe('object');
    });

    it('应该能够重置连接池', async () => {
      await expect(service.resetPool('test')).resolves.not.toThrow();
    });

    it('应该能够关闭连接池', async () => {
      await expect(service.closePool('test')).resolves.not.toThrow();
    });
  });

  describe('连接获取', () => {
    it('应该能够从连接池获取连接', async () => {
      const connection = await service.getConnection('test');
      expect(connection).toBeDefined();
    });

    it('应该能够释放连接到连接池', async () => {
      const connection = await service.getConnection('test');
      await expect(service.releaseConnection('test', connection)).resolves.not.toThrow();
    });

    it('应该能够处理连接池满的情况', async () => {
      // 模拟连接池满的情况
      const connectionManager = module.get('IDatabaseConnectionManager');
      jest.spyOn(connectionManager, 'getConnection').mockRejectedValue(new Error('连接池已满'));

      await expect(service.getConnection('test')).rejects.toThrow('连接池已满');
    });
  });

  describe('健康检查', () => {
    it('应该返回连接池健康状态', async () => {
      const isHealthy = await service.healthCheck();
      expect(typeof isHealthy).toBe('boolean');
    });

    it('应该处理健康检查失败', async () => {
      const connectionManager = module.get('IDatabaseConnectionManager');
      jest.spyOn(connectionManager, 'healthCheck').mockRejectedValue(new Error('健康检查失败'));

      const isHealthy = await service.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });
});

describe('TransactionService - 改进版', () => {
  let service: TransactionService;
  let module: TestingModule;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: 'IDatabaseConnectionManager',
          useValue: {
            getConnection: jest.fn().mockResolvedValue({
              transaction: jest.fn().mockImplementation(async (callback) => {
                return await callback({});
              })
            }),
            healthCheck: jest.fn().mockResolvedValue(true)
          }
        }
      ]
    }).compile();

    service = moduleRef.get<TransactionService>(TransactionService);
    module = moduleRef;
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('事务管理', () => {
    it('应该能够开始事务', async () => {
      const transaction = await service.beginTransaction('test');
      expect(transaction).toBeDefined();
      expect(transaction.status).toBe('ACTIVE');
    });

    it('应该能够提交事务', async () => {
      const transaction = await service.beginTransaction('test');
      await expect(service.commitTransaction(transaction.id)).resolves.not.toThrow();
    });

    it('应该能够回滚事务', async () => {
      const transaction = await service.beginTransaction('test');
      await expect(service.rollbackTransaction(transaction.id)).resolves.not.toThrow();
    });

    it('应该能够执行事务回调', async () => {
      const result = await service.executeTransaction('test', async (trx) => {
        return 'transaction result';
      });
      expect(result).toBe('transaction result');
    });

    it('应该能够处理事务执行错误', async () => {
      await expect(service.executeTransaction('test', async (trx) => {
        throw new Error('事务执行失败');
      })).rejects.toThrow('事务执行失败');
    });
  });

  describe('事务状态管理', () => {
    it('应该能够获取事务状态', () => {
      const status = service.getTransactionStatus('tx1');
      expect(status).toBeDefined();
    });

    it('应该能够获取所有活跃事务', () => {
      const activeTransactions = service.getActiveTransactions();
      expect(Array.isArray(activeTransactions)).toBe(true);
    });

    it('应该能够清理过期事务', async () => {
      await expect(service.cleanupExpiredTransactions()).resolves.not.toThrow();
    });
  });

  describe('健康检查', () => {
    it('应该返回事务服务健康状态', async () => {
      const isHealthy = await service.healthCheck();
      expect(typeof isHealthy).toBe('boolean');
    });

    it('应该处理健康检查失败', async () => {
      const connectionManager = module.get('IDatabaseConnectionManager');
      jest.spyOn(connectionManager, 'healthCheck').mockRejectedValue(new Error('健康检查失败'));

      const isHealthy = await service.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的事务ID', async () => {
      await expect(service.commitTransaction('invalid-id')).rejects.toThrow();
    });

    it('应该处理重复的事务操作', async () => {
      const transaction = await service.beginTransaction('test');
      await service.commitTransaction(transaction.id);
      
      await expect(service.commitTransaction(transaction.id)).rejects.toThrow();
    });

    it('应该处理连接错误', async () => {
      const connectionManager = module.get('IDatabaseConnectionManager');
      jest.spyOn(connectionManager, 'getConnection').mockRejectedValue(new Error('连接失败'));

      await expect(service.beginTransaction('test')).rejects.toThrow('连接失败');
    });
  });
});
