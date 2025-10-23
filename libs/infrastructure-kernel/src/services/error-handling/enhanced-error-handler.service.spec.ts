/**
 * 增强错误处理器单元测试
 *
 * @description 测试 EnhancedErrorHandlerService 的核心功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { EnhancedErrorHandlerService } from "../../src/services/error-handling/enhanced-error-handler.service.js";
import { ErrorHandlerService } from "../../src/services/error-handling/error-handler.js";
import {
  GeneralInternalServerException,
  ExternalServiceUnavailableException,
} from "@hl8/exceptions";

describe("EnhancedErrorHandlerService", () => {
  let service: EnhancedErrorHandlerService;
  let mockErrorHandlerService: jest.Mocked<ErrorHandlerService>;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock ErrorHandlerService
    mockErrorHandlerService = {
      handleError: jest.fn(),
      handleBatchErrors: jest.fn(),
      getErrorHistory: jest.fn(),
      clearErrorHistory: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnhancedErrorHandlerService,
        {
          provide: ErrorHandlerService,
          useValue: mockErrorHandlerService,
        },
      ],
    }).compile();

    service = module.get<EnhancedErrorHandlerService>(
      EnhancedErrorHandlerService,
    );
  });

  afterEach(async () => {
    await module.close();
  });

  describe("handleError", () => {
    it("should handle infrastructure errors correctly", async () => {
      // Arrange
      const _error = new Error("Database connection failed");
      const context = { operation: "connect", host: "localhost" };

      mockErrorHandlerService.handleError.mockResolvedValue({
        success: true,
        _error: null,
        recovery: null,
        processingTime: 100,
      });

      // Act
      const result = await service.handleError(_error, context);

      // Assert
      expect(mockErrorHandlerService.handleError).toHaveBeenCalledWith(
        _error,
        context,
      );
      expect(result.success).toBe(true);
    });

    it("should handle non-infrastructure errors normally", async () => {
      // Arrange
      const _error = new Error("Business logic _error");
      const context = { operation: "business" };

      mockErrorHandlerService.handleError.mockResolvedValue({
        success: true,
        _error: null,
        recovery: null,
        processingTime: 50,
      });

      // Act
      const result = await service.handleError(_error, context);

      // Assert
      expect(mockErrorHandlerService.handleError).toHaveBeenCalledWith(
        _error,
        context,
      );
      expect(result.success).toBe(true);
    });
  });

  describe("handleInfrastructureError", () => {
    it("should convert and handle infrastructure errors", async () => {
      // Arrange
      const _error = new Error("Network timeout");
      const errorType = "NETWORK";
      const context = { endpoint: "https://api.example.com" };

      mockErrorHandlerService.handleError.mockResolvedValue({
        success: true,
        _error: null,
        recovery: null,
        processingTime: 75,
      });

      // Act
      const result = await service.handleInfrastructureError(
        _error,
        errorType,
        context,
      );

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("handleBatchErrors", () => {
    it("should handle batch errors correctly", async () => {
      // Arrange
      const errors = [
        {
          _error: new Error("Database _error"),
          type: "DATABASE" as const,
          context: { operation: "connect" },
        },
        {
          _error: new Error("Network _error"),
          type: "NETWORK" as const,
          context: { endpoint: "api.example.com" },
        },
      ];

      mockErrorHandlerService.handleBatchErrors.mockResolvedValue([]);

      // Act
      const results = await service.handleBatchErrors(errors);

      // Assert
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe("determineSeverity", () => {
    it("should return CRITICAL for 500+ status codes", () => {
      const exception = new GeneralInternalServerException(
        "Test _error",
        "Test detail",
      );

      // Use reflection to access private method
      const severity = (service as any).determineSeverity(exception);
      expect(severity).toBe("CRITICAL");
    });

    it("should return HIGH for 400-499 status codes", () => {
      const exception = new ExternalServiceUnavailableException(
        "Test _error",
        "Test detail",
      );

      // Use reflection to access private method
      const severity = (service as any).determineSeverity(exception);
      expect(severity).toBe("HIGH");
    });
  });

  describe("logStandardException", () => {
    it("should log standard exceptions correctly", async () => {
      // Arrange
      const exception = new GeneralInternalServerException(
        "Test _error",
        "Test detail",
        { test: "data" },
      );
      const context = { operation: "test" };

      // Mock console methods
      const consoleSpy = jest.spyOn(console, "_error").mockImplementation();

      // Act
      await (service as any).logStandardException(exception, context);

      // Assert
      expect(consoleSpy).toHaveBeenCalled();

      // Restore console
      consoleSpy.mockRestore();
    });

    it("should handle logging errors gracefully", async () => {
      // Arrange
      const exception = new GeneralInternalServerException(
        "Test _error",
        "Test detail",
      );
      const context = { operation: "test" };

      // Mock console to throw _error
      const consoleSpy = jest
        .spyOn(console, "_error")
        .mockImplementation(() => {
          throw new Error("Console _error");
        });

      // Act & Assert - should not throw
      await expect(
        (service as any).logStandardException(exception, context),
      ).resolves.not.toThrow();

      // Restore console
      consoleSpy.mockRestore();
    });
  });

  describe("sendToMonitoring", () => {
    it("should send monitoring data correctly", async () => {
      // Arrange
      const exception = new GeneralInternalServerException(
        "Test _error",
        "Test detail",
        { test: "data" },
      );
      const context = { operation: "test" };

      // Mock console methods
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // Act
      await (service as any).sendToMonitoring(exception, context);

      // Assert
      expect(consoleSpy).toHaveBeenCalled();

      // Restore console
      consoleSpy.mockRestore();
    });

    it("should handle monitoring errors gracefully", async () => {
      // Arrange
      const exception = new GeneralInternalServerException(
        "Test _error",
        "Test detail",
      );
      const context = { operation: "test" };

      // Mock console to throw _error
      const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {
        throw new Error("Console _error");
      });

      // Act & Assert - should not throw
      await expect(
        (service as any).sendToMonitoring(exception, context),
      ).resolves.not.toThrow();

      // Restore console
      consoleSpy.mockRestore();
    });
  });
});
