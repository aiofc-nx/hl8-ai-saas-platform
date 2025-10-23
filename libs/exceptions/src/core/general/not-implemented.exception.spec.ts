/**
 * NotImplementedException 单元测试
 */

import { NotImplementedException } from "./not-implemented.exception.js";

describe("NotImplementedException", () => {
  describe("构造函数", () => {
    it("应该创建基本异常实例", () => {
      // Arrange & Act
      const exception = new NotImplementedException("高级搜索功能");

      // Assert
      expect(exception).toBeInstanceOf(NotImplementedException);
      expect(exception.errorCode).toBe("GENERAL_NOT_IMPLEMENTED");
      expect(exception.title).toBe("功能未实现");
      expect(exception.detail).toBe('功能 "高级搜索功能" 尚未实现');
      expect(exception.httpStatus).toBe(501);
      expect(exception.name).toBe("NotImplementedException");
    });

    it("应该正确设置功能名在数据中", () => {
      // Arrange & Act
      const exception = new NotImplementedException("高级搜索功能");

      // Assert
      expect(exception.data?.feature).toBe("高级搜索功能");
    });

    it("应该正确设置上下文数据", () => {
      // Arrange
      const contextData = {
        featureCode: "advanced_search",
        version: "2.0.0",
        estimatedCompletion: "2024-06-01",
      };

      // Act
      const exception = new NotImplementedException(
        "高级搜索功能",
        contextData,
      );

      // Assert
      expect(exception.data?.feature).toBe("高级搜索功能");
      expect(exception.data?.featureCode).toBe("advanced_search");
      expect(exception.data?.version).toBe("2.0.0");
      expect(exception.data?.estimatedCompletion).toBe("2024-06-01");
    });
  });

  describe("toRFC7807", () => {
    it("应该转换为RFC7807格式", () => {
      // Arrange
      const exception = new NotImplementedException("高级搜索功能");

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: "https://docs.hl8.com/errors#GENERAL_NOT_IMPLEMENTED",
        title: "功能未实现",
        detail: '功能 "高级搜索功能" 尚未实现',
        status: 501,
        errorCode: "GENERAL_NOT_IMPLEMENTED",
        data: {
          feature: "高级搜索功能",
        },
      });
    });
  });

  describe("分层和类别方法", () => {
    it("应该返回正确的层级", () => {
      // Arrange & Act
      const exception = new NotImplementedException("高级搜索功能");

      // Assert
      expect(exception.getLayer()).toBe("interface");
    });

    it("应该返回正确的类别", () => {
      // Arrange & Act
      const exception = new NotImplementedException("高级搜索功能");

      // Assert
      expect(exception.getCategory()).toBe("general");
    });
  });
});
