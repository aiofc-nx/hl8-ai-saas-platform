/**
 * 事务服务单元测试
 *
 * @description 测试 TransactionService 的事务管理功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { TransactionService } from "../../src/services/database/transaction-service.js";

describe("TransactionService", () => {
  let service: TransactionService;
  let mockConnectionManager: any;

  beforeEach(async () => {
    mockConnectionManager = {
      getConnection: jest.fn(),
      createConnection: jest.fn(),
      closeConnection: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: "IDatabaseConnectionManager",
          useValue: mockConnectionManager,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe("beginTransaction", () => {
    it("should begin a transaction", async () => {
      // Arrange
      const config = {
        isolationLevel: "READ_COMMITTED",
        timeout: 30000,
        readOnly: false,
        distributed: false,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      const mockConnection = {
        id: "connection-1",
        isConnected: true,
        beginTransaction: jest.fn().mockResolvedValue(undefined),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      // Act
      const transaction = await service.beginTransaction(
        "test-connection",
        config,
      );

      // Assert
      expect(transaction).toBeDefined();
      expect(transaction.id).toBeDefined();
      expect(transaction.connectionName).toBe("test-connection");
      expect(transaction.isolationLevel).toBe("READ_COMMITTED");
      expect(transaction.status).toBe("ACTIVE");
      expect(transaction.startTime).toBeInstanceOf(Date);
    });

    it("should handle transaction begin errors", async () => {
      // Arrange
      const config = {
        isolationLevel: "READ_COMMITTED",
        timeout: 30000,
        readOnly: false,
        distributed: false,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      mockConnectionManager.getConnection.mockRejectedValue(
        new Error("Connection failed"),
      );

      // Act & Assert
      await expect(
        service.beginTransaction("test-connection", config),
      ).rejects.toThrow("Connection failed");
    });
  });

  describe("commitTransaction", () => {
    it("should commit a transaction", async () => {
      // Arrange
      const config = {
        isolationLevel: "READ_COMMITTED",
        timeout: 30000,
        readOnly: false,
        distributed: false,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      const mockConnection = {
        id: "connection-1",
        isConnected: true,
        beginTransaction: jest.fn().mockResolvedValue(undefined),
        commitTransaction: jest.fn().mockResolvedValue(undefined),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      const transaction = await service.beginTransaction(
        "test-connection",
        config,
      );

      // Act
      await service.commitTransaction(transaction.id);

      // Assert
      expect(mockConnection.commitTransaction).toHaveBeenCalled();
    });

    it("should handle transaction commit errors", async () => {
      // Arrange
      const config = {
        isolationLevel: "READ_COMMITTED",
        timeout: 30000,
        readOnly: false,
        distributed: false,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      const mockConnection = {
        id: "connection-1",
        isConnected: true,
        beginTransaction: jest.fn().mockResolvedValue(undefined),
        commitTransaction: jest
          .fn()
          .mockRejectedValue(new Error("Commit failed")),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      const transaction = await service.beginTransaction(
        "test-connection",
        config,
      );

      // Act & Assert
      await expect(service.commitTransaction(transaction.id)).rejects.toThrow(
        "Commit failed",
      );
    });
  });

  describe("rollbackTransaction", () => {
    it("should rollback a transaction", async () => {
      // Arrange
      const config = {
        isolationLevel: "READ_COMMITTED",
        timeout: 30000,
        readOnly: false,
        distributed: false,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      const mockConnection = {
        id: "connection-1",
        isConnected: true,
        beginTransaction: jest.fn().mockResolvedValue(undefined),
        rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      const transaction = await service.beginTransaction(
        "test-connection",
        config,
      );

      // Act
      await service.rollbackTransaction(transaction.id);

      // Assert
      expect(mockConnection.rollbackTransaction).toHaveBeenCalled();
    });

    it("should handle transaction rollback errors", async () => {
      // Arrange
      const config = {
        isolationLevel: "READ_COMMITTED",
        timeout: 30000,
        readOnly: false,
        distributed: false,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      const mockConnection = {
        id: "connection-1",
        isConnected: true,
        beginTransaction: jest.fn().mockResolvedValue(undefined),
        rollbackTransaction: jest
          .fn()
          .mockRejectedValue(new Error("Rollback failed")),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      const transaction = await service.beginTransaction(
        "test-connection",
        config,
      );

      // Act & Assert
      await expect(service.rollbackTransaction(transaction.id)).rejects.toThrow(
        "Rollback failed",
      );
    });
  });

  describe("getTransaction", () => {
    it("should return transaction by ID", async () => {
      // Arrange
      const config = {
        isolationLevel: "READ_COMMITTED",
        timeout: 30000,
        readOnly: false,
        distributed: false,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      const mockConnection = {
        id: "connection-1",
        isConnected: true,
        beginTransaction: jest.fn().mockResolvedValue(undefined),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      const transaction = await service.beginTransaction(
        "test-connection",
        config,
      );

      // Act
      const retrievedTransaction = service.getTransaction(transaction.id);

      // Assert
      expect(retrievedTransaction).toBeDefined();
      expect(retrievedTransaction?.id).toBe(transaction.id);
    });

    it("should return undefined for non-existent transaction", () => {
      // Act
      const transaction = service.getTransaction("non-existent-id");

      // Assert
      expect(transaction).toBeUndefined();
    });
  });

  describe("getAllTransactions", () => {
    it("should return all transactions", async () => {
      // Arrange
      const config = {
        isolationLevel: "READ_COMMITTED",
        timeout: 30000,
        readOnly: false,
        distributed: false,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      const mockConnection = {
        id: "connection-1",
        isConnected: true,
        beginTransaction: jest.fn().mockResolvedValue(undefined),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      await service.beginTransaction("test-connection", config);
      await service.beginTransaction("test-connection", config);

      // Act
      const transactions = service.getAllTransactions();

      // Assert
      expect(transactions).toBeDefined();
      expect(transactions.length).toBe(2);
    });
  });

  describe("getTransactionStats", () => {
    it("should return transaction statistics", async () => {
      // Arrange
      const config = {
        isolationLevel: "READ_COMMITTED",
        timeout: 30000,
        readOnly: false,
        distributed: false,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      const mockConnection = {
        id: "connection-1",
        isConnected: true,
        beginTransaction: jest.fn().mockResolvedValue(undefined),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      await service.beginTransaction("test-connection", config);

      // Act
      const stats = service.getTransactionStats();

      // Assert
      expect(stats).toBeDefined();
      expect(stats.totalTransactions).toBeDefined();
      expect(stats.activeTransactions).toBeDefined();
      expect(stats.committedTransactions).toBeDefined();
      expect(stats.rolledBackTransactions).toBeDefined();
      expect(stats.averageDuration).toBeDefined();
      expect(stats.errorRate).toBeDefined();
    });
  });

  describe("executeInTransaction", () => {
    it("should execute function within transaction", async () => {
      // Arrange
      const config = {
        isolationLevel: "READ_COMMITTED",
        timeout: 30000,
        readOnly: false,
        distributed: false,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      const mockConnection = {
        id: "connection-1",
        isConnected: true,
        beginTransaction: jest.fn().mockResolvedValue(undefined),
        commitTransaction: jest.fn().mockResolvedValue(undefined),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      const testFunction = jest.fn().mockResolvedValue("result");

      // Act
      const result = await service.executeInTransaction(
        "test-connection",
        config,
        testFunction,
      );

      // Assert
      expect(result).toBe("result");
      expect(testFunction).toHaveBeenCalled();
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commitTransaction).toHaveBeenCalled();
    });

    it("should rollback transaction on function _error", async () => {
      // Arrange
      const config = {
        isolationLevel: "READ_COMMITTED",
        timeout: 30000,
        readOnly: false,
        distributed: false,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      const mockConnection = {
        id: "connection-1",
        isConnected: true,
        beginTransaction: jest.fn().mockResolvedValue(undefined),
        rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      const testFunction = jest
        .fn()
        .mockRejectedValue(new Error("Function failed"));

      // Act & Assert
      await expect(
        service.executeInTransaction("test-connection", config, testFunction),
      ).rejects.toThrow("Function failed");
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe("validateTransactionConfig", () => {
    it("should validate transaction configuration", () => {
      // Arrange
      const validConfig = {
        isolationLevel: "READ_COMMITTED",
        timeout: 30000,
        readOnly: false,
        distributed: false,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      // Act
      const isValid = service.validateTransactionConfig(validConfig);

      // Assert
      expect(isValid).toBe(true);
    });

    it("should reject invalid transaction configuration", () => {
      // Arrange
      const invalidConfig = {
        isolationLevel: "INVALID",
        timeout: -1,
        readOnly: false,
        distributed: false,
        retryAttempts: -1,
        retryDelay: -1,
      };

      // Act
      const isValid = service.validateTransactionConfig(invalidConfig);

      // Assert
      expect(isValid).toBe(false);
    });
  });

  describe("getTransactionHealth", () => {
    it("should return transaction health status", async () => {
      // Arrange
      const config = {
        isolationLevel: "READ_COMMITTED",
        timeout: 30000,
        readOnly: false,
        distributed: false,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      const mockConnection = {
        id: "connection-1",
        isConnected: true,
        beginTransaction: jest.fn().mockResolvedValue(undefined),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      await service.beginTransaction("test-connection", config);

      // Act
      const health = service.getTransactionHealth();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.details).toBeDefined();
    });
  });

  describe("cleanupTransactions", () => {
    it("should cleanup completed transactions", async () => {
      // Arrange
      const config = {
        isolationLevel: "READ_COMMITTED",
        timeout: 30000,
        readOnly: false,
        distributed: false,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      const mockConnection = {
        id: "connection-1",
        isConnected: true,
        beginTransaction: jest.fn().mockResolvedValue(undefined),
        commitTransaction: jest.fn().mockResolvedValue(undefined),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      const transaction = await service.beginTransaction(
        "test-connection",
        config,
      );
      await service.commitTransaction(transaction.id);

      // Act
      service.cleanupTransactions();

      // Assert
      const transactions = service.getAllTransactions();
      expect(transactions.length).toBe(0);
    });
  });
});
