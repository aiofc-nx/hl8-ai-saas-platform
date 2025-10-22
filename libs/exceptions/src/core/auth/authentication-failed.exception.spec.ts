/**
 * AuthenticationFailedException 单元测试
 */

import { AuthenticationFailedException } from "./authentication-failed.exception.js";

describe("AuthenticationFailedException", () => {
  describe("构造函数", () => {
    it("应该创建基本异常实例", () => {
      // Arrange & Act
      const exception = new AuthenticationFailedException("密码错误");

      // Assert
      expect(exception).toBeInstanceOf(AuthenticationFailedException);
      expect(exception.errorCode).toBe("AUTH_LOGIN_FAILED");
      expect(exception.title).toBe("认证失败");
      expect(exception.detail).toBe("密码错误");
      expect(exception.httpStatus).toBe(401);
      expect(exception.name).toBe("AuthenticationFailedException");
    });

    it("应该正确设置上下文数据", () => {
      // Arrange
      const contextData = {
        username: "john.doe",
        attemptCount: 3,
        lockUntil: new Date(Date.now() + 15 * 60 * 1000),
      };

      // Act
      const exception = new AuthenticationFailedException(
        "密码错误",
        contextData,
      );

      // Assert
      expect(exception.data).toEqual(contextData);
      expect(exception.data?.username).toBe("john.doe");
      expect(exception.data?.attemptCount).toBe(3);
    });

    it("应该正确设置类型URI", () => {
      // Arrange & Act
      const exception = new AuthenticationFailedException("密码错误");

      // Assert
      expect(exception.type).toBe(
        "https://docs.hl8.com/errors#AUTH_LOGIN_FAILED",
      );
    });
  });

  describe("toRFC7807", () => {
    it("应该转换为RFC7807格式", () => {
      // Arrange
      const exception = new AuthenticationFailedException("密码错误");

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: "https://docs.hl8.com/errors#AUTH_LOGIN_FAILED",
        title: "认证失败",
        detail: "密码错误",
        status: 401,
        errorCode: "AUTH_LOGIN_FAILED",
        data: undefined,
      });
    });

    it("应该包含上下文数据在RFC7807格式中", () => {
      // Arrange
      const contextData = { username: "john.doe", attemptCount: 3 };
      const exception = new AuthenticationFailedException(
        "密码错误",
        contextData,
      );

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails.data).toEqual(contextData);
    });
  });

  describe("分层和类别方法", () => {
    it("应该返回正确的层级", () => {
      // Arrange & Act
      const exception = new AuthenticationFailedException("密码错误");

      // Assert
      expect(exception.getLayer()).toBe("interface");
    });

    it("应该返回正确的类别", () => {
      // Arrange & Act
      const exception = new AuthenticationFailedException("密码错误");

      // Assert
      expect(exception.getCategory()).toBe("auth");
    });
  });

  describe("继承关系", () => {
    it("应该正确继承AuthException", () => {
      // Arrange & Act
      const exception = new AuthenticationFailedException("密码错误");

      // Assert
      expect(exception.getCategory()).toBe("auth");
      expect(exception.getLayer()).toBe("interface");
    });
  });
});
