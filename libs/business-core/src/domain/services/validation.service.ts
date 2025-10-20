/**
 * 验证服务
 *
 * @description 提供通用的数据验证功能，包括格式验证、业务规则验证等
 * @since 1.0.0
 */

import { EntityId } from "@hl8/isolation-model";
// 使用领域层异常体系，不再需要导入common异常
import { ValidationUtils } from "../../common/utils/index.js";

/**
 * 验证结果接口
 */
export interface IValidationResult {
  /** 是否有效 */
  isValid: boolean;
  /** 错误消息列表 */
  errors: string[];
  /** 警告消息列表 */
  warnings: string[];
}

/**
 * 验证规则接口
 */
export interface IValidationRule<T> {
  /** 规则名称 */
  name: string;
  /** 规则描述 */
  description: string;
  /** 验证函数 */
  validate: (value: T) => boolean;
  /** 错误消息 */
  errorMessage: string;
}

/**
 * 验证服务
 *
 * @description 提供通用的数据验证功能
 */
export class ValidationService {
  private static instance: ValidationService;
  private rules: Map<string, IValidationRule<any>[]> = new Map();

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  /**
   * 验证邮箱格式
   *
   * @param email - 邮箱地址
   * @returns 验证结果
   */
  validateEmail(email: string): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!email || !email.trim()) {
      errors.push("邮箱地址不能为空");
      return { isValid: false, errors, warnings };
    }

    if (!ValidationUtils.isValidEmail(email)) {
      errors.push("邮箱格式无效");
    }

    if (email.length > 254) {
      errors.push("邮箱地址长度不能超过254个字符");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证手机号格式
   *
   * @param phone - 手机号
   * @returns 验证结果
   */
  validatePhone(phone: string): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!phone || !phone.trim()) {
      errors.push("手机号不能为空");
      return { isValid: false, errors, warnings };
    }

    if (!ValidationUtils.isValidPhone(phone)) {
      errors.push("手机号格式无效");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证用户名格式
   *
   * @param username - 用户名
   * @returns 验证结果
   */
  validateUsername(username: string): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!username || !username.trim()) {
      errors.push("用户名不能为空");
      return { isValid: false, errors, warnings };
    }

    if (!ValidationUtils.isValidUsername(username)) {
      errors.push("用户名格式无效，只能包含字母、数字和下划线，长度3-50位");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证密码强度
   *
   * @param password - 密码
   * @returns 验证结果
   */
  validatePassword(password: string): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!password || !password.trim()) {
      errors.push("密码不能为空");
      return { isValid: false, errors, warnings };
    }

    if (password.length < 8) {
      errors.push("密码长度不能少于8位");
    }

    if (password.length > 128) {
      errors.push("密码长度不能超过128位");
    }

    if (!ValidationUtils.isStrongPassword(password)) {
      warnings.push("建议使用包含大小写字母、数字和特殊字符的强密码");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证实体ID
   *
   * @param id - 实体ID
   * @returns 验证结果
   */
  validateEntityId(
    id: EntityId | string | null | undefined,
  ): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!id) {
      errors.push("实体ID不能为空");
      return { isValid: false, errors, warnings };
    }

    try {
      if (typeof id === "string") {
        if (id.length === 0) {
          errors.push("实体ID不能为空字符串");
        }
      } else if (id instanceof EntityId) {
        if (!id.getValue() || id.getValue().length === 0) {
          errors.push("实体ID值不能为空");
        }
      }
    } catch (error) {
      errors.push("实体ID格式无效");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证字符串长度
   *
   * @param value - 字符串值
   * @param minLength - 最小长度
   * @param maxLength - 最大长度
   * @param fieldName - 字段名称
   * @returns 验证结果
   */
  validateStringLength(
    value: string,
    minLength: number,
    maxLength: number,
    fieldName: string = "字段",
  ): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!value || !value.trim()) {
      errors.push(`${fieldName}不能为空`);
      return { isValid: false, errors, warnings };
    }

    if (value.length < minLength) {
      errors.push(`${fieldName}长度不能少于${minLength}个字符`);
    }

    if (value.length > maxLength) {
      errors.push(`${fieldName}长度不能超过${maxLength}个字符`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证数字范围
   *
   * @param value - 数字值
   * @param min - 最小值
   * @param max - 最大值
   * @param fieldName - 字段名称
   * @returns 验证结果
   */
  validateNumberRange(
    value: number,
    min: number,
    max: number,
    fieldName: string = "字段",
  ): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof value !== "number" || isNaN(value)) {
      errors.push(`${fieldName}必须是有效数字`);
      return { isValid: false, errors, warnings };
    }

    if (value < min) {
      errors.push(`${fieldName}不能小于${min}`);
    }

    if (value > max) {
      errors.push(`${fieldName}不能大于${max}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证数组长度
   *
   * @param array - 数组
   * @param minLength - 最小长度
   * @param maxLength - 最大长度
   * @param fieldName - 字段名称
   * @returns 验证结果
   */
  validateArrayLength(
    array: any[],
    minLength: number,
    maxLength: number,
    fieldName: string = "数组",
  ): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(array)) {
      errors.push(`${fieldName}必须是数组`);
      return { isValid: false, errors, warnings };
    }

    if (array.length < minLength) {
      errors.push(`${fieldName}长度不能少于${minLength}个元素`);
    }

    if (array.length > maxLength) {
      errors.push(`${fieldName}长度不能超过${maxLength}个元素`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证对象属性
   *
   * @param obj - 对象
   * @param requiredFields - 必需字段列表
   * @param fieldName - 字段名称
   * @returns 验证结果
   */
  validateObjectProperties(
    obj: any,
    requiredFields: string[],
    fieldName: string = "对象",
  ): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!obj || typeof obj !== "object") {
      errors.push(`${fieldName}必须是有效对象`);
      return { isValid: false, errors, warnings };
    }

    for (const field of requiredFields) {
      if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
        errors.push(`${fieldName}缺少必需字段: ${field}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证URL格式
   *
   * @param url - URL地址
   * @returns 验证结果
   */
  validateUrl(url: string): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!url || !url.trim()) {
      errors.push("URL不能为空");
      return { isValid: false, errors, warnings };
    }

    if (!ValidationUtils.isValidUrl(url)) {
      errors.push("URL格式无效");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证IP地址格式
   *
   * @param ip - IP地址
   * @returns 验证结果
   */
  validateIp(ip: string): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!ip || !ip.trim()) {
      errors.push("IP地址不能为空");
      return { isValid: false, errors, warnings };
    }

    if (!ValidationUtils.isValidIP(ip)) {
      errors.push("IP地址格式无效");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证身份证号格式
   *
   * @param idCard - 身份证号
   * @returns 验证结果
   */
  validateIdCard(idCard: string): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!idCard || !idCard.trim()) {
      errors.push("身份证号不能为空");
      return { isValid: false, errors, warnings };
    }

    if (!ValidationUtils.isValidIdCard(idCard)) {
      errors.push("身份证号格式无效");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 添加验证规则
   *
   * @param fieldName - 字段名称
   * @param rule - 验证规则
   */
  addRule<T>(fieldName: string, rule: IValidationRule<T>): void {
    if (!this.rules.has(fieldName)) {
      this.rules.set(fieldName, []);
    }
    this.rules.get(fieldName)!.push(rule);
  }

  /**
   * 移除验证规则
   *
   * @param fieldName - 字段名称
   * @param ruleName - 规则名称
   */
  removeRule(fieldName: string, ruleName: string): void {
    const rules = this.rules.get(fieldName);
    if (rules) {
      const index = rules.findIndex((rule) => rule.name === ruleName);
      if (index !== -1) {
        rules.splice(index, 1);
      }
    }
  }

  /**
   * 验证字段
   *
   * @param fieldName - 字段名称
   * @param value - 字段值
   * @returns 验证结果
   */
  validateField(fieldName: string, value: any): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const rules = this.rules.get(fieldName);
    if (rules) {
      for (const rule of rules) {
        if (!rule.validate(value)) {
          errors.push(rule.errorMessage);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证多个字段
   *
   * @param fields - 字段值映射
   * @returns 验证结果
   */
  validateFields(fields: Record<string, any>): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [fieldName, value] of Object.entries(fields)) {
      const result = this.validateField(fieldName, value);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 清除所有验证规则
   */
  clearRules(): void {
    this.rules.clear();
  }

  /**
   * 获取字段的验证规则
   *
   * @param fieldName - 字段名称
   * @returns 验证规则列表
   */
  getRules(fieldName: string): IValidationRule<any>[] {
    return this.rules.get(fieldName) || [];
  }

  /**
   * 获取所有验证规则
   *
   * @returns 所有验证规则映射
   */
  getAllRules(): Map<string, IValidationRule<any>[]> {
    return new Map(this.rules);
  }
}
