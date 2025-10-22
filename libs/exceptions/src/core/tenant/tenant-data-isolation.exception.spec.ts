/**
 * TenantDataIsolationException 单元测试
 */

import { TenantDataIsolationException } from "./tenant-data-isolation.exception.js";

describe("TenantDataIsolationException", () => {
  describe("构造函数", () => {
    it("应该创建基本的租户数据隔离异常", () => {
      const exception = new TenantDataIsolationException(
        "租户数据隔离验证失败",
      );

      expect(exception).toBeInstanceOf(TenantDataIsolationException);
      expect(exception.errorCode).toBe("TENANT_DATA_ISOLATION_FAILED");
      expect(exception.title).toBe("租户数据隔离失败");
      expect(exception.detail).toBe("租户数据隔离验证失败");
      expect(exception.status).toBe(403);
    });

    it("应该创建带上下文数据的租户数据隔离异常", () => {
      const data = {
        isolationLevel: "tenant",
        resourceType: "user",
        tenantId: "tenant-123",
        violationType: "cross_tenant_access",
      };

      const exception = new TenantDataIsolationException(
        "租户数据隔离验证失败",
        data,
      );

      expect(exception.data).toEqual(data);
    });
  });

  describe("getIsolationInfo", () => {
    it("应该返回隔离信息", () => {
      const data = {
        isolationLevel: "tenant",
        resourceType: "user",
        tenantId: "tenant-123",
        violationType: "cross_tenant_access",
      };

      const exception = new TenantDataIsolationException(
        "租户数据隔离验证失败",
        data,
      );

      const info = exception.getIsolationInfo();

      expect(info.isolationLevel).toBe("tenant");
      expect(info.resourceType).toBe("user");
      expect(info.tenantId).toBe("tenant-123");
      expect(info.violationType).toBe("cross_tenant_access");
      expect(info.timestamp).toBeDefined();
    });

    it("应该使用默认隔离级别", () => {
      const exception = new TenantDataIsolationException(
        "租户数据隔离验证失败",
      );

      const info = exception.getIsolationInfo();

      expect(info.isolationLevel).toBe("tenant");
      expect(info.timestamp).toBeDefined();
    });
  });

  describe("RFC7807 格式转换", () => {
    it("应该正确转换为 RFC7807 格式", () => {
      const data = {
        isolationLevel: "tenant",
        resourceType: "user",
        tenantId: "tenant-123",
      };

      const exception = new TenantDataIsolationException(
        "租户数据隔离验证失败",
        data,
      );

      const rfc7807 = exception.toRFC7807();

      expect(rfc7807.type).toBe(
        "https://docs.hl8.com/errors#TENANT_DATA_ISOLATION_FAILED",
      );
      expect(rfc7807.title).toBe("租户数据隔离失败");
      expect(rfc7807.detail).toBe("租户数据隔离验证失败");
      expect(rfc7807.status).toBe(403);
      expect(rfc7807.errorCode).toBe("TENANT_DATA_ISOLATION_FAILED");
      expect(rfc7807.data).toEqual(data);
    });
  });
});
