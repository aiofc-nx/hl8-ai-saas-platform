/**
 * 隔离验证异常迁移测试
 * @description 测试现有异常类迁移到新异常体系
 *
 * @since 1.1.0
 */
import { IsolationValidationError } from "./isolation-validation.error.js";

describe("IsolationValidationError Migration", () => {
  describe("向后兼容性", () => {
    it("应该保持原有的构造函数接口", () => {
      const error = new IsolationValidationError(
        "租户 ID 必须是非空字符串",
        "INVALID_TENANT_ID",
        { value: "" },
      );

      expect(error.detail).toBe("租户 ID 必须是非空字符串");
      expect(error.errorCode).toBe("TENANT_CONTEXT_VIOLATION");
      expect(error.data).toEqual({
        contextType: "tenant_id",
        expectedFormat: "uuid",
        providedValue: "",
        value: "",
      });
      expect(error.name).toBe("IsolationValidationError");
    });

    it("应该继承新的异常体系功能", () => {
      const error = new IsolationValidationError(
        "租户 ID 必须是非空字符串",
        "INVALID_TENANT_ID",
        { value: "" },
      );

      // 测试新异常体系的功能
      expect(error.status).toBe(400); // 租户上下文违规异常的状态码
    });

    it("应该支持 RFC7807 格式转换", () => {
      const error = new IsolationValidationError(
        "租户 ID 必须是非空字符串",
        "INVALID_TENANT_ID",
        { value: "" },
      );

      const rfc7807 = error.toRFC7807();
      expect(rfc7807.type).toBe(
        "https://docs.hl8.com/errors#TENANT_CONTEXT_VIOLATION",
      );
      expect(rfc7807.title).toBe("租户上下文违规");
      expect(rfc7807.detail).toBe("租户 ID 必须是非空字符串");
      expect(rfc7807.status).toBe(400); // 租户上下文违规异常的状态码
      expect(rfc7807.errorCode).toBe("TENANT_CONTEXT_VIOLATION");
      expect(rfc7807.data).toEqual({
        contextType: "tenant_id",
        expectedFormat: "uuid",
        providedValue: "",
        value: "",
      });
    });

    it("应该支持租户隔离信息获取", () => {
      const error = new IsolationValidationError(
        "租户 ID 必须是非空字符串",
        "INVALID_TENANT_ID",
        { value: "" },
      );

      const tenantInfo = error.getIsolationInfo();
      expect(tenantInfo.isolationCode).toBe("TENANT_CONTEXT_VIOLATION");
      expect(tenantInfo.isolationMessage).toBe("租户 ID 必须是非空字符串");
      expect(tenantInfo.isolationContext).toEqual({
        contextType: "tenant_id",
        expectedFormat: "uuid",
        providedValue: "",
        value: "",
      });
    });
  });

  describe("新功能测试", () => {
    it("应该支持异常信息获取", () => {
      const error = new IsolationValidationError(
        "租户 ID 必须是非空字符串",
        "INVALID_TENANT_ID",
        { value: "" },
      );

      const info = error.getIsolationInfo();
      expect(info.isolationCode).toBe("TENANT_CONTEXT_VIOLATION");
      expect(info.isolationMessage).toBe("租户 ID 必须是非空字符串");
      expect(info.isolationContext).toEqual({
        contextType: "tenant_id",
        expectedFormat: "uuid",
        providedValue: "",
        value: "",
      });
      expect(info.timestamp).toBeDefined();
    });

    it("应该支持异常信息获取", () => {
      const error = new IsolationValidationError(
        "跨租户访问被拒绝",
        "CROSS_TENANT_ACCESS",
        { currentTenantId: "tenant1", targetTenantId: "tenant2" },
      );

      const info = error.getIsolationInfo();
      expect(info.isolationCode).toBe("TENANT_DATA_ISOLATION_FAILED");
      expect(info.isolationMessage).toBe("跨租户访问被拒绝");
      expect(info.isolationContext).toEqual({
        currentTenantId: "tenant1",
        targetTenantId: "tenant2",
        violationType: "isolation_validation_failed",
      });
      expect(info.timestamp).toBeDefined();
    });
  });

  describe("异常类型转换", () => {
    it("应该能够转换为不同的租户隔离异常类型", () => {
      // 测试跨租户访问异常
      const crossTenantError = new IsolationValidationError(
        "跨租户访问被拒绝",
        "CROSS_TENANT_ACCESS",
        { currentTenantId: "tenant1", targetTenantId: "tenant2" },
      );

      expect(crossTenantError.errorCode).toBe("TENANT_DATA_ISOLATION_FAILED");

      // 测试数据隔离违规异常
      const dataIsolationError = new IsolationValidationError(
        "数据隔离违规",
        "DATA_ISOLATION_VIOLATION",
        { operation: "read", resource: "user" },
      );

      expect(dataIsolationError.errorCode).toBe("TENANT_DATA_ISOLATION_FAILED");
    });
  });
});
