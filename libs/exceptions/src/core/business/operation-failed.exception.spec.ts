/**
 * OperationFailedException 单元测试
 */

import { OperationFailedException } from "./operation-failed.exception.js";

describe("OperationFailedException", () => {
  describe("构造函数", () => {
    it("应该创建基本异常实例", () => {
      // Arrange & Act
      const exception = new OperationFailedException(
        "order_creation",
        "订单创建失败",
      );

      // Assert
      expect(exception).toBeInstanceOf(OperationFailedException);
      expect(exception.errorCode).toBe("BUSINESS_OPERATION_FAILED");
      expect(exception.title).toBe("操作失败");
      expect(exception.detail).toBe('操作 "order_creation" 失败: 订单创建失败');
      expect(exception.httpStatus).toBe(422);
      expect(exception.name).toBe("OperationFailedException");
    });

    it("应该正确设置操作和原因在数据中", () => {
      // Arrange & Act
      const exception = new OperationFailedException(
        "order_creation",
        "订单创建失败",
      );

      // Assert
      expect(exception.data?.operation).toBe("order_creation");
      expect(exception.data?.reason).toBe("订单创建失败");
    });

    it("应该正确设置上下文数据", () => {
      // Arrange
      const contextData = {
        orderId: "order-123",
        userId: "user-456",
        additionalReason: "insufficient_inventory",
      };

      // Act
      const exception = new OperationFailedException(
        "order_creation",
        "订单创建失败",
        contextData,
      );

      // Assert
      expect(exception.data?.operation).toBe("order_creation");
      expect(exception.data?.reason).toBe("订单创建失败");
      expect(exception.data?.orderId).toBe("order-123");
      expect(exception.data?.userId).toBe("user-456");
      expect(exception.data?.additionalReason).toBe("insufficient_inventory");
    });
  });

  describe("toRFC7807", () => {
    it("应该转换为RFC7807格式", () => {
      // Arrange
      const exception = new OperationFailedException(
        "order_creation",
        "订单创建失败",
      );

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: "https://docs.hl8.com/errors#BUSINESS_OPERATION_FAILED",
        title: "操作失败",
        detail: '操作 "order_creation" 失败: 订单创建失败',
        status: 422,
        errorCode: "BUSINESS_OPERATION_FAILED",
        data: {
          operation: "order_creation",
          reason: "订单创建失败",
        },
      });
    });
  });

  describe("分层和类别方法", () => {
    it("应该返回正确的层级", () => {
      // Arrange & Act
      const exception = new OperationFailedException(
        "order_creation",
        "订单创建失败",
      );

      // Assert
      expect(exception.getLayer()).toBe("domain");
    });

    it("应该返回正确的类别", () => {
      // Arrange & Act
      const exception = new OperationFailedException(
        "order_creation",
        "订单创建失败",
      );

      // Assert
      expect(exception.getCategory()).toBe("business");
    });
  });
});
