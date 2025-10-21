/**
 * 用户注册业务规则
 * @description 验证用户注册的业务规则和约束条件
 *
 * @since 1.0.0
 */

import { BusinessRuleValidator, BusinessRuleValidationResult } from "./business-rule-validator.js";

/**
 * 用户注册业务规则验证器
 */
export class UserRegistrationBusinessRule extends BusinessRuleValidator {
  validate(context: any): BusinessRuleValidationResult {
    const errors: BusinessRuleValidationError[] = [];
    const warnings: BusinessRuleValidationWarning[] = [];

    // 从上下文中获取用户数据
    const userData = context.userData;
    if (!userData) {
      errors.push({
        code: 'MISSING_USER_DATA',
        message: '用户数据不能为空',
        field: 'userData'
      });
      return { isValid: false, errors, warnings };
    }

    // 验证邮箱格式
    if (!this.isValidEmail(userData.email)) {
      errors.push({
        code: 'INVALID_EMAIL_FORMAT',
        message: '邮箱格式无效',
        field: 'email',
        context: { email: userData.email }
      });
    }

    // 验证用户名
    if (!this.isValidUsername(userData.username)) {
      errors.push({
        code: 'INVALID_USERNAME',
        message: '用户名格式无效',
        field: 'username',
        context: { username: userData.username }
      });
    }

    // 验证密码强度
    const passwordValidation = this.validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      errors.push({
        code: 'WEAK_PASSWORD',
        message: passwordValidation.message,
        field: 'password'
      });
    }

    // 验证年龄（如果提供）
    if (userData.age !== undefined) {
      if (userData.age < 0 || userData.age > 150) {
        errors.push({
          code: 'INVALID_AGE',
          message: '年龄必须在0-150岁之间',
          field: 'age',
          context: { age: userData.age }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  getRuleName(): string {
    return 'UserRegistrationBusinessRule';
  }

  getRuleDescription(): string {
    return '验证用户注册的业务规则和约束条件';
  }

  isApplicable(context: any): boolean {
    return context.operation === 'user_registration';
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUsername(username: string): boolean {
    if (!username || username.length < 3 || username.length > 50) {
      return false;
    }
    
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(username) && !/^\d/.test(username);
  }

  private validatePasswordStrength(password: string): { isValid: boolean; message: string } {
    if (!password || password.length < 8) {
      return { isValid: false, message: '密码长度至少8个字符' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return { 
        isValid: false, 
        message: '密码必须包含大小写字母、数字和特殊字符' 
      };
    }

    return { isValid: true, message: '' };
  }
}

// 导入类型定义
import type { BusinessRuleValidationError, BusinessRuleValidationWarning } from "./business-rule-validator.js";
