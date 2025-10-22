/**
 * AuthException 单元测试
 */

import { AuthException } from "./auth.exception.js";

/**
 * 测试用认证异常类
 */
class TestAuthException extends AuthException {
  constructor(
    errorCode: string = "TEST_AUTH_ERROR",
    title: string = "测试认证错误",
    detail: string = "这是一个测试认证错误",
    status: number = 401,
    data?: Record<string, unknown>,
    type?: string,
    rootCause?: Error,
  ) {
    super(errorCode, title, detail, status, data, type, rootCause);
  }
}

describe("AuthException", () => {
  describe("构造函数", () => {
    it("应该创建基本异常实例", () => {
      // Arrange & Act
      const exception = new TestAuthException();

      // Assert
      expect(exception).toBeInstanceOf(AuthException);
      expect(exception.errorCode).toBe("TEST_AUTH_ERROR");
      expect(exception.title).toBe("测试认证错误");
      expect(exception.detail).toBe("这是一个测试认证错误");
      expect(exception.httpStatus).toBe(401);
      expect(exception.name).toBe("TestAuthException");
    });
  });

  describe("getCategory", () => {
    it("应该返回正确的类别", () => {
      // Arrange & Act
      const exception = new TestAuthException();

      // Assert
      expect(exception.getCategory()).toBe("auth");
    });
  });

  describe("getLayer", () => {
    it("应该返回正确的层级", () => {
      // Arrange & Act
      const exception = new TestAuthException();

      // Assert
      expect(exception.getLayer()).toBe("interface");
    });
  });

  describe("继承关系", () => {
    it("应该正确继承InterfaceLayerException", () => {
      // Arrange & Act
      const exception = new TestAuthException();

      // Assert
      expect(exception.getLayer()).toBe("interface");
      expect(exception.getCategory()).toBe("auth");
    });
  });
});
