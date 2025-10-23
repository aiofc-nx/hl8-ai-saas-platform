/**
 * ValidationFailedException 单元测试
 */

import { ValidationFailedException } from "./validation-failed.exception.js";

describe("ValidationFailedException", () => {
  describe("构造函数", () => {
    it("应该创建基本异常实例", () => {
      // Arrange & Act
      const exception = new ValidationFailedException("email", "邮箱格式无效");

      // Assert
      expect(exception).toBeInstanceOf(ValidationFailedException);
      expect(exception.errorCode).toBe("VALIDATION_FAILED");
      expect(exception.title).toBe("数据验证失败");
      expect(exception.detail).toBe('字段 "email" 验证失败: 邮箱格式无效');
      expect(exception.httpStatus).toBe(400);
      expect(exception.name).toBe("ValidationFailedException");
    });

    it("应该正确设置字段和原因在数据中", () => {
      // Arrange & Act
      const exception = new ValidationFailedException("email", "邮箱格式无效");

      // Assert
      expect(exception.data?.field).toBe("email");
      expect(exception.data?.reason).toBe("邮箱格式无效");
    });

    it("应该正确设置上下文数据", () => {
      // Arrange
      const contextData = {
        providedValue: "invalid-email",
        expectedFormat: "user@example.com",
        validationRule: "email_format",
      };

      // Act
      const exception = new ValidationFailedException(
        "email",
        "邮箱格式无效",
        contextData,
      );

      // Assert
      expect(exception.data?.field).toBe("email");
      expect(exception.data?.reason).toBe("邮箱格式无效");
      expect(exception.data?.providedValue).toBe("invalid-email");
      expect(exception.data?.expectedFormat).toBe("user@example.com");
    });
  });

  describe("toRFC7807", () => {
    it("应该转换为RFC7807格式", () => {
      // Arrange
      const exception = new ValidationFailedException("email", "邮箱格式无效");

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: "https://docs.hl8.com/errors#VALIDATION_FAILED",
        title: "数据验证失败",
        detail: '字段 "email" 验证失败: 邮箱格式无效',
        status: 400,
        errorCode: "VALIDATION_FAILED",
        data: {
          field: "email",
          reason: "邮箱格式无效",
        },
      });
    });
  });

  describe("分层和类别方法", () => {
    it("应该返回正确的层级", () => {
      // Arrange & Act
      const exception = new ValidationFailedException("email", "邮箱格式无效");

      // Assert
      expect(exception.getLayer()).toBe("domain");
    });

    it("应该返回正确的类别", () => {
      // Arrange & Act
      const exception = new ValidationFailedException("email", "邮箱格式无效");

      // Assert
      expect(exception.getCategory()).toBe("validation");
    });
  });
});
