/**
 * UserNotFoundException 单元测试
 */

import { UserNotFoundException } from "./user-not-found.exception.js";

describe("UserNotFoundException", () => {
  describe("构造函数", () => {
    it("应该创建基本异常实例", () => {
      // Arrange & Act
      const exception = new UserNotFoundException("user-123");

      // Assert
      expect(exception).toBeInstanceOf(UserNotFoundException);
      expect(exception.errorCode).toBe("USER_NOT_FOUND");
      expect(exception.title).toBe("用户未找到");
      expect(exception.detail).toBe('ID 为 "user-123" 的用户不存在');
      expect(exception.httpStatus).toBe(404);
      expect(exception.name).toBe("UserNotFoundException");
    });

    it("应该正确设置用户ID在数据中", () => {
      // Arrange & Act
      const exception = new UserNotFoundException("user-123");

      // Assert
      expect(exception.data?.userId).toBe("user-123");
    });

    it("应该正确设置上下文数据", () => {
      // Arrange
      const contextData = {
        searchField: "id",
        requestId: "req-456",
      };

      // Act
      const exception = new UserNotFoundException("user-123", contextData);

      // Assert
      expect(exception.data?.userId).toBe("user-123");
      expect(exception.data?.searchField).toBe("id");
      expect(exception.data?.requestId).toBe("req-456");
    });
  });

  describe("toRFC7807", () => {
    it("应该转换为RFC7807格式", () => {
      // Arrange
      const exception = new UserNotFoundException("user-123");

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: "https://docs.hl8.com/errors#USER_NOT_FOUND",
        title: "用户未找到",
        detail: 'ID 为 "user-123" 的用户不存在',
        status: 404,
        errorCode: "USER_NOT_FOUND",
        data: { userId: "user-123" },
      });
    });
  });

  describe("分层和类别方法", () => {
    it("应该返回正确的层级", () => {
      // Arrange & Act
      const exception = new UserNotFoundException("user-123");

      // Assert
      expect(exception.getLayer()).toBe("interface");
    });

    it("应该返回正确的类别", () => {
      // Arrange & Act
      const exception = new UserNotFoundException("user-123");

      // Assert
      expect(exception.getCategory()).toBe("user");
    });
  });
});
