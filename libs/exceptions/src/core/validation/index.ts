/**
 * 数据验证异常导出
 *
 * @description 导出所有数据验证相关的异常类
 */

// 异常基类
export { ValidationException } from "./validation.exception.js";

// 验证异常
export { ValidationFailedException } from "./validation-failed.exception.js";
export { BusinessRuleViolationException } from "./business-rule-violation.exception.js";
export { ConstraintViolationException } from "./constraint-violation.exception.js";
