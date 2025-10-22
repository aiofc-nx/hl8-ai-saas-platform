/**
 * @fileoverview Response Formatter 工具单元测试
 * @description 测试响应格式化工具的所有功能
 */

import { ResponseFormatter } from "./response-formatter.util";
import type { ResponseMeta, PaginationMeta } from "../types/index";

describe("ResponseFormatter", () => {
  describe("success", () => {
    it("should format success response with data", () => {
      const data = { id: "123", name: "Test" };
      const result = ResponseFormatter.success(data);

      expect(result.success).toBe(true);
      expect(result.data).toBe(data);
      expect(result.meta).toBeDefined();
      expect(result.meta?.timestamp).toBeDefined();
      expect(result.meta?.requestId).toBeDefined();
      expect(result.meta?.version).toBe("1.0.0");
    });

    it("should format success response with custom meta", () => {
      const data = { id: "123", name: "Test" };
      const customMeta: Partial<ResponseMeta> = {
        requestId: "custom-request-id",
        version: "2.0.0",
      };

      const result = ResponseFormatter.success(data, customMeta);

      expect(result.success).toBe(true);
      expect(result.data).toBe(data);
      expect(result.meta?.requestId).toBe("custom-request-id");
      expect(result.meta?.version).toBe("2.0.0");
    });

    it("should format success response without data", () => {
      const result = ResponseFormatter.success(null);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.meta).toBeDefined();
    });
  });

  describe("error", () => {
    it("should format error response with code and message", () => {
      const result = ResponseFormatter.error(
        "VALIDATION_ERROR",
        "Invalid input",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("VALIDATION_ERROR");
      expect(result.error?.message).toBe("Invalid input");
      expect(result.error?.timestamp).toBeDefined();
      expect(result.meta).toBeDefined();
    });

    it("should format error response with details", () => {
      const details = { field: "email", reason: "Invalid format" };
      const result = ResponseFormatter.error(
        "VALIDATION_ERROR",
        "Invalid input",
        details,
      );

      expect(result.success).toBe(false);
      expect(result.error?.details).toBe(details);
    });

    it("should format error response with custom meta", () => {
      const customMeta: Partial<ResponseMeta> = {
        requestId: "error-request-id",
      };

      const result = ResponseFormatter.error(
        "ERROR",
        "Test error",
        undefined,
        customMeta,
      );

      expect(result.success).toBe(false);
      expect(result.meta?.requestId).toBe("error-request-id");
    });
  });

  describe("paginated", () => {
    it("should format paginated response", () => {
      const data = [
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ];
      const pagination: PaginationMeta = {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      };

      const result = ResponseFormatter.paginated(data, pagination);

      expect(result.success).toBe(true);
      expect(result.data).toBe(data);
      expect(result.meta?.pagination).toBe(pagination);
    });

    it("should format paginated response with custom meta", () => {
      const data = [{ id: "1" }];
      const pagination: PaginationMeta = {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
      const customMeta: Partial<ResponseMeta> = {
        requestId: "paginated-request-id",
      };

      const result = ResponseFormatter.paginated(data, pagination, customMeta);

      expect(result.success).toBe(true);
      expect(result.meta?.requestId).toBe("paginated-request-id");
      expect(result.meta?.pagination).toBe(pagination);
    });
  });

  describe("validationError", () => {
    it("should format validation error response", () => {
      const errors = ["Email is required", "Password is too short"];
      const result = ResponseFormatter.validationError(errors);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
      expect(result.error?.message).toBe("Data validation failed");
      expect(result.error?.details?.errors).toBe(errors);
    });

    it("should format validation error with custom meta", () => {
      const errors = ["Field is required"];
      const customMeta: Partial<ResponseMeta> = {
        requestId: "validation-request-id",
      };

      const result = ResponseFormatter.validationError(errors, customMeta);

      expect(result.success).toBe(false);
      expect(result.meta?.requestId).toBe("validation-request-id");
    });
  });

  describe("authenticationError", () => {
    it("should format authentication error with default message", () => {
      const result = ResponseFormatter.authenticationError();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("UNAUTHORIZED");
      expect(result.error?.message).toBe("Authentication required");
    });

    it("should format authentication error with custom message", () => {
      const message = "Invalid token";
      const result = ResponseFormatter.authenticationError(message);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("UNAUTHORIZED");
      expect(result.error?.message).toBe(message);
    });

    it("should format authentication error with custom meta", () => {
      const customMeta: Partial<ResponseMeta> = {
        requestId: "auth-request-id",
      };

      const result = ResponseFormatter.authenticationError(
        "Custom auth error",
        customMeta,
      );

      expect(result.success).toBe(false);
      expect(result.meta?.requestId).toBe("auth-request-id");
    });
  });

  describe("authorizationError", () => {
    it("should format authorization error with default message", () => {
      const result = ResponseFormatter.authorizationError();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("FORBIDDEN");
      expect(result.error?.message).toBe("Insufficient permissions");
    });

    it("should format authorization error with custom message", () => {
      const message = "Access denied";
      const result = ResponseFormatter.authorizationError(message);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("FORBIDDEN");
      expect(result.error?.message).toBe(message);
    });
  });

  describe("rateLimitError", () => {
    it("should format rate limit error with default message", () => {
      const result = ResponseFormatter.rateLimitError();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("RATE_LIMIT_EXCEEDED");
      expect(result.error?.message).toBe("Too many requests");
    });

    it("should format rate limit error with custom message", () => {
      const message = "Rate limit exceeded for this endpoint";
      const result = ResponseFormatter.rateLimitError(message);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("RATE_LIMIT_EXCEEDED");
      expect(result.error?.message).toBe(message);
    });
  });

  describe("internalError", () => {
    it("should format internal error with default message", () => {
      const result = ResponseFormatter.internalError();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INTERNAL_ERROR");
      expect(result.error?.message).toBe("Internal server error");
    });

    it("should format internal error with custom message", () => {
      const message = "Database connection failed";
      const result = ResponseFormatter.internalError(message);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INTERNAL_ERROR");
      expect(result.error?.message).toBe(message);
    });
  });

  describe("notFoundError", () => {
    it("should format not found error with default message", () => {
      const result = ResponseFormatter.notFoundError();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("NOT_FOUND");
      expect(result.error?.message).toBe("Resource not found");
    });

    it("should format not found error with custom message", () => {
      const message = "User not found";
      const result = ResponseFormatter.notFoundError(message);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("NOT_FOUND");
      expect(result.error?.message).toBe(message);
    });
  });

  describe("calculatePagination", () => {
    it("should calculate pagination correctly", () => {
      const pagination = ResponseFormatter.calculatePagination(2, 10, 25);

      expect(pagination.page).toBe(2);
      expect(pagination.limit).toBe(10);
      expect(pagination.total).toBe(25);
      expect(pagination.totalPages).toBe(3);
      expect(pagination.hasNext).toBe(true);
      expect(pagination.hasPrev).toBe(true);
    });

    it("should calculate pagination for first page", () => {
      const pagination = ResponseFormatter.calculatePagination(1, 10, 25);

      expect(pagination.page).toBe(1);
      expect(pagination.hasNext).toBe(true);
      expect(pagination.hasPrev).toBe(false);
    });

    it("should calculate pagination for last page", () => {
      const pagination = ResponseFormatter.calculatePagination(3, 10, 25);

      expect(pagination.page).toBe(3);
      expect(pagination.hasNext).toBe(false);
      expect(pagination.hasPrev).toBe(true);
    });

    it("should calculate pagination for single page", () => {
      const pagination = ResponseFormatter.calculatePagination(1, 10, 5);

      expect(pagination.page).toBe(1);
      expect(pagination.totalPages).toBe(1);
      expect(pagination.hasNext).toBe(false);
      expect(pagination.hasPrev).toBe(false);
    });

    it("should calculate pagination for empty results", () => {
      const pagination = ResponseFormatter.calculatePagination(1, 10, 0);

      expect(pagination.page).toBe(1);
      expect(pagination.total).toBe(0);
      expect(pagination.totalPages).toBe(0);
      expect(pagination.hasNext).toBe(false);
      expect(pagination.hasPrev).toBe(false);
    });
  });

  describe("healthCheck", () => {
    it("should format health check response for healthy status", () => {
      const health = {
        status: "healthy",
        services: [
          { name: "database", status: "healthy" },
          { name: "redis", status: "healthy" },
        ],
      };

      const result = ResponseFormatter.healthCheck(health);

      expect(result.success).toBe(true);
      expect(result.data).toBe(health);
    });

    it("should format health check response for degraded status", () => {
      const health = {
        status: "degraded",
        services: [
          { name: "database", status: "healthy" },
          { name: "redis", status: "unhealthy" },
        ],
      };

      const result = ResponseFormatter.healthCheck(health);

      expect(result.success).toBe(true);
      expect(result.data).toBe(health);
    });

    it("should format health check response for unhealthy status", () => {
      const health = {
        status: "unhealthy",
        services: [
          { name: "database", status: "unhealthy" },
          { name: "redis", status: "unhealthy" },
        ],
      };

      const result = ResponseFormatter.healthCheck(health);

      expect(result.success).toBe(false);
      expect(result.data).toBe(health);
    });
  });

  describe("metrics", () => {
    it("should format metrics response", () => {
      const metrics = {
        requestCount: 1000,
        responseTime: 150,
        errorCount: 5,
      };

      const result = ResponseFormatter.metrics(metrics);

      expect(result.success).toBe(true);
      expect(result.data).toBe(metrics);
    });

    it("should format metrics response with complex data", () => {
      const metrics = {
        performance: {
          cpu: 75.5,
          memory: 1024,
        },
        requests: {
          total: 1000,
          successful: 995,
          failed: 5,
        },
      };

      const result = ResponseFormatter.metrics(metrics);

      expect(result.success).toBe(true);
      expect(result.data).toBe(metrics);
    });
  });

  describe("request ID generation", () => {
    it("should generate unique request IDs", () => {
      const result1 = ResponseFormatter.success({});
      const result2 = ResponseFormatter.success({});

      expect(result1.meta?.requestId).toBeDefined();
      expect(result2.meta?.requestId).toBeDefined();
      expect(result1.meta?.requestId).not.toBe(result2.meta?.requestId);
    });

    it("should generate request IDs with correct format", () => {
      const result = ResponseFormatter.success({});
      const requestId = result.meta?.requestId;

      expect(requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });
  });

  describe("timestamp generation", () => {
    it("should generate valid timestamps", () => {
      const result = ResponseFormatter.success({});
      const timestamp = result.meta?.timestamp;

      expect(timestamp).toBeDefined();
      expect(new Date(timestamp).getTime()).not.toBeNaN();
    });

    it("should generate recent timestamps", () => {
      const before = new Date().getTime();
      const result = ResponseFormatter.success({});
      const after = new Date().getTime();
      const timestamp = new Date(result.meta?.timestamp || "").getTime();

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe("edge cases", () => {
    it("should handle null data gracefully", () => {
      const result = ResponseFormatter.success(null);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should handle undefined data gracefully", () => {
      const result = ResponseFormatter.success(undefined);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it("should handle empty arrays gracefully", () => {
      const result = ResponseFormatter.success([]);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should handle empty objects gracefully", () => {
      const result = ResponseFormatter.success({});

      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
    });

    it("should handle large data gracefully", () => {
      const largeData = Array(1000)
        .fill(null)
        .map((_, i) => ({ id: i, data: "test" }));
      const result = ResponseFormatter.success(largeData);

      expect(result.success).toBe(true);
      expect(result.data).toBe(largeData);
    });

    it("should handle special characters in error messages", () => {
      const message = "Error with special chars: !@#$%^&*()";
      const result = ResponseFormatter.error("TEST_ERROR", message);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe(message);
    });

    it("should handle unicode characters in data", () => {
      const data = { message: "Hello 世界 🌍" };
      const result = ResponseFormatter.success(data);

      expect(result.success).toBe(true);
      expect(result.data).toBe(data);
    });
  });
});
