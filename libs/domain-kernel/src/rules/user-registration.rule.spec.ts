/**
 * 用户注册业务规则测试
 * @description 测试用户注册业务规则的异常抛出功能
 *
 * @since 1.1.0
 */
import {
  UserRegistrationBusinessRule,
  UserRegistrationContext,
} from "./user-registration.rule.js";
import { BusinessRuleViolationException } from "../exceptions/business-rule.exception.js";

describe("UserRegistrationBusinessRule", () => {
  let validator: UserRegistrationBusinessRule;

  beforeEach(() => {
    validator = new UserRegistrationBusinessRule();
  });

  describe("异常抛出功能", () => {
    it("应该验证成功时不抛出异常", () => {
      const context: UserRegistrationContext = {
        operation: "user_registration",
        userData: {
          email: "test@example.com",
          username: "testuser",
          password: "TestPass123!",
          age: 25,
        },
      };

      expect(() => {
        validator.validateUserRegistrationAndThrow(context);
      }).not.toThrow();
    });

    it("应该在缺少用户数据时抛出异常", () => {
      const context: UserRegistrationContext = {
        operation: "user_registration",
        // 没有提供 userData
      };

      expect(() => {
        validator.validateUserRegistrationAndThrow(context);
      }).toThrow();

      try {
        validator.validateUserRegistrationAndThrow(context);
        fail("应该抛出异常");
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.detail).toBe("用户数据不能为空");
        expect(error.errorCode).toBe("BUSINESS_RULE_VIOLATION");
      }
    });

    it("应该在邮箱格式无效时抛出异常", () => {
      const context: UserRegistrationContext = {
        operation: "user_registration",
        userData: {
          email: "invalid-email",
          username: "testuser",
          password: "TestPass123!",
          age: 25,
        },
      };

      expect(() => {
        validator.validateUserRegistrationAndThrow(context);
      }).toThrow();

      try {
        validator.validateUserRegistrationAndThrow(context);
        fail("应该抛出异常");
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.detail).toBe("邮箱格式无效");
        expect(error.errorCode).toBe("BUSINESS_RULE_VIOLATION");
      }
    });

    it("应该在密码强度不足时抛出异常", () => {
      const context: UserRegistrationContext = {
        operation: "user_registration",
        userData: {
          email: "test@example.com",
          username: "testuser",
          password: "weak",
          age: 25,
        },
      };

      expect(() => {
        validator.validateUserRegistrationAndThrow(context);
      }).toThrow();

      try {
        validator.validateUserRegistrationAndThrow(context);
        fail("应该抛出异常");
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.detail).toBe("密码长度至少8个字符");
        expect(error.errorCode).toBe("BUSINESS_RULE_VIOLATION");
      }
    });
  });

  describe("异常返回功能", () => {
    it("应该验证成功时返回 null", () => {
      const context: UserRegistrationContext = {
        operation: "user_registration",
        userData: {
          email: "test@example.com",
          username: "testuser",
          password: "TestPass123!",
          age: 25,
        },
      };

      const exception =
        validator.validateUserRegistrationAndReturnException(context);
      expect(exception).toBeNull();
    });

    it("应该在验证失败时返回异常", () => {
      const context: UserRegistrationContext = {
        operation: "user_registration",
        userData: {
          email: "invalid-email",
          username: "testuser",
          password: "TestPass123!",
          age: 25,
        },
      };

      const exception =
        validator.validateUserRegistrationAndReturnException(context);
      expect(exception).toBeDefined();
      expect(exception?.detail).toBe("邮箱格式无效");
      expect(exception?.errorCode).toBe("BUSINESS_RULE_VIOLATION");
    });
  });

  describe("异常转换功能", () => {
    it("应该支持 RFC7807 格式转换", () => {
      const context: UserRegistrationContext = {
        operation: "user_registration",
        userData: {
          email: "invalid-email",
          username: "testuser",
          password: "TestPass123!",
          age: 25,
        },
      };

      const exception =
        validator.validateUserRegistrationAndReturnException(context);
      expect(exception).toBeDefined();

      const rfc7807 = exception?.toRFC7807();
      expect(rfc7807).toBeDefined();
      expect(rfc7807?.type).toBe(
        "https://docs.hl8.com/errors#BUSINESS_RULE_VIOLATION",
      );
      expect(rfc7807?.errorCode).toBe("BUSINESS_RULE_VIOLATION");
    });
  });
});
