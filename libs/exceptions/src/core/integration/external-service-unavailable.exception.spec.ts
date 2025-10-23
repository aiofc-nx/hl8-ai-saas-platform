/**
 * ExternalServiceUnavailableException 单元测试
 */

import { ExternalServiceUnavailableException } from "./external-service-unavailable.exception.js";

describe("ExternalServiceUnavailableException", () => {
  describe("构造函数", () => {
    it("应该创建基本异常实例", () => {
      // Arrange & Act
      const exception = new ExternalServiceUnavailableException(
        "payment-gateway",
        "支付网关服务不可用",
      );

      // Assert
      expect(exception).toBeInstanceOf(ExternalServiceUnavailableException);
      expect(exception.errorCode).toBe(
        "INTEGRATION_EXTERNAL_SERVICE_UNAVAILABLE",
      );
      expect(exception.title).toBe("外部服务不可用");
      expect(exception.detail).toBe(
        '外部服务 "payment-gateway" 不可用: 支付网关服务不可用',
      );
      expect(exception.httpStatus).toBe(503);
      expect(exception.name).toBe("ExternalServiceUnavailableException");
    });

    it("应该正确设置服务名和原因在数据中", () => {
      // Arrange & Act
      const exception = new ExternalServiceUnavailableException(
        "payment-gateway",
        "支付网关服务不可用",
      );

      // Assert
      expect(exception.data?.serviceName).toBe("payment-gateway");
      expect(exception.data?.reason).toBe("支付网关服务不可用");
    });

    it("应该正确设置上下文数据", () => {
      // Arrange
      const contextData = {
        serviceUrl: "https://api.payment.com",
        statusCode: 503,
        retryAfter: 300,
      };

      // Act
      const exception = new ExternalServiceUnavailableException(
        "payment-gateway",
        "支付网关服务不可用",
        contextData,
      );

      // Assert
      expect(exception.data?.serviceName).toBe("payment-gateway");
      expect(exception.data?.reason).toBe("支付网关服务不可用");
      expect(exception.data?.serviceUrl).toBe("https://api.payment.com");
      expect(exception.data?.statusCode).toBe(503);
    });
  });

  describe("toRFC7807", () => {
    it("应该转换为RFC7807格式", () => {
      // Arrange
      const exception = new ExternalServiceUnavailableException(
        "payment-gateway",
        "支付网关服务不可用",
      );

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: "https://docs.hl8.com/errors#INTEGRATION_EXTERNAL_SERVICE_UNAVAILABLE",
        title: "外部服务不可用",
        detail: '外部服务 "payment-gateway" 不可用: 支付网关服务不可用',
        status: 503,
        errorCode: "INTEGRATION_EXTERNAL_SERVICE_UNAVAILABLE",
        data: {
          serviceName: "payment-gateway",
          reason: "支付网关服务不可用",
        },
      });
    });
  });

  describe("分层和类别方法", () => {
    it("应该返回正确的层级", () => {
      // Arrange & Act
      const exception = new ExternalServiceUnavailableException(
        "payment-gateway",
        "支付网关服务不可用",
      );

      // Assert
      expect(exception.getLayer()).toBe("infrastructure");
    });

    it("应该返回正确的类别", () => {
      // Arrange & Act
      const exception = new ExternalServiceUnavailableException(
        "payment-gateway",
        "支付网关服务不可用",
      );

      // Assert
      expect(exception.getCategory()).toBe("integration");
    });
  });
});
