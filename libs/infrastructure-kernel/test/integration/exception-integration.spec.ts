/**
 * 异常系统集成测试
 *
 * @description 测试 libs/infrastructure-kernel 与 libs/exceptions 的集成
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { InfrastructureExceptionConverter } from "../../src/exceptions/infrastructure-exception.mapping.js";
import { EnhancedErrorHandlerService } from "../../src/services/error-handling/enhanced-error-handler.service.js";
import { DatabaseService } from "../../src/services/database/database-service.js";
import { ReadModelRepositoryAdapter } from "../../src/repositories/read-model/read-model-repository-adapter.js";
import {
  AbstractHttpException,
  GeneralInternalServerException,
  ExternalServiceUnavailableException,
} from "@hl8/exceptions";

describe("Exception Integration", () => {
  let module: TestingModule;
  let enhancedErrorHandler: EnhancedErrorHandlerService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        EnhancedErrorHandlerService,
        {
          provide: "ErrorHandlerService",
          useValue: {
            handleError: jest.fn().mockResolvedValue({
              success: true,
              error: null,
              recovery: null,
              processingTime: 100,
            }),
          },
        },
      ],
    }).compile();

    enhancedErrorHandler = module.get<EnhancedErrorHandlerService>(
      EnhancedErrorHandlerService,
    );
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe("InfrastructureExceptionConverter", () => {
    it("should convert database errors to standardized exceptions", () => {
      const error = new Error("Database connection failed");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          error,
          "DATABASE",
          { operation: "connect" },
        );

      expect(exception).toBeInstanceOf(GeneralInternalServerException);
      expect(exception.getStatus()).toBe(500);
    });

    it("should convert network errors to standardized exceptions", () => {
      const error = new Error("Network timeout");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          error,
          "NETWORK",
          { endpoint: "https://api.example.com" },
        );

      expect(exception).toBeInstanceOf(ExternalServiceUnavailableException);
      expect(exception.getStatus()).toBe(503);
    });

    it("should convert isolation errors to standardized exceptions", () => {
      const error = new Error("Tenant isolation violation");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          error,
          "ISOLATION",
          { tenantId: "tenant-123" },
        );

      expect(exception).toBeInstanceOf(GeneralInternalServerException);
      expect(exception.getStatus()).toBe(403);
    });

    it("should determine exception class based on severity", () => {
      const exceptionClass =
        InfrastructureExceptionConverter.determineExceptionClass(
          "DATABASE",
          "CRITICAL",
        );

      expect(exceptionClass).toBe(GeneralInternalServerException);
    });

    it("should infer error type from error message", () => {
      const error = new Error("Database connection timeout");
      const errorType = InfrastructureExceptionConverter.inferErrorType(error);

      expect(errorType).toBe("DATABASE");
    });

    it("should check if error is infrastructure error", () => {
      const infrastructureError = new Error("Database connection failed");
      const businessError = new Error("User not found");

      expect(
        InfrastructureExceptionConverter.isInfrastructureError(
          infrastructureError,
        ),
      ).toBe(true);
      expect(
        InfrastructureExceptionConverter.isInfrastructureError(businessError),
      ).toBe(false);
    });
  });

  describe("EnhancedErrorHandlerService", () => {
    it("should handle infrastructure errors", async () => {
      const error = new Error("Database connection failed");
      const result = await enhancedErrorHandler.handleError(error, {
        operation: "connect",
      });

      expect(result.success).toBeDefined();
    });

    it("should handle batch errors", async () => {
      const errors = [
        {
          error: new Error("Database error"),
          type: "DATABASE" as const,
          context: { operation: "connect" },
        },
        {
          error: new Error("Network error"),
          type: "NETWORK" as const,
          context: { endpoint: "api.example.com" },
        },
      ];

      const results = await enhancedErrorHandler.handleBatchErrors(errors);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
    });

    it("should log standard exceptions", async () => {
      const exception = new GeneralInternalServerException(
        "Test error",
        "Test detail",
        { test: "data" },
      );

      await enhancedErrorHandler.handleError(exception, { context: "test" });

      // 验证错误被正确处理
      expect(exception.getStatus()).toBe(500);
    });
  });

  describe("DatabaseService Integration", () => {
    it("should throw standardized exceptions for database connection failures", async () => {
      const mockConnectionManager = {
        getConnection: jest
          .fn()
          .mockRejectedValue(new Error("Connection failed")),
      };

      const dbService = new DatabaseService(mockConnectionManager as any);

      await expect(dbService.getConnection("test-db")).rejects.toThrow(
        GeneralInternalServerException,
      );
    });

    it("should throw standardized exceptions for database creation failures", async () => {
      const mockConnectionManager = {
        createConnection: jest
          .fn()
          .mockRejectedValue(new Error("Creation failed")),
      };

      const dbService = new DatabaseService(mockConnectionManager as any);

      await expect(
        dbService.createConnection("test-db", {} as any),
      ).rejects.toThrow(GeneralInternalServerException);
    });

    it("should throw standardized exceptions for database close failures", async () => {
      const mockConnectionManager = {
        closeConnection: jest.fn().mockRejectedValue(new Error("Close failed")),
      };

      const dbService = new DatabaseService(mockConnectionManager as any);

      await expect(dbService.closeConnection("test-db")).rejects.toThrow(
        GeneralInternalServerException,
      );
    });
  });

  describe("ReadModelRepositoryAdapter Integration", () => {
    it("should throw standardized exceptions for query failures", async () => {
      const mockDatabaseAdapter = {
        getRepository: jest.fn().mockReturnValue({
          find: jest.fn().mockRejectedValue(new Error("Query failed")),
        }),
      };

      const mockCacheService = {
        get: jest.fn(),
        set: jest.fn(),
      };

      const adapter = new ReadModelRepositoryAdapter(
        mockDatabaseAdapter,

        mockCacheService as any,
      );

      await expect(adapter.findByQuery({} as any)).rejects.toThrow(
        GeneralInternalServerException,
      );
    });

    it("should throw standardized exceptions for findById failures", async () => {
      const mockDatabaseAdapter = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockRejectedValue(new Error("Find failed")),
        }),
      };

      const mockCacheService = {
        get: jest.fn(),
        set: jest.fn(),
      };

      const adapter = new ReadModelRepositoryAdapter(
        mockDatabaseAdapter,

        mockCacheService as any,
      );

      await expect(adapter.findById("test-id")).rejects.toThrow(
        GeneralInternalServerException,
      );
    });
  });

  describe("Error Type Mapping", () => {
    it("should map DATABASE errors correctly", () => {
      const error = new Error("Database connection failed");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          error,
          "DATABASE",
        );

      expect(exception).toBeInstanceOf(GeneralInternalServerException);
      expect(exception.getStatus()).toBe(500);
    });

    it("should map CACHE errors correctly", () => {
      const error = new Error("Cache operation failed");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          error,
          "CACHE",
        );

      expect(exception).toBeInstanceOf(GeneralInternalServerException);
      expect(exception.getStatus()).toBe(500);
    });

    it("should map NETWORK errors correctly", () => {
      const error = new Error("Network timeout");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          error,
          "NETWORK",
        );

      expect(exception).toBeInstanceOf(ExternalServiceUnavailableException);
      expect(exception.getStatus()).toBe(503);
    });

    it("should map ISOLATION errors correctly", () => {
      const error = new Error("Tenant isolation violation");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          error,
          "ISOLATION",
        );

      expect(exception).toBeInstanceOf(GeneralInternalServerException);
      expect(exception.getStatus()).toBe(403);
    });

    it("should map SYSTEM errors correctly", () => {
      const error = new Error("System internal error");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          error,
          "SYSTEM",
        );

      expect(exception).toBeInstanceOf(GeneralInternalServerException);
      expect(exception.getStatus()).toBe(500);
    });

    it("should map INTEGRATION errors correctly", () => {
      const error = new Error("Integration service error");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          error,
          "INTEGRATION",
        );

      expect(exception).toBeInstanceOf(ExternalServiceUnavailableException);
      expect(exception.getStatus()).toBe(502);
    });

    it("should map VALIDATION errors correctly", () => {
      const error = new Error("Validation failed");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          error,
          "VALIDATION",
        );

      expect(exception).toBeInstanceOf(GeneralInternalServerException);
      expect(exception.getStatus()).toBe(400);
    });

    it("should map UNKNOWN errors correctly", () => {
      const error = new Error("Unknown error");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          error,
          "UNKNOWN",
        );

      expect(exception).toBeInstanceOf(GeneralInternalServerException);
      expect(exception.getStatus()).toBe(500);
    });
  });

  describe("Context and Data Handling", () => {
    it("should include context data in exception", () => {
      const error = new Error("Test error");
      const context = { operation: "test", userId: "user-123" };

      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          error,
          "DATABASE",
          context,
        );

      expect(exception.data).toEqual(
        expect.objectContaining({
          originalError: "Test error",
          errorType: "DATABASE",
          operation: "test",
          userId: "user-123",
        }),
      );
    });

    it("should build appropriate error messages", () => {
      const error = new Error("Database connection failed");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          error,
          "DATABASE",
          { operation: "connect" },
        );

      expect(exception.title).toBe("数据库操作失败");
      expect(exception.detail).toContain("数据库操作失败");
      expect(exception.detail).toContain("Database connection failed");
    });

    it("should build appropriate error details with context", () => {
      const error = new Error("Cache operation failed");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          error,
          "CACHE",
          { cacheKey: "user:123" },
        );

      expect(exception.detail).toContain("缓存操作失败");
      expect(exception.detail).toContain("Cache operation failed");
      expect(exception.detail).toContain("缓存键: user:123");
    });
  });
});
