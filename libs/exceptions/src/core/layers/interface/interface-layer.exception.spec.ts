/**
 * InterfaceLayerException 单元测试
 */

import { InterfaceLayerException } from "./interface-layer.exception.js";

/**
 * 测试用接口层异常类
 */
class TestInterfaceException extends InterfaceLayerException {
  constructor(
    errorCode: string = "TEST_INTERFACE_ERROR",
    title: string = "测试接口错误",
    detail: string = "这是一个测试接口错误",
    status: number = 400,
    data?: Record<string, unknown>,
    type?: string,
    rootCause?: Error,
  ) {
    super(errorCode, title, detail, status, data, type, rootCause);
  }
}

describe("InterfaceLayerException", () => {
  describe("构造函数", () => {
    it("应该创建基本异常实例", () => {
      // Arrange & Act
      const exception = new TestInterfaceException();

      // Assert
      expect(exception).toBeInstanceOf(InterfaceLayerException);
      expect(exception.errorCode).toBe("TEST_INTERFACE_ERROR");
      expect(exception.title).toBe("测试接口错误");
      expect(exception.detail).toBe("这是一个测试接口错误");
      expect(exception.httpStatus).toBe(400);
      expect(exception.name).toBe("TestInterfaceException");
    });

    it("应该正确设置所有属性", () => {
      // Arrange
      const errorCode = "CUSTOM_INTERFACE_ERROR";
      const title = "自定义接口错误";
      const detail = "这是一个自定义接口错误详情";
      const status = 404;
      const data = { userId: "user-123" };
      const type = "https://example.com/errors#interface";
      const rootCause = new Error("原始错误");

      // Act
      const exception = new TestInterfaceException(
        errorCode,
        title,
        detail,
        status,
        data,
        type,
        rootCause,
      );

      // Assert
      expect(exception.errorCode).toBe(errorCode);
      expect(exception.title).toBe(title);
      expect(exception.detail).toBe(detail);
      expect(exception.httpStatus).toBe(status);
      expect(exception.data).toBe(data);
      expect(exception.type).toBe(type);
      expect(exception.rootCause).toBe(rootCause);
    });
  });

  describe("getLayer", () => {
    it("应该返回正确的层级", () => {
      // Arrange & Act
      const exception = new TestInterfaceException();

      // Assert
      expect(exception.getLayer()).toBe("interface");
    });
  });

  describe("toRFC7807", () => {
    it("应该转换为RFC7807格式", () => {
      // Arrange
      const exception = new TestInterfaceException();

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: "https://docs.hl8.com/errors#TEST_INTERFACE_ERROR",
        title: "测试接口错误",
        detail: "这是一个测试接口错误",
        status: 400,
        errorCode: "TEST_INTERFACE_ERROR",
        data: undefined,
      });
    });
  });

  describe("继承关系", () => {
    it("应该正确继承AbstractHttpException", () => {
      // Arrange & Act
      const exception = new TestInterfaceException();

      // Assert
      expect(exception.getLayer()).toBe("interface");
    });
  });
});
