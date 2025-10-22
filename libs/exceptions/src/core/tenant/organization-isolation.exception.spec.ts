/**
 * OrganizationIsolationException 单元测试
 */

import { OrganizationIsolationException } from "./organization-isolation.exception.js";

describe("OrganizationIsolationException", () => {
  describe("构造函数", () => {
    it("应该创建基本的组织隔离异常", () => {
      const exception = new OrganizationIsolationException(
        "组织数据隔离验证失败",
      );

      expect(exception).toBeInstanceOf(OrganizationIsolationException);
      expect(exception.errorCode).toBe("ORGANIZATION_ISOLATION_VIOLATION");
      expect(exception.title).toBe("组织隔离违规");
      expect(exception.detail).toBe("组织数据隔离验证失败");
      expect(exception.status).toBe(403);
    });

    it("应该创建带上下文数据的组织隔离异常", () => {
      const data = {
        organizationId: "org-123",
        resourceType: "department",
        violationType: "cross_organization_access",
      };

      const exception = new OrganizationIsolationException(
        "组织数据隔离验证失败",
        data,
      );

      expect(exception.data).toEqual(data);
    });
  });

  describe("getOrganizationIsolationInfo", () => {
    it("应该返回组织隔离信息", () => {
      const data = {
        organizationId: "org-123",
        resourceType: "department",
        violationType: "cross_organization_access",
      };

      const exception = new OrganizationIsolationException(
        "组织数据隔离验证失败",
        data,
      );

      const info = exception.getOrganizationIsolationInfo();

      expect(info.organizationId).toBe("org-123");
      expect(info.resourceType).toBe("department");
      expect(info.violationType).toBe("cross_organization_access");
      expect(info.isolationLevel).toBe("organization");
      expect(info.timestamp).toBeDefined();
    });
  });

  describe("RFC7807 格式转换", () => {
    it("应该正确转换为 RFC7807 格式", () => {
      const data = {
        organizationId: "org-123",
        resourceType: "department",
      };

      const exception = new OrganizationIsolationException(
        "组织数据隔离验证失败",
        data,
      );

      const rfc7807 = exception.toRFC7807();

      expect(rfc7807.type).toBe(
        "https://docs.hl8.com/errors#ORGANIZATION_ISOLATION_VIOLATION",
      );
      expect(rfc7807.title).toBe("组织隔离违规");
      expect(rfc7807.detail).toBe("组织数据隔离验证失败");
      expect(rfc7807.status).toBe(403);
      expect(rfc7807.errorCode).toBe("ORGANIZATION_ISOLATION_VIOLATION");
      expect(rfc7807.data).toEqual(data);
    });
  });
});
