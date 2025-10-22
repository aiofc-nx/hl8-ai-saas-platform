/**
 * @fileoverview Error Handler 工具单元测试
 * @description 测试错误处理工具的所有功能
 */

import { ErrorHandler } from "./error-handler.util";
import type { ApiResponse } from "../types/index";

describe("ErrorHandler", () => {
  describe("handleError", () => {
    it("should handle ValidationError", () => {
      const error = new Error("Validation failed");
      error.name = "ValidationError";
      (error as any).errors = ["Email is required", "Password is too short"];
      (error as any).field = "email";
      (error as any).value = "invalid-email";

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
      expect(result.error?.message).toBe("Data validation failed");
      expect(result.error?.details?.errors).toEqual([
        "Email is required",
        "Password is too short",
      ]);
      expect(result.error?.details?.field).toBe("email");
      expect(result.error?.details?.value).toBe("invalid-email");
    });

    it("should handle UnauthorizedError", () => {
      const error = new Error("Authentication failed");
      error.name = "UnauthorizedError";
      (error as any).reason = "Invalid token";
      (error as any).token = "expired-token";

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("UNAUTHORIZED");
      expect(result.error?.message).toBe("Authentication failed");
      expect(result.error?.details?.reason).toBe("Invalid token");
      expect(result.error?.details?.token).toBe("present");
    });

    it("should handle ForbiddenError", () => {
      const error = new Error("Access denied");
      error.name = "ForbiddenError";
      (error as any).resource = "users";
      (error as any).action = "delete";
      (error as any).requiredPermissions = ["admin"];

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("FORBIDDEN");
      expect(result.error?.message).toBe("Access denied");
      expect(result.error?.details?.resource).toBe("users");
      expect(result.error?.details?.action).toBe("delete");
      expect(result.error?.details?.requiredPermissions).toEqual(["admin"]);
    });

    it("should handle NotFoundError", () => {
      const error = new Error("User not found");
      error.name = "NotFoundError";
      (error as any).resource = "User";
      (error as any).id = "user-123";

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("NOT_FOUND");
      expect(result.error?.message).toBe("User not found");
      expect(result.error?.details?.resource).toBe("User");
      expect(result.error?.details?.id).toBe("user-123");
    });

    it("should handle RateLimitError", () => {
      const error = new Error("Rate limit exceeded");
      error.name = "RateLimitError";
      (error as any).limit = 100;
      (error as any).remaining = 0;
      (error as any).resetTime = Date.now() + 60000;

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("RATE_LIMIT_EXCEEDED");
      expect(result.error?.message).toBe("Rate limit exceeded");
      expect(result.error?.details?.limit).toBe(100);
      expect(result.error?.details?.remaining).toBe(0);
      expect(result.error?.details?.resetTime).toBeDefined();
    });

    it("should handle TimeoutError", () => {
      const error = new Error("Request timeout");
      error.name = "TimeoutError";
      (error as any).timeout = 5000;
      (error as any).operation = "database_query";

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TIMEOUT");
      expect(result.error?.message).toBe("Request timeout");
      expect(result.error?.details?.timeout).toBe(5000);
      expect(result.error?.details?.operation).toBe("database_query");
    });

    it("should handle DatabaseError", () => {
      const error = new Error("Database connection failed");
      error.name = "DatabaseError";
      (error as any).operation = "SELECT";
      (error as any).table = "users";
      (error as any).constraint = "unique_email";

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DATABASE_ERROR");
      expect(result.error?.message).toBe("Database operation failed");
      expect(result.error?.details?.operation).toBe("SELECT");
      expect(result.error?.details?.table).toBe("users");
      expect(result.error?.details?.constraint).toBe("unique_email");
    });

    it("should handle NetworkError", () => {
      const error = new Error("Network request failed");
      error.name = "NetworkError";
      (error as any).url = "https://api.example.com";
      (error as any).method = "GET";
      (error as any).statusCode = 500;

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("NETWORK_ERROR");
      expect(result.error?.message).toBe("Network request failed");
      expect(result.error?.details?.url).toBe("https://api.example.com");
      expect(result.error?.details?.method).toBe("GET");
      expect(result.error?.details?.statusCode).toBe(500);
    });

    it("should handle unknown errors as internal errors", () => {
      const error = new Error("Unknown error");
      error.name = "UnknownError";

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INTERNAL_ERROR");
      expect(result.error?.message).toBe("Internal server error");
      expect(result.error?.details?.type).toBe("UnknownError");
      expect(result.error?.details?.message).toBe("Unknown error");
    });

    it("should handle errors with context", () => {
      const error = new Error("Test error");
      const context = { userId: "user-123", action: "test" };

      const result = ErrorHandler.handleError(error, context);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INTERNAL_ERROR");
    });

    it("should handle handler errors gracefully", () => {
      const error = null as any;

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("HANDLER_ERROR");
      expect(result.error?.message).toBe("Error handler failed");
    });
  });

  describe("logError", () => {
    it("should log error without throwing", () => {
      const error = new Error("Test error");
      const context = { userId: "user-123" };

      expect(() => {
        ErrorHandler.logError(error, context);
      }).not.toThrow();
    });

    it("should log error without context", () => {
      const error = new Error("Test error");

      expect(() => {
        ErrorHandler.logError(error);
      }).not.toThrow();
    });

    it("should handle null error gracefully", () => {
      expect(() => {
        ErrorHandler.logError(null as any);
      }).not.toThrow();
    });

    it("should handle undefined error gracefully", () => {
      expect(() => {
        ErrorHandler.logError(undefined as any);
      }).not.toThrow();
    });
  });

  describe("isRetryableError", () => {
    it("should identify retryable errors by name", () => {
      const networkError = new Error("Network error");
      networkError.name = "NetworkError";

      expect(ErrorHandler.isRetryableError(networkError)).toBe(true);
    });

    it("should identify retryable errors by code", () => {
      const error = new Error("Connection error");
      (error as any).code = "ECONNRESET";

      expect(ErrorHandler.isRetryableError(error)).toBe(true);
    });

    it("should identify retryable errors by message", () => {
      const error = new Error("Connection reset by peer");

      expect(ErrorHandler.isRetryableError(error)).toBe(true);
    });

    it("should not identify non-retryable errors", () => {
      const validationError = new Error("Validation failed");
      validationError.name = "ValidationError";

      expect(ErrorHandler.isRetryableError(validationError)).toBe(false);
    });

    it("should handle null error gracefully", () => {
      expect(ErrorHandler.isRetryableError(null as any)).toBe(false);
    });

    it("should handle undefined error gracefully", () => {
      expect(ErrorHandler.isRetryableError(undefined as any)).toBe(false);
    });
  });

  describe("getErrorSeverity", () => {
    it("should return low severity for validation errors", () => {
      const error = new Error("Validation failed");
      error.name = "ValidationError";

      expect(ErrorHandler.getErrorSeverity(error)).toBe("low");
    });

    it("should return low severity for unauthorized errors", () => {
      const error = new Error("Unauthorized");
      error.name = "UnauthorizedError";

      expect(ErrorHandler.getErrorSeverity(error)).toBe("low");
    });

    it("should return medium severity for forbidden errors", () => {
      const error = new Error("Forbidden");
      error.name = "ForbiddenError";

      expect(ErrorHandler.getErrorSeverity(error)).toBe("medium");
    });

    it("should return medium severity for not found errors", () => {
      const error = new Error("Not found");
      error.name = "NotFoundError";

      expect(ErrorHandler.getErrorSeverity(error)).toBe("medium");
    });

    it("should return medium severity for rate limit errors", () => {
      const error = new Error("Rate limit exceeded");
      error.name = "RateLimitError";

      expect(ErrorHandler.getErrorSeverity(error)).toBe("medium");
    });

    it("should return medium severity for timeout errors", () => {
      const error = new Error("Timeout");
      error.name = "TimeoutError";

      expect(ErrorHandler.getErrorSeverity(error)).toBe("medium");
    });

    it("should return high severity for database errors", () => {
      const error = new Error("Database error");
      error.name = "DatabaseError";

      expect(ErrorHandler.getErrorSeverity(error)).toBe("high");
    });

    it("should return high severity for network errors", () => {
      const error = new Error("Network error");
      error.name = "NetworkError";

      expect(ErrorHandler.getErrorSeverity(error)).toBe("high");
    });

    it("should return critical severity for unknown errors", () => {
      const error = new Error("Unknown error");
      error.name = "UnknownError";

      expect(ErrorHandler.getErrorSeverity(error)).toBe("critical");
    });

    it("should handle null error gracefully", () => {
      expect(ErrorHandler.getErrorSeverity(null as any)).toBe("critical");
    });

    it("should handle undefined error gracefully", () => {
      expect(ErrorHandler.getErrorSeverity(undefined as any)).toBe("critical");
    });
  });

  describe("edge cases", () => {
    it("should handle errors without name property", () => {
      const error = new Error("Test error");
      delete (error as any).name;

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INTERNAL_ERROR");
    });

    it("should handle errors without message property", () => {
      const error = new Error();
      delete (error as any).message;

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INTERNAL_ERROR");
    });

    it("should handle circular reference in error details", () => {
      const error = new Error("Circular reference error");
      const circularObj: any = { name: "test" };
      circularObj.self = circularObj;
      (error as any).details = circularObj;

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INTERNAL_ERROR");
    });

    it("should handle very large error messages", () => {
      const largeMessage = "A".repeat(10000);
      const error = new Error(largeMessage);

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INTERNAL_ERROR");
    });

    it("should handle special characters in error messages", () => {
      const specialMessage =
        "Error with special chars: !@#$%^&*()_+{}|:\"<>?[]\\;',./";
      const error = new Error(specialMessage);

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INTERNAL_ERROR");
    });

    it("should handle unicode characters in error messages", () => {
      const unicodeMessage = "Error with unicode: 世界 🌍 🚀";
      const error = new Error(unicodeMessage);

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INTERNAL_ERROR");
    });

    it("should handle errors with complex nested objects", () => {
      const error = new Error("Complex error");
      (error as any).details = {
        level1: {
          level2: {
            level3: {
              value: "deep nested value",
            },
          },
        },
      };

      const result = ErrorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INTERNAL_ERROR");
    });

    it("should handle concurrent error handling", () => {
      const errors = Array(10)
        .fill(null)
        .map((_, i) => new Error(`Error ${i}`));

      const results = errors.map((error) => ErrorHandler.handleError(error));

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("INTERNAL_ERROR");
      });
    });
  });
});
