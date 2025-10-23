/**
 * 领域层异常测试
 * @description 测试领域层异常的功能
 *
 * @since 2.1.0
 */
import { DomainBusinessRuleViolationException } from "./business-rule-violation.exception.js";
import { DomainValidationException } from "./validation.exception.js";
import { DomainTenantIsolationException } from "./tenant-isolation.exception.js";
import { DomainExceptionFactory } from "./index.js";

describe("Domain Layer Exceptions", () => {
  describe("DomainBusinessRuleViolationException", () => {
    it("应该创建业务规则违规异常", () => {
      const exception = new DomainBusinessRuleViolationException(
        "INVALID_EMAIL",
        "邮箱格式无效",
        { email: "invalid-email" },
      );

      expect(exception.errorCode).toBe("BUSINESS_RULE_VIOLATION");
      expect(exception.detail).toBe("邮箱格式无效");
      expect(exception.status).toBe(422);
      expect(exception.data).toEqual({
        ruleCode: "INVALID_EMAIL",
        email: "invalid-email",
      });
    });

    it("应该返回业务规则信息", () => {
      const exception = new DomainBusinessRuleViolationException(
        "INVALID_EMAIL",
        "邮箱格式无效",
        { email: "invalid-email" },
      );

      const info = exception.getBusinessRuleInfo();
      expect(info.ruleCode).toBe("INVALID_EMAIL");
      expect(info.ruleMessage).toBe("邮箱格式无效");
      expect(info.violationContext).toEqual({
        ruleCode: "INVALID_EMAIL",
        email: "invalid-email",
      });
      expect(info.timestamp).toBeDefined();
    });
  });

  describe("DomainValidationException", () => {
    it("应该创建验证异常", () => {
      const exception = new DomainValidationException("email", "邮箱格式无效", {
        providedValue: "invalid-email",
      });

      expect(exception.errorCode).toBe("VALIDATION_FAILED_EMAIL");
      expect(exception.detail).toBe("邮箱格式无效");
      expect(exception.status).toBe(400);
      expect(exception.data).toEqual({
        field: "email",
        providedValue: "invalid-email",
      });
    });

    it("应该返回验证信息", () => {
      const exception = new DomainValidationException("email", "邮箱格式无效", {
        providedValue: "invalid-email",
      });

      const info = exception.getValidationInfo();
      expect(info.field).toBe("email");
      expect(info.message).toBe("邮箱格式无效");
      expect(info.validationContext).toEqual({
        field: "email",
        providedValue: "invalid-email",
      });
      expect(info.timestamp).toBeDefined();
    });
  });

  describe("DomainTenantIsolationException", () => {
    it("应该创建租户隔离异常", () => {
      const exception = new DomainTenantIsolationException(
        "跨租户访问被拒绝",
        "CROSS_TENANT_ACCESS",
        { currentTenantId: "tenant1", targetTenantId: "tenant2" },
      );

      expect(exception.errorCode).toBe("CROSS_TENANT_ACCESS");
      expect(exception.detail).toBe("跨租户访问被拒绝");
      expect(exception.status).toBe(403);
      expect(exception.data).toEqual({
        currentTenantId: "tenant1",
        targetTenantId: "tenant2",
      });
    });

    it("应该返回租户隔离信息", () => {
      const exception = new DomainTenantIsolationException(
        "跨租户访问被拒绝",
        "CROSS_TENANT_ACCESS",
        { currentTenantId: "tenant1", targetTenantId: "tenant2" },
      );

      const info = exception.getTenantIsolationInfo();
      expect(info.isolationCode).toBe("CROSS_TENANT_ACCESS");
      expect(info.isolationMessage).toBe("跨租户访问被拒绝");
      expect(info.tenantContext).toEqual({
        currentTenantId: "tenant1",
        targetTenantId: "tenant2",
      });
      expect(info.timestamp).toBeDefined();
    });
  });

  describe("DomainExceptionFactory", () => {
    it("应该创建业务规则违规异常", () => {
      const exception = DomainExceptionFactory.createBusinessRuleViolation(
        "INVALID_EMAIL",
        "邮箱格式无效",
        { email: "invalid-email" },
      );

      expect(exception).toBeInstanceOf(DomainBusinessRuleViolationException);
      expect(exception.errorCode).toBe("BUSINESS_RULE_VIOLATION");
    });

    it("应该创建验证异常", () => {
      const exception = DomainExceptionFactory.createValidation(
        "email",
        "邮箱格式无效",
        { providedValue: "invalid-email" },
      );

      expect(exception).toBeInstanceOf(DomainValidationException);
      expect(exception.errorCode).toBe("VALIDATION_FAILED_EMAIL");
    });

    it("应该创建租户隔离异常", () => {
      const exception = DomainExceptionFactory.createTenantIsolation(
        "跨租户访问被拒绝",
        "CROSS_TENANT_ACCESS",
        { currentTenantId: "tenant1", targetTenantId: "tenant2" },
      );

      expect(exception).toBeInstanceOf(DomainTenantIsolationException);
      expect(exception.errorCode).toBe("CROSS_TENANT_ACCESS");
    });
  });
});
