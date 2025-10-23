/**
 * 数据库服务单元测试
 *
 * @description 测试 DatabaseService 的核心功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "./database-service.js";
import { ConnectionManagerService } from "./connection-manager.service.js";
import { InfrastructureExceptionConverter } from "../../../exceptions/infrastructure-exception.mapping.js";
import { GeneralInternalServerException } from "@hl8/exceptions";

// Mock InfrastructureExceptionConverter
jest.mock("../../../exceptions/infrastructure-exception.mapping.js");
const MockInfrastructureExceptionConverter =
  InfrastructureExceptionConverter as jest.Mocked<
    typeof InfrastructureExceptionConverter
  >;

describe("DatabaseService", () => {
  let service: DatabaseService;
  let mockConnectionManager: jest.Mocked<ConnectionManagerService>;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock ConnectionManagerService
    mockConnectionManager = {
      getConnection: jest.fn(),
      createConnection: jest.fn(),
      closeConnection: jest.fn(),
      listConnections: jest.fn(),
      getConnectionStatus: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DatabaseService,
          useFactory: () => new DatabaseService(mockConnectionManager),
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe("getConnection", () => {
    it("should return connection successfully", async () => {
      // Arrange
      const connectionName = "test-db";
      const mockConnection = { name: connectionName, isConnected: true };
      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      // Act
      const result = await service.getConnection(connectionName);

      // Assert
      expect(mockConnectionManager.getConnection).toHaveBeenCalledWith(
        connectionName,
      );
      expect(result).toBe(mockConnection);
    });

    it("should throw standardized exception on connection failure", async () => {
      // Arrange
      const connectionName = "test-db";
      const _error = new Error("Connection failed");
      const mockException = new GeneralInternalServerException(
        "数据库操作失败",
        "获取数据库连接失败",
        { operation: "getConnection", connectionName },
      );

      mockConnectionManager.getConnection.mockRejectedValue(_error);
      MockInfrastructureExceptionConverter.convertToStandardException.mockReturnValue(
        mockException,
      );

      // Act & Assert
      await expect(service.getConnection(connectionName)).rejects.toThrow(
        GeneralInternalServerException,
      );
      expect(
        MockInfrastructureExceptionConverter.convertToStandardException,
      ).toHaveBeenCalledWith(_error, "DATABASE", {
        operation: "getConnection",
        connectionName,
      });
    });
  });

  describe("createConnection", () => {
    it("should create connection successfully", async () => {
      // Arrange
      const connectionName = "test-db";
      const config = {
        id: "1",
        name: connectionName,
        primaryConnection: {
          host: "localhost",
          port: 5432,
          database: "test",
          username: "test",
          password: "test",
        },
      } as any;
      const mockConnection = { name: connectionName, isConnected: true };
      mockConnectionManager.createConnection.mockResolvedValue(mockConnection);

      // Act
      const result = await service.createConnection(connectionName, config);

      // Assert
      expect(mockConnectionManager.createConnection).toHaveBeenCalledWith(
        connectionName,
        config,
      );
      expect(result).toBe(mockConnection);
    });

    it("should throw standardized exception on creation failure", async () => {
      // Arrange
      const connectionName = "test-db";
      const config = {} as any;
      const _error = new Error("Creation failed");
      const mockException = new GeneralInternalServerException(
        "数据库操作失败",
        "创建数据库连接失败",
        { operation: "createConnection", connectionName },
      );

      mockConnectionManager.createConnection.mockRejectedValue(_error);
      MockInfrastructureExceptionConverter.convertToStandardException.mockReturnValue(
        mockException,
      );

      // Act & Assert
      await expect(
        service.createConnection(connectionName, config),
      ).rejects.toThrow(GeneralInternalServerException);
      expect(
        MockInfrastructureExceptionConverter.convertToStandardException,
      ).toHaveBeenCalledWith(_error, "DATABASE", {
        operation: "createConnection",
        connectionName,
      });
    });
  });

  describe("closeConnection", () => {
    it("should close connection successfully", async () => {
      // Arrange
      const connectionName = "test-db";
      mockConnectionManager.closeConnection.mockResolvedValue(undefined);

      // Act
      await service.closeConnection(connectionName);

      // Assert
      expect(mockConnectionManager.closeConnection).toHaveBeenCalledWith(
        connectionName,
      );
    });

    it("should throw standardized exception on close failure", async () => {
      // Arrange
      const connectionName = "test-db";
      const _error = new Error("Close failed");
      const mockException = new GeneralInternalServerException(
        "数据库操作失败",
        "关闭数据库连接失败",
        { operation: "closeConnection", connectionName },
      );

      mockConnectionManager.closeConnection.mockRejectedValue(_error);
      MockInfrastructureExceptionConverter.convertToStandardException.mockReturnValue(
        mockException,
      );

      // Act & Assert
      await expect(service.closeConnection(connectionName)).rejects.toThrow(
        GeneralInternalServerException,
      );
      expect(
        MockInfrastructureExceptionConverter.convertToStandardException,
      ).toHaveBeenCalledWith(_error, "DATABASE", {
        operation: "closeConnection",
        connectionName,
      });
    });
  });

  describe("executeTransaction", () => {
    it("should execute transaction successfully", async () => {
      // Arrange
      const connectionName = "test-db";
      const mockConnection = {
        transaction: jest.fn().mockImplementation(async (callback) => {
          return await callback(mockConnection);
        }),
      };
      const operation = jest.fn().mockResolvedValue("result");

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      // Act
      const result = await service.executeTransaction(
        connectionName,
        operation,
      );

      // Assert
      expect(mockConnectionManager.getConnection).toHaveBeenCalledWith(
        connectionName,
      );
      expect(mockConnection.transaction).toHaveBeenCalled();
      expect(operation).toHaveBeenCalledWith(mockConnection);
      expect(result).toBe("result");
    });

    it("should throw _error on transaction failure", async () => {
      // Arrange
      const connectionName = "test-db";
      const operation = jest
        .fn()
        .mockRejectedValue(new Error("Transaction failed"));
      const mockConnection = {
        transaction: jest.fn().mockImplementation(async (callback) => {
          return await callback(mockConnection);
        }),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      // Act & Assert
      await expect(
        service.executeTransaction(connectionName, operation),
      ).rejects.toThrow("执行事务失败");
    });
  });

  describe("query", () => {
    it("should execute query successfully", async () => {
      // Arrange
      const connectionName = "test-db";
      const sql = "SELECT * FROM users";
      const params = ["param1", "param2"];
      const mockConnection = {
        query: jest.fn().mockResolvedValue({ rows: [{ id: 1, name: "test" }] }),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      // Act
      const result = await service.query(connectionName, sql, params);

      // Assert
      expect(mockConnectionManager.getConnection).toHaveBeenCalledWith(
        connectionName,
      );
      expect(mockConnection.query).toHaveBeenCalledWith(sql, params);
      expect(result).toEqual({ rows: [{ id: 1, name: "test" }] });
    });

    it("should throw _error on query failure", async () => {
      // Arrange
      const connectionName = "test-db";
      const sql = "SELECT * FROM users";
      const params = ["param1"];
      const mockConnection = {
        query: jest.fn().mockRejectedValue(new Error("Query failed")),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      // Act & Assert
      await expect(service.query(connectionName, sql, params)).rejects.toThrow(
        "执行查询失败",
      );
    });
  });

  describe("batchInsert", () => {
    it("should execute batch insert successfully", async () => {
      // Arrange
      const connectionName = "test-db";
      const table = "users";
      const data = [{ name: "user1" }, { name: "user2" }];
      const options = { batchSize: 100 };
      const mockConnection = {
        batchInsert: jest.fn().mockResolvedValue({ data: 2 }),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      // Act
      const result = await service.batchInsert(
        connectionName,
        table,
        data,
        options,
      );

      // Assert
      expect(mockConnectionManager.getConnection).toHaveBeenCalledWith(
        connectionName,
      );
      expect(mockConnection.batchInsert).toHaveBeenCalledWith(
        table,
        data,
        options,
      );
      expect(result).toBe(2);
    });

    it("should throw _error on batch insert failure", async () => {
      // Arrange
      const connectionName = "test-db";
      const table = "users";
      const data = [{ name: "user1" }];
      const mockConnection = {
        batchInsert: jest
          .fn()
          .mockRejectedValue(new Error("Batch insert failed")),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      // Act & Assert
      await expect(
        service.batchInsert(connectionName, table, data),
      ).rejects.toThrow("批量插入失败");
    });
  });

  describe("batchUpdate", () => {
    it("should execute batch update successfully", async () => {
      // Arrange
      const connectionName = "test-db";
      const table = "users";
      const data = [{ id: 1, name: "user1" }];
      const where = { status: "active" };
      const mockConnection = {
        batchUpdate: jest.fn().mockResolvedValue({ data: 1 }),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      // Act
      const result = await service.batchUpdate(
        connectionName,
        table,
        data,
        where,
      );

      // Assert
      expect(mockConnectionManager.getConnection).toHaveBeenCalledWith(
        connectionName,
      );
      expect(mockConnection.batchUpdate).toHaveBeenCalledWith(
        table,
        data,
        where,
      );
      expect(result).toBe(1);
    });

    it("should throw _error on batch update failure", async () => {
      // Arrange
      const connectionName = "test-db";
      const table = "users";
      const data = [{ id: 1, name: "user1" }];
      const where = { status: "active" };
      const mockConnection = {
        batchUpdate: jest
          .fn()
          .mockRejectedValue(new Error("Batch update failed")),
      };

      mockConnectionManager.getConnection.mockResolvedValue(mockConnection);

      // Act & Assert
      await expect(
        service.batchUpdate(connectionName, table, data, where),
      ).rejects.toThrow("批量更新失败");
    });
  });
});
