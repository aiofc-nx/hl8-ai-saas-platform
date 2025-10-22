/**
 * RateLimitExceededException 单元测试
 */

import { RateLimitExceededException } from "./rate-limit-exceeded.exception.js";

describe("RateLimitExceededException", () => {
  describe("读者函数", () => {
    it("应该创建基本异常实例", () => {
      // Arrange & Act
      const exception = new RateLimitExceededException("API请求频率超出限制");

      // Assert
      expect(exception).toBeInstanceOf(RateLimitExceededException);
      expect(exception.errorCode).toBe("SYSTEM_RATE_LIMIT_EXCEEDED");
      expect(exception.title).toBe("速率限制超出");
      expect(exception.detail).toBe("API请求频率超出限制");
      expect(exception.httpStatus).toBe(429);
      expect(exception.name).toBe("RateLimitExceededException");
    });

    it("应该正确设置上下文数据", () => {
      // Arrange
      const contextData = {
        limit: 100,
        window: "1h",
        retryAfter: 3600,
        userId: "user-123",
      };

      // Act
      const exception = new RateLimitExceededException(
        "API请求频率超出限制",
        contextData,
      );

      // Assert
      expect(exception.data).toEqual(contextData);
      expect(exception.data?.limit).toBe(100);
      expect(exception.data?.retryAfter).toBe(3600);
    });
  });

  describe("toRFC7807", () => {
    it("应该转换为RFC7807格式", () => {
      // Arrange
      const exception = new RateLimitExceededException("API请求频率超出限制");

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: "https://docs.hl8.com/errors#SYSTEM_RATE_LIMIT_EXCEEDED",
        title: "速率限制超出",
        detail: "API请求频率超出限制",
        status: 429,
        errorCode: "SYSTEM_RATE_LIMIT_EXCEEDED",
        data: undefined,
      });
    });
  });

  describe("分层和类别方法", () => {
    it("应该返回正确的层级", () => {
      // Arrange & Act
      const exception = new RateLimitExceededException("API请求频率超出限制");

      // Assert
      expect(exception.getLayer()).toBe("infrastructure");
    });

    it("应该返回正确的类别", () => {
      // Arrange & Act
      const exception = new RateLimitExceededException("API请求频率超出限制");

      // Assert
      expect(exception.getCategory()).toBe("system");
    });
  });
});
