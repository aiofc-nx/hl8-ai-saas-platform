/**
 * UnauthorizedException 单元测试
 */

import { UnauthorizedException } from "./unauthorized.exception.js";

describe("UnauthorizedException", () => {
  describe("构造函数", () => {
    it("应该创建基本异常实例", () => {
      // Arrange & Act
      const exception = new UnauthorizedException("您没有权限访问此资源");

      // Assert
      expect(exception).toBeInstanceOf(UnauthorizedException);
      expect(exception.errorCode).toBe("AUTH_UNAUTHORIZED");
      expect(exception.title).toBe("未授权访问");
      expect(exception.detail).toBe("您没有权限访问此资源");
      expect(exception.httpStatus).toBe(403);
      expect(exception.name).toBe("UnauthorizedException");
    });

    it("应该正确设置上下文数据", () => {
      // Arrange
      const contextData = {
        resource: "user-profile",
        requiredPermission: "read",
        userId: "user-123",
      };

      // Act
      const exception = new UnauthorizedException(
        "您没有权限访问此资源",
        contextData,
      );

      // Assert
      expect(exception.data).toEqual(contextData);
      expect(exception.data?.resource).toBe("user-profile");
      expect(exception.data?.requiredPermission).toBe("read");
    });
  });

  describe("toRFC7807", () => {
    it("应该转换为RFC7807格式", () => {
      // Arrange
      const exception = new UnauthorizedException("您没有权限访问此资源");

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: "https://docs.hl8.com/errors#AUTH_UNAUTHORIZED",
        title: "未授权访问",
        detail: "您没有权限访问此资源",
        status: 403,
        errorCode: "AUTH_UNAUTHORIZED",
        data: undefined,
      });
    });
  });

  describe("分层和类别方法", () => {
    it("应该返回正确的层级", () => {
      // Arrange & Act
      const exception = new UnauthorizedException("您没有权限访问此资源");

      // Assert
      expect(exception.getLayer()).toBe("interface");
    });

    it("应该返回正确的类别", () => {
      // Arrange & Act
      const exception = new UnauthorizedException("您没有权限访问此资源");

      // Assert
      expect(exception.getCategory()).toBe("auth");
    });
  });
});
