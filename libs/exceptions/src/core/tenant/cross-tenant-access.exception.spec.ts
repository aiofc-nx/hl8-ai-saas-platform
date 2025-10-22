/**
 * CrossTenantAccessException 单元测试
 */

import { CrossTenantAccessException } from "./cross-tenant-access.exception.js";

describe("CrossTenantAccessException", () => {
  describe("构造函数", () => {
    it("应该创建基本异常实例", () => {
      // Arrange & Act
      const exception = new CrossTenantAccessException(
        "tenant-123",
        "tenant-456",
      );

      // Assert
      expect(exception).toBeInstanceOf(CrossTenantAccessException);
      expect(exception.errorCode).toBe("TENANT_CROSS_ACCESS_VIOLATION");
      expect(exception.title).toBe("跨租户访问违规");
      expect(exception.detail).toBe(
        '不允许从租户 "tenant-123" 访问租户 "tenant-456" 的资源',
      );
      expect(exception.httpStatus).toBe(403);
      expect(exception.name).toBe("CrossTenantAccessException");
    });

    it("应该正确设置租户ID在数据中", () => {
      // Arrange & Act
      const exception = new CrossTenantAccessException(
        "tenant-123",
        "tenant-456",
      );

      // Assert
      expect(exception.data?.currentTenantId).toBe("tenant-123");
      expect(exception.data?.targetTenantId).toBe("tenant-456");
    });

    it("应该正确设置上下文数据", () => {
      // Arrange
      const contextData = {
        resourceType: "user",
        resourceId: "user-789",
        operation: "read",
      };

      // Act
      const exception = new CrossTenantAccessException(
        "tenant-123",
        "tenant-456",
        contextData,
      );

      // Assert
      expect(exception.data?.currentTenantId).toBe("tenant-123");
      expect(exception.data?.targetTenantId).toBe("tenant-456");
      expect(exception.data?.resourceType).toBe("user");
      expect(exception.data?.resourceId).toBe("user-789");
    });
  });

  describe("toRFC7807", () => {
    it("应该转换为RFC7807格式", () => {
      // Arrange
      const exception = new CrossTenantAccessException(
        "tenant-123",
        "tenant-456",
      );

      // Act
      const problemDetails = exception.toRFC7807();

      // Assert
      expect(problemDetails).toEqual({
        type: "https://docs.hl8.com/errors#TENANT_CROSS_ACCESS_VIOLATION",
        title: "跨租户访问违规",
        detail: '不允许从租户 "tenant-123" 访问租户 "tenant-456" 的资源',
        status: 403,
        errorCode: "TENANT_CROSS_ACCESS_VIOLATION",
        data: {
          currentTenantId: "tenant-123",
          targetTenantId: "tenant-456",
        },
      });
    });
  });

  describe("分层和类别方法", () => {
    it("应该返回正确的层级", () => {
      // Arrange & Act
      const exception = new CrossTenantAccessException(
        "tenant-123",
        "tenant-456",
      );

      // Assert
      expect(exception.getLayer()).toBe("domain");
    });

    it("应该返回正确的类别", () => {
      // Arrange & Act
      const exception = new CrossTenantAccessException(
        "tenant-123",
        "tenant-456",
      );

      // Assert
      expect(exception.getCategory()).toBe("tenant");
    });
  });
});
