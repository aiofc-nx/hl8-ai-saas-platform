/**
 * 业务规则模块导出
 * @description 导出所有业务规则验证器和管理器
 *
 * @since 1.0.0
 */

// 基础业务规则组件
export {
  BusinessRuleValidator,
  BusinessRuleManager,
  BusinessRules,
  type BusinessRuleValidationResult,
  type BusinessRuleValidationError,
  type BusinessRuleValidationWarning,
} from "./business-rule-validator.js";

// 具体业务规则验证器
export { UserRegistrationBusinessRule } from "./user-registration.rule.js";
export { OrderCreationBusinessRule } from "./order-creation.rule.js";
export { UserStateBusinessRule } from "./user-state.rule.js";

// 导入类型用于工厂类
import { BusinessRuleManager } from "./business-rule-validator.js";
import { UserRegistrationBusinessRule } from "./user-registration.rule.js";
import { OrderCreationBusinessRule } from "./order-creation.rule.js";
import { UserStateBusinessRule } from "./user-state.rule.js";

// 业务规则工厂
export class BusinessRuleFactory {
  /**
   * 创建用户注册业务规则验证器
   */
  static createUserRegistrationRule(): UserRegistrationBusinessRule {
    return new UserRegistrationBusinessRule();
  }

  /**
   * 创建订单创建业务规则验证器
   */
  static createOrderCreationRule(): OrderCreationBusinessRule {
    return new OrderCreationBusinessRule();
  }

  /**
   * 创建用户状态业务规则验证器
   */
  static createUserStateRule(): UserStateBusinessRule {
    return new UserStateBusinessRule();
  }

  /**
   * 创建默认业务规则管理器
   */
  static createDefaultManager(): BusinessRuleManager {
    const manager = new BusinessRuleManager();

    // 注册默认的业务规则
    manager.registerValidator(this.createUserRegistrationRule());
    manager.registerValidator(this.createOrderCreationRule());
    manager.registerValidator(this.createUserStateRule());

    return manager;
  }
}
