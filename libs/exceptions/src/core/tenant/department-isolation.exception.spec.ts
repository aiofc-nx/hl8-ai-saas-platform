/**
 * DepartmentIsolationException 单元测试
 */

import { DepartmentIsolationException } from "./department-isolation.exception.js";

describe("DepartmentIsolationException", () => {
  describe("构造函数", () => {
    it("应该创建基本的部门隔离异常", () => {
      const exception = new DepartmentIsolationException(
        "部门数据隔离验证失败",
      );

      expect(exception).toBeInstanceOf(DepartmentIsolationException);
      expect(exception.errorCode).toBe("DEPARTMENT_ISOLATION_VIOLATION");
      expect(exception.title).toBe("部门隔离违规");
      expect(exception.detail).toBe("部门数据隔离验证失败");
      expect(exception.toRFC7807().status).toBe(403);
    });

    it("应该创建带上下文数据的部门隔离异常", () => {
      const data = {
        departmentId: "dept-123",
        organizationId: "org-456",
        resourceType: "user",
        violationType: "cross_department_access",
      };

      const exception = new DepartmentIsolationException(
        "部门数据隔离验证失败",
        data,
      );

      expect(exception.data).toEqual(data);
    });
  });

  describe("getDepartmentIsolationInfo", () => {
    it("应该返回部门隔离信息", () => {
      const data = {
        departmentId: "dept-123",
        organizationId: "org-456",
        resourceType: "user",
        violationType: "cross_department_access",
      };

      const exception = new DepartmentIsolationException(
        "部门数据隔离验证失败",
        data,
      );

      const info = exception.getDepartmentIsolationInfo();

      expect(info.departmentId).toBe("dept-123");
      expect(info.organizationId).toBe("org-456");
      expect(info.resourceType).toBe("user");
      expect(info.violationType).toBe("cross_department_access");
      expect(info.isolationLevel).toBe("department");
      expect(info.timestamp).toBeDefined();
    });
  });

  describe("RFC7807 格式转换", () => {
    it("应该正确转换为 RFC7807 格式", () => {
      const data = {
        departmentId: "dept-123",
        organizationId: "org-456",
        resourceType: "user",
      };

      const exception = new DepartmentIsolationException(
        "部门数据隔离验证失败",
        data,
      );

      const rfc7807 = exception.toRFC7807();

      expect(rfc7807.type).toBe(
        "https://docs.hl8.com/errors#DEPARTMENT_ISOLATION_VIOLATION",
      );
      expect(rfc7807.title).toBe("部门隔离违规");
      expect(rfc7807.detail).toBe("部门数据隔离验证失败");
      expect(rfc7807.status).toBe(403);
      expect(rfc7807.errorCode).toBe("DEPARTMENT_ISOLATION_VIOLATION");
      expect(rfc7807.data).toEqual(data);
    });
  });
});
