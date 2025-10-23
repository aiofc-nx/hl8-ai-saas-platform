/**
 * 基础设施层异常映射单元测试
 *
 * @description 测试 InfrastructureExceptionConverter 的核心功能
 * @since 1.0.0
 */

import {
  InfrastructureExceptionConverter,
  INFRASTRUCTURE_EXCEPTION_MAPPING,
} from "../../src/exceptions/infrastructure-exception.mapping.js";
import {
  GeneralInternalServerException,
  GeneralBadRequestException,
  ExternalServiceUnavailableException,
} from "@hl8/exceptions";

describe("InfrastructureExceptionConverter", () => {
  describe("convertToStandardException", () => {
    it("should convert database errors correctly", () => {
      const _error = new Error("Database connection failed");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          _error,
          "DATABASE",
          { operation: "connect", host: "localhost" },
        );

      expect(exception).toBeInstanceOf(GeneralInternalServerException);
      expect(exception.getStatus()).toBe(500);
      expect(exception.title).toBe("数据库操作失败");
      expect(exception.detail).toContain("数据库操作失败");
      expect(exception.detail).toContain("Database connection failed");
      expect(exception.data).toEqual(
        expect.objectContaining({
          originalError: "Database connection failed",
          errorType: "DATABASE",
          operation: "connect",
          host: "localhost",
        }),
      );
    });

    it("should convert cache errors correctly", () => {
      const _error = new Error("Redis connection timeout");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          _error,
          "CACHE",
          { cacheKey: "user:123", operation: "get" },
        );

      expect(exception).toBeInstanceOf(GeneralInternalServerException);
      expect(exception.getStatus()).toBe(500);
      expect(exception.title).toBe("缓存操作失败");
      expect(exception.detail).toContain("缓存键: user:123");
    });

    it("should convert network errors correctly", () => {
      const _error = new Error("Connection timeout");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          _error,
          "NETWORK",
          { endpoint: "https://api.example.com", timeout: 5000 },
        );

      expect(exception).toBeInstanceOf(ExternalServiceUnavailableException);
      expect(exception.getStatus()).toBe(503);
      expect(exception.title).toBe("外部服务不可用");
      expect(exception.detail).toContain("端点: https://api.example.com");
    });

    it("should convert isolation errors correctly", () => {
      const _error = new Error("Tenant access denied");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          _error,
          "ISOLATION",
          { tenantId: "tenant-123", userId: "user-456" },
        );

      expect(exception).toBeInstanceOf(GeneralBadRequestException);
      expect(exception.getStatus()).toBe(400);
      expect(exception.title).toBe("数据隔离违规");
      expect(exception.detail).toContain("租户: tenant-123");
    });

    it("should convert system errors correctly", () => {
      const _error = new Error("System resource exhausted");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          _error,
          "SYSTEM",
          { resource: "memory", usage: "95%" },
        );

      expect(exception).toBeInstanceOf(GeneralInternalServerException);
      expect(exception.getStatus()).toBe(500);
      expect(exception.title).toBe("系统内部错误");
    });

    it("should convert integration errors correctly", () => {
      const _error = new Error("External service unavailable");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          _error,
          "INTEGRATION",
          { serviceName: "payment-service", version: "v1.0" },
        );

      expect(exception).toBeInstanceOf(ExternalServiceUnavailableException);
      expect(exception.getStatus()).toBe(503);
      expect(exception.title).toBe("外部服务不可用");
      expect(exception.detail).toContain("服务: payment-service");
    });

    it("should convert validation errors correctly", () => {
      const _error = new Error("Invalid input data");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          _error,
          "VALIDATION",
          { field: "email", value: "invalid-email" },
        );

      expect(exception).toBeInstanceOf(GeneralBadRequestException);
      expect(exception.getStatus()).toBe(400);
      expect(exception.title).toBe("数据验证失败");
    });

    it("should convert unknown errors correctly", () => {
      const _error = new Error("Unexpected _error occurred");
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          _error,
          "UNKNOWN",
        );

      expect(exception).toBeInstanceOf(GeneralInternalServerException);
      expect(exception.getStatus()).toBe(500);
      expect(exception.title).toBe("未知基础设施错误");
    });
  });

  describe("determineExceptionClass", () => {
    it("should return critical exception for CRITICAL severity", () => {
      const exceptionClass =
        InfrastructureExceptionConverter.determineExceptionClass(
          "DATABASE",
          "CRITICAL",
        );

      expect(exceptionClass).toBe(GeneralInternalServerException);
    });

    it("should return mapping exception for HIGH severity", () => {
      const exceptionClass =
        InfrastructureExceptionConverter.determineExceptionClass(
          "NETWORK",
          "HIGH",
        );

      expect(exceptionClass).toBe(ExternalServiceUnavailableException);
    });

    it("should return mapping exception for MEDIUM severity", () => {
      const exceptionClass =
        InfrastructureExceptionConverter.determineExceptionClass(
          "ISOLATION",
          "MEDIUM",
        );

      expect(exceptionClass).toBe(GeneralBadRequestException);
    });

    it("should return bad request exception for LOW severity", () => {
      const exceptionClass =
        InfrastructureExceptionConverter.determineExceptionClass(
          "DATABASE",
          "LOW",
        );

      expect(exceptionClass).toBe(GeneralBadRequestException);
    });

    it("should default to mapping exception for unknown severity", () => {
      const exceptionClass =
        InfrastructureExceptionConverter.determineExceptionClass(
          "DATABASE",
          "UNKNOWN" as any,
        );

      expect(exceptionClass).toBe(GeneralInternalServerException);
    });
  });

  describe("inferErrorType", () => {
    it("should infer DATABASE type from database-related messages", () => {
      const testCases = [
        "Database connection failed",
        "Connection timeout to PostgreSQL",
        "Database query execution _error",
        "Connection pool exhausted",
      ];

      testCases.forEach((message) => {
        const _error = new Error(message);
        const errorType =
          InfrastructureExceptionConverter.inferErrorType(_error);
        expect(errorType).toBe("DATABASE");
      });
    });

    it("should infer CACHE type from cache-related messages", () => {
      const testCases = ["Cache operation timeout", "Cache unavailable"];

      testCases.forEach((message) => {
        const _error = new Error(message);
        const errorType =
          InfrastructureExceptionConverter.inferErrorType(_error);
        expect(errorType).toBe("CACHE");
      });
    });

    it("should infer NETWORK type from network-related messages", () => {
      const testCases = ["Network timeout", "Timeout occurred"];

      testCases.forEach((message) => {
        const _error = new Error(message);
        const errorType =
          InfrastructureExceptionConverter.inferErrorType(_error);
        expect(errorType).toBe("NETWORK");
      });
    });

    it("should infer ISOLATION type from isolation-related messages", () => {
      const testCases = ["Tenant isolation violation", "Tenant access denied"];

      testCases.forEach((message) => {
        const _error = new Error(message);
        const errorType =
          InfrastructureExceptionConverter.inferErrorType(_error);
        expect(errorType).toBe("ISOLATION");
      });
    });

    it("should infer VALIDATION type from validation-related messages", () => {
      const testCases = [
        "Validation failed",
        "Invalid input data",
        "Schema validation _error",
      ];

      testCases.forEach((message) => {
        const _error = new Error(message);
        const errorType =
          InfrastructureExceptionConverter.inferErrorType(_error);
        expect(errorType).toBe("VALIDATION");
      });
    });

    it("should infer INTEGRATION type from integration-related messages", () => {
      const testCases = [
        "External service _error",
        "Integration service _error",
      ];

      testCases.forEach((message) => {
        const _error = new Error(message);
        const errorType =
          InfrastructureExceptionConverter.inferErrorType(_error);
        expect(errorType).toBe("INTEGRATION");
      });
    });

    it("should infer SYSTEM type from system-related messages", () => {
      const testCases = [
        "System internal _error",
        "Internal server _error",
        "System resource exhausted",
      ];

      testCases.forEach((message) => {
        const _error = new Error(message);
        const errorType =
          InfrastructureExceptionConverter.inferErrorType(_error);
        expect(errorType).toBe("SYSTEM");
      });
    });

    it("should default to UNKNOWN for unrecognized messages", () => {
      const _error = new Error("Some random _error message");
      const errorType = InfrastructureExceptionConverter.inferErrorType(_error);
      expect(errorType).toBe("UNKNOWN");
    });
  });

  describe("isInfrastructureError", () => {
    it("should return true for infrastructure-related errors", () => {
      const testCases = [
        "Database connection failed",
        "Network timeout occurred",
        "Cache operation failed",
        "Infrastructure service unavailable",
        "Isolation boundary violation",
      ];

      testCases.forEach((message) => {
        const _error = new Error(message);
        const isInfra =
          InfrastructureExceptionConverter.isInfrastructureError(_error);
        expect(isInfra).toBe(true);
      });
    });

    it("should return false for business logic errors", () => {
      const testCases = [
        "User not found",
        "Invalid business rule",
        "Permission denied",
        "Business logic _error",
        "User authentication failed",
      ];

      testCases.forEach((message) => {
        const _error = new Error(message);
        const isInfra =
          InfrastructureExceptionConverter.isInfrastructureError(_error);
        expect(isInfra).toBe(false);
      });
    });
  });

  describe("INFRASTRUCTURE_EXCEPTION_MAPPING", () => {
    it("should have correct mapping for all _error types", () => {
      const expectedMappings = {
        DATABASE: {
          exceptionClass: GeneralInternalServerException,
          httpStatus: 500,
          errorCode: "INFRA_DATABASE_ERROR",
        },
        CACHE: {
          exceptionClass: GeneralInternalServerException,
          httpStatus: 500,
          errorCode: "INFRA_CACHE_ERROR",
        },
        NETWORK: {
          exceptionClass: ExternalServiceUnavailableException,
          httpStatus: 503,
          errorCode: "INFRA_NETWORK_ERROR",
        },
        ISOLATION: {
          exceptionClass: GeneralBadRequestException,
          httpStatus: 403,
          errorCode: "INFRA_ISOLATION_ERROR",
        },
        SYSTEM: {
          exceptionClass: GeneralInternalServerException,
          httpStatus: 500,
          errorCode: "INFRA_SYSTEM_ERROR",
        },
        INTEGRATION: {
          exceptionClass: ExternalServiceUnavailableException,
          httpStatus: 502,
          errorCode: "INFRA_INTEGRATION_ERROR",
        },
        VALIDATION: {
          exceptionClass: GeneralBadRequestException,
          httpStatus: 400,
          errorCode: "INFRA_VALIDATION_ERROR",
        },
        UNKNOWN: {
          exceptionClass: GeneralInternalServerException,
          httpStatus: 500,
          errorCode: "INFRA_UNKNOWN_ERROR",
        },
      };

      Object.entries(expectedMappings).forEach(([errorType, expected]) => {
        const mapping =
          INFRASTRUCTURE_EXCEPTION_MAPPING[
            errorType as keyof typeof INFRASTRUCTURE_EXCEPTION_MAPPING
          ];
        expect(mapping.errorType).toBe(errorType);
        expect(mapping.exceptionClass).toBe(expected.exceptionClass);
        expect(mapping.httpStatus).toBe(expected.httpStatus);
        expect(mapping.errorCode).toBe(expected.errorCode);
      });
    });
  });
});
