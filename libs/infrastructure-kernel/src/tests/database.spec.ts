/**
 * 数据库服务测试
 *
 * @description 测试数据库相关功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../services/database/database-service.js";
import { ConnectionPoolService } from "../services/database/connection-pool-service.js";
import { TransactionService } from "../services/database/transaction-service.js";

describe("DatabaseService", () => {
  let service: DatabaseService;
  let module: TestingModule;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: "IDatabaseConnectionManager",
          useValue: {
            getConnection: jest.fn().mockResolvedValue({}),
            healthCheck: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<DatabaseService>(DatabaseService);
    module = moduleRef;
  });

  afterEach(async () => {
    await module.close();
  });

  describe("数据库连接", () => {
    it("应该能够连接到数据库", async () => {
      await expect(
        service.connect("test", "postgresql", {
          type: "postgresql",
          host: "localhost",
          port: 5432,
          dbName: "test",
        }),
      ).resolves.not.toThrow();
    });

    it("应该能够断开数据库连接", async () => {
      await expect(service.disconnect("test")).resolves.not.toThrow();
    });

    it("应该能够获取数据库连接", () => {
      const connection = service.getConnection("test");
      expect(connection).toBeDefined();
    });
  });

  describe("健康检查", () => {
    it("应该返回数据库健康状态", async () => {
      const isHealthy = await service.healthCheck();
      expect(typeof isHealthy).toBe("boolean");
    });
  });
});

describe("ConnectionPoolService", () => {
  let service: ConnectionPoolService;
  let module: TestingModule;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionPoolService,
        {
          provide: "IDatabaseConnectionManager",
          useValue: {
            getConnection: jest.fn().mockResolvedValue({}),
            healthCheck: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<ConnectionPoolService>(ConnectionPoolService);
    module = moduleRef;
  });

  afterEach(async () => {
    await module.close();
  });

  describe("连接池管理", () => {
    it("应该能够配置连接池", () => {
      service.configurePool("test", {
        minConnections: 2,
        maxConnections: 10,
        connectionTimeout: 30000,
        idleTimeout: 300000,
        validationInterval: 60000,
        enabled: true,
      });

      const config = service.getPoolConfig("test");
      expect(config).toBeDefined();
      expect(config?.minConnections).toBe(2);
      expect(config?.maxConnections).toBe(10);
    });

    it("应该能够获取连接池统计信息", () => {
      const stats = service.getPoolStats("test");
      expect(stats).toBeDefined();
    });
  });
});

describe("TransactionService", () => {
  let service: TransactionService;
  let module: TestingModule;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: "IDatabaseConnectionManager",
          useValue: {
            getConnection: jest.fn().mockResolvedValue({
              transaction: jest.fn().mockImplementation(async (callback) => {
                return await callback({});
              }),
            }),
            healthCheck: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<TransactionService>(TransactionService);
    module = moduleRef;
  });

  afterEach(async () => {
    await module.close();
  });

  describe("事务管理", () => {
    it("应该能够开始事务", async () => {
      const transaction = await service.beginTransaction("test");
      expect(transaction).toBeDefined();
      expect(transaction.status).toBe("ACTIVE");
    });

    it("应该能够提交事务", async () => {
      const transaction = await service.beginTransaction("test");
      await expect(
        service.commitTransaction(transaction.id),
      ).resolves.not.toThrow();
    });

    it("应该能够回滚事务", async () => {
      const transaction = await service.beginTransaction("test");
      await expect(
        service.rollbackTransaction(transaction.id),
      ).resolves.not.toThrow();
    });
  });
});
