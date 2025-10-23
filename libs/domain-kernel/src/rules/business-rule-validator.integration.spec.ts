/**
 * 业务规则验证器集成测试
 * @description 测试业务规则验证器与异常处理的集成
 *
 * @since 1.1.0
 */
import {
  BusinessRuleManager,
  BusinessRuleValidator,
  BusinessRuleValidationResult,
} from "./business-rule-validator.js";
import { DomainBusinessRuleViolationException } from "/home/arligle/hl8/hl8-ai-saas-platform/libs/exceptions/dist/core/domain/index.js";

// 测试用的业务规则验证器
class TestBusinessRuleValidator extends BusinessRuleValidator<{
  operation: string;
  data?: any;
}> {
  validate(context: {
    operation: string;
    data?: any;
  }): BusinessRuleValidationResult {
    const errors = [];
    const warnings = [];

    if (context.operation === "test_validation") {
      if (!context.data) {
        errors.push({
          code: "MISSING_DATA",
          message: "数据不能为空",
          field: "data",
        });
      } else if (context.data.value < 0) {
        errors.push({
          code: "INVALID_VALUE",
          message: "值必须大于等于0",
          field: "value",
          context: { providedValue: context.data.value },
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  getRuleName(): string {
    return "TestBusinessRule";
  }

  getRuleDescription(): string {
    return "测试业务规则";
  }
}

describe("BusinessRuleValidator Integration", () => {
  let validator: TestBusinessRuleValidator;
  let manager: BusinessRuleManager<{ operation: string; data?: any }>;

  beforeEach(() => {
    validator = new TestBusinessRuleValidator();
    manager = new BusinessRuleManager();
    manager.registerValidator(validator);
  });

  describe("validateAndThrow", () => {
    it("应该验证成功时不抛出异常", () => {
      const context = {
        operation: "test_validation",
        data: { value: 10 },
      };

      expect(() => {
        validator.validateAndThrow(context);
      }).not.toThrow();
    });

    it("应该验证失败时抛出异常", () => {
      const context = {
        operation: "test_validation",
        data: { value: -5 },
      };

      expect(() => {
        validator.validateAndThrow(context);
      }).toThrow(DomainBusinessRuleViolationException);
    });

    it("应该抛出正确的异常信息", () => {
      const context = {
        operation: "test_validation",
        data: { value: -5 },
      };

      try {
        validator.validateAndThrow(context);
        fail("应该抛出异常");
      } catch (error) {
        expect(error).toBeInstanceOf(DomainBusinessRuleViolationException);
        if (error instanceof DomainBusinessRuleViolationException) {
          expect(error.errorCode).toBe("BUSINESS_RULE_VIOLATION");
          expect(error.detail).toBe("值必须大于等于0");
          expect(error.data).toEqual({
            ruleCode: "INVALID_VALUE",
            providedValue: -5,
          });
        }
      }
    });
  });

  describe("validateAndReturnException", () => {
    it("应该验证成功时返回 null", () => {
      const context = {
        operation: "test_validation",
        data: { value: 10 },
      };

      const exception = validator.validateAndReturnException(context);
      expect(exception).toBeNull();
    });

    it("应该验证失败时返回异常", () => {
      const context = {
        operation: "test_validation",
        data: { value: -5 },
      };

      const exception = validator.validateAndReturnException(context);
      expect(exception).toBeInstanceOf(DomainBusinessRuleViolationException);
      expect(exception?.errorCode).toBe("BUSINESS_RULE_VIOLATION");
      expect(exception?.detail).toBe("值必须大于等于0");
    });
  });

  describe("BusinessRuleManager Integration", () => {
    describe("validateAllAndThrow", () => {
      it("应该验证成功时不抛出异常", () => {
        const context = {
          operation: "test_validation",
          data: { value: 10 },
        };

        expect(() => {
          manager.validateAllAndThrow(context);
        }).not.toThrow();
      });

      it("应该验证失败时抛出异常", () => {
        const context = {
          operation: "test_validation",
          data: { value: -5 },
        };

        expect(() => {
          manager.validateAllAndThrow(context);
        }).toThrow(DomainBusinessRuleViolationException);
      });
    });

    describe("validateAllAndReturnExceptions", () => {
      it("应该验证成功时返回空数组", () => {
        const context = {
          operation: "test_validation",
          data: { value: 10 },
        };

        const exceptions = manager.validateAllAndReturnExceptions(context);
        expect(exceptions).toHaveLength(0);
      });

      it("应该验证失败时返回异常数组", () => {
        const context = {
          operation: "test_validation",
          data: { value: -5 },
        };

        const exceptions = manager.validateAllAndReturnExceptions(context);
        expect(exceptions).toHaveLength(1);
        expect(exceptions[0]).toBeInstanceOf(
          DomainBusinessRuleViolationException,
        );
        expect(exceptions[0].errorCode).toBe("BUSINESS_RULE_VIOLATION");
      });

      it("应该返回多个异常", () => {
        const context = {
          operation: "test_validation",
          // 没有提供 data，会触发 MISSING_DATA 错误
        };

        const exceptions = manager.validateAllAndReturnExceptions(context);
        expect(exceptions).toHaveLength(1);
        expect(exceptions[0].errorCode).toBe("BUSINESS_RULE_VIOLATION");
      });
    });
  });

  describe("异常转换", () => {
    it("应该支持 RFC7807 格式转换", () => {
      const context = {
        operation: "test_validation",
        data: { value: -5 },
      };

      const exception = validator.validateAndReturnException(context);
      expect(exception).toBeInstanceOf(DomainBusinessRuleViolationException);

      const rfc7807 = exception?.toRFC7807();
      expect(rfc7807).toBeDefined();
      expect(rfc7807?.type).toBe(
        "https://docs.hl8.com/errors#BUSINESS_RULE_VIOLATION",
      );
      expect(rfc7807?.status).toBe(422);
      expect(rfc7807?.errorCode).toBe("BUSINESS_RULE_VIOLATION");
    });
  });
});
