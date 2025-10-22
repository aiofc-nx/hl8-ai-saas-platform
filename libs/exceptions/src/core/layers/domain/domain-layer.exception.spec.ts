/**
 * DomainLayerException 单元测试
 */

import { DomainLayerException } from "./domain-layer.exception.js";

/**
 * 测试用领域层异常类
 */
class TestDomainException extends DomainLayerException {
  constructor(
    errorCode: string = "TEST_DOMAIN_ERROR",
    title: string = "测试领域错误",
    detail: string = "这是一个测试领域错误",
    status: number = 422,
    data?: Record<string, unknown>,
    type?: string,
    rootCause?: Error,
  ) {
    super(errorCode, title, detail, status, data, type, rootCause);
  }
}

describe("DomainLayerException", () => {
  describe("构造函数", () => {
    it("应该创建基本异常实例", () => {
      // Arrange & Act
      const exception = new TestDomainException();

      // Assert
      expect(exception).toBeInstanceOf(DomainLayerException);
      expect(exception.errorCode).toBe("TEST_DOMAIN_ERROR");
      expect(exception.title).toBe("测试领域错误");
      expect(exception.detail).toBe("这是一个测试领域错误");
      expect(exception.httpStatus).toBe(422);
      expect(exception.name).toBe("TestDomainException");
    });
  });

  describe("getLayer", () => {
    it("应该返回正确的层级", () => {
      // Arrange & Act
      const exception = new TestDomainException();

      // Assert
      expect(exception.getLayer()).toBe("domain");
    });
  });

  describe("toRFC7807", () => {
    it("应该转换为RFC7807格式", () => {
      // Arrange
      const exception = new TestDomainException();

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: "https://docs.hl8.com/errors#TEST_DOMAIN_ERROR",
        title: "测试领域错误",
        detail: "这是一个测试领域错误",
        status: 422,
        errorCode: "TEST_DOMAIN_ERROR",
        data: undefined,
      });
    });
  });
});
