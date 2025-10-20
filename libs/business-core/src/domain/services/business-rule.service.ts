/**
 * 业务规则服务
 *
 * @description 提供业务规则的管理和验证功能
 * @since 1.0.0
 */

import { EntityId } from "@hl8/domain-kernel";
import { BusinessRuleException } from "../exceptions/base/base-domain-exception.js";
import { ErrorCodes } from "../../common/constants/index.js";

/**
 * 业务规则接口
 */
export interface IBusinessRule<T> {
  /** 规则名称 */
  name: string;
  /** 规则描述 */
  description: string;
  /** 规则优先级 */
  priority: number;
  /** 检查规则是否满足 */
  isSatisfiedBy(entity: T): boolean;
  /** 获取错误消息 */
  getErrorMessage(entity: T): string;
}

/**
 * 业务规则管理器接口
 */
export interface IBusinessRuleManager<T> {
  /** 添加规则 */
  addRule(rule: IBusinessRule<T>): void;
  /** 移除规则 */
  removeRule(ruleName: string): void;
  /** 验证所有规则 */
  validateAll(entity: T): IValidationResult;
  /** 验证指定规则 */
  validateRule(ruleName: string, entity: T): IValidationResult;
}

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
 * 业务规则服务
 *
 * @description 提供业务规则的管理和验证功能
 */
export class BusinessRuleService<T> implements IBusinessRuleManager<T> {
  private rules: Map<string, IBusinessRule<T>> = new Map();

  /**
   * 添加业务规则
   *
   * @param rule - 业务规则
   */
  addRule(rule: IBusinessRule<T>): void {
    this.rules.set(rule.name, rule);
  }

  /**
   * 移除业务规则
   *
   * @param ruleName - 规则名称
   */
  removeRule(ruleName: string): void {
    this.rules.delete(ruleName);
  }

  /**
   * 验证所有规则
   *
   * @param entity - 实体对象
   * @returns 验证结果
   */
  validateAll(entity: T): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 按优先级排序规则
    const sortedRules = Array.from(this.rules.values()).sort(
      (a, b) => b.priority - a.priority,
    );

    for (const rule of sortedRules) {
      if (!rule.isSatisfiedBy(entity)) {
        errors.push(rule.getErrorMessage(entity));
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证指定规则
   *
   * @param ruleName - 规则名称
   * @param entity - 实体对象
   * @returns 验证结果
   */
  validateRule(ruleName: string, entity: T): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const rule = this.rules.get(ruleName);
    if (!rule) {
      errors.push(`规则 ${ruleName} 不存在`);
      return { isValid: false, errors, warnings };
    }

    if (!rule.isSatisfiedBy(entity)) {
      errors.push(rule.getErrorMessage(entity));
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 获取所有规则
   *
   * @returns 所有规则
   */
  getAllRules(): IBusinessRule<T>[] {
    return Array.from(this.rules.values());
  }

  /**
   * 获取规则数量
   *
   * @returns 规则数量
   */
  getRuleCount(): number {
    return this.rules.size;
  }

  /**
   * 检查规则是否存在
   *
   * @param ruleName - 规则名称
   * @returns 是否存在
   */
  hasRule(ruleName: string): boolean {
    return this.rules.has(ruleName);
  }

  /**
   * 清除所有规则
   */
  clearRules(): void {
    this.rules.clear();
  }
}

/**
 * 租户业务规则
 */
export class TenantBusinessRule implements IBusinessRule<any> {
  name = "TenantBusinessRule";
  description = "租户业务规则";
  priority = 100;

  isSatisfiedBy(entity: any): boolean {
    // 检查租户名称是否为空
    if (!entity.name || !entity.name.trim()) {
      return false;
    }

    // 检查租户名称长度
    if (entity.name.trim().length > 100) {
      return false;
    }

    // 检查租户类型是否有效
    if (!entity.type) {
      return false;
    }

    return true;
  }

  getErrorMessage(entity: any): string {
    if (!entity.name || !entity.name.trim()) {
      return "租户名称不能为空";
    }
    if (entity.name.trim().length > 100) {
      return "租户名称长度不能超过100个字符";
    }
    if (!entity.type) {
      return "租户类型不能为空";
    }
    return "租户业务规则验证失败";
  }
}

/**
 * 用户业务规则
 */
export class UserBusinessRule implements IBusinessRule<any> {
  name = "UserBusinessRule";
  description = "用户业务规则";
  priority = 100;

  isSatisfiedBy(entity: any): boolean {
    // 检查用户名是否为空
    if (!entity.username || !entity.username.trim()) {
      return false;
    }

    // 检查邮箱是否为空
    if (!entity.email || !entity.email.trim()) {
      return false;
    }

    // 检查用户名长度
    if (
      entity.username.trim().length < 3 ||
      entity.username.trim().length > 50
    ) {
      return false;
    }

    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(entity.email)) {
      return false;
    }

    return true;
  }

  getErrorMessage(entity: any): string {
    if (!entity.username || !entity.username.trim()) {
      return "用户名不能为空";
    }
    if (
      entity.username.trim().length < 3 ||
      entity.username.trim().length > 50
    ) {
      return "用户名长度必须在3-50个字符之间";
    }
    if (!entity.email || !entity.email.trim()) {
      return "邮箱不能为空";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(entity.email)) {
      return "邮箱格式无效";
    }
    return "用户业务规则验证失败";
  }
}

/**
 * 组织业务规则
 */
export class OrganizationBusinessRule implements IBusinessRule<any> {
  name = "OrganizationBusinessRule";
  description = "组织业务规则";
  priority = 100;

  isSatisfiedBy(entity: any): boolean {
    // 检查组织名称是否为空
    if (!entity.name || !entity.name.trim()) {
      return false;
    }

    // 检查组织名称长度
    if (entity.name.trim().length > 100) {
      return false;
    }

    // 检查组织类型是否有效
    if (!entity.type) {
      return false;
    }

    return true;
  }

  getErrorMessage(entity: any): string {
    if (!entity.name || !entity.name.trim()) {
      return "组织名称不能为空";
    }
    if (entity.name.trim().length > 100) {
      return "组织名称长度不能超过100个字符";
    }
    if (!entity.type) {
      return "组织类型不能为空";
    }
    return "组织业务规则验证失败";
  }
}

/**
 * 部门业务规则
 */
export class DepartmentBusinessRule implements IBusinessRule<any> {
  name = "DepartmentBusinessRule";
  description = "部门业务规则";
  priority = 100;

  isSatisfiedBy(entity: any): boolean {
    // 检查部门名称是否为空
    if (!entity.name || !entity.name.trim()) {
      return false;
    }

    // 检查部门名称长度
    if (entity.name.trim().length > 100) {
      return false;
    }

    // 检查部门层级是否有效
    if (!entity.level || entity.level < 1 || entity.level > 8) {
      return false;
    }

    return true;
  }

  getErrorMessage(entity: any): string {
    if (!entity.name || !entity.name.trim()) {
      return "部门名称不能为空";
    }
    if (entity.name.trim().length > 100) {
      return "部门名称长度不能超过100个字符";
    }
    if (!entity.level || entity.level < 1 || entity.level > 8) {
      return "部门层级必须在1-8之间";
    }
    return "部门业务规则验证失败";
  }
}

/**
 * 角色业务规则
 */
export class RoleBusinessRule implements IBusinessRule<any> {
  name = "RoleBusinessRule";
  description = "角色业务规则";
  priority = 100;

  isSatisfiedBy(entity: any): boolean {
    // 检查角色名称是否为空
    if (!entity.name || !entity.name.trim()) {
      return false;
    }

    // 检查角色名称长度
    if (entity.name.trim().length > 100) {
      return false;
    }

    // 检查角色类型是否有效
    if (!entity.type) {
      return false;
    }

    // 检查权限动作是否为空
    if (!entity.actions || entity.actions.length === 0) {
      return false;
    }

    return true;
  }

  getErrorMessage(entity: any): string {
    if (!entity.name || !entity.name.trim()) {
      return "角色名称不能为空";
    }
    if (entity.name.trim().length > 100) {
      return "角色名称长度不能超过100个字符";
    }
    if (!entity.type) {
      return "角色类型不能为空";
    }
    if (!entity.actions || entity.actions.length === 0) {
      return "角色必须至少有一个权限动作";
    }
    return "角色业务规则验证失败";
  }
}

/**
 * 权限业务规则
 */
export class PermissionBusinessRule implements IBusinessRule<any> {
  name = "PermissionBusinessRule";
  description = "权限业务规则";
  priority = 100;

  isSatisfiedBy(entity: any): boolean {
    // 检查权限名称是否为空
    if (!entity.name || !entity.name.trim()) {
      return false;
    }

    // 检查权限名称长度
    if (entity.name.trim().length > 100) {
      return false;
    }

    // 检查权限类型是否有效
    if (!entity.type) {
      return false;
    }

    // 检查权限动作是否有效
    if (!entity.action) {
      return false;
    }

    // 检查资源标识是否为空
    if (!entity.resource || !entity.resource.trim()) {
      return false;
    }

    return true;
  }

  getErrorMessage(entity: any): string {
    if (!entity.name || !entity.name.trim()) {
      return "权限名称不能为空";
    }
    if (entity.name.trim().length > 100) {
      return "权限名称长度不能超过100个字符";
    }
    if (!entity.type) {
      return "权限类型不能为空";
    }
    if (!entity.action) {
      return "权限动作不能为空";
    }
    if (!entity.resource || !entity.resource.trim()) {
      return "资源标识不能为空";
    }
    return "权限业务规则验证失败";
  }
}

/**
 * 业务规则工厂
 */
export class BusinessRuleFactory {
  /**
   * 创建租户业务规则管理器
   *
   * @returns 租户业务规则管理器
   */
  static createTenantManager(): BusinessRuleService<any> {
    const manager = new BusinessRuleService<any>();
    manager.addRule(new TenantBusinessRule());
    return manager;
  }

  /**
   * 创建用户业务规则管理器
   *
   * @returns 用户业务规则管理器
   */
  static createUserManager(): BusinessRuleService<any> {
    const manager = new BusinessRuleService<any>();
    manager.addRule(new UserBusinessRule());
    return manager;
  }

  /**
   * 创建组织业务规则管理器
   *
   * @returns 组织业务规则管理器
   */
  static createOrganizationManager(): BusinessRuleService<any> {
    const manager = new BusinessRuleService<any>();
    manager.addRule(new OrganizationBusinessRule());
    return manager;
  }

  /**
   * 创建部门业务规则管理器
   *
   * @returns 部门业务规则管理器
   */
  static createDepartmentManager(): BusinessRuleService<any> {
    const manager = new BusinessRuleService<any>();
    manager.addRule(new DepartmentBusinessRule());
    return manager;
  }

  /**
   * 创建角色业务规则管理器
   *
   * @returns 角色业务规则管理器
   */
  static createRoleManager(): BusinessRuleService<any> {
    const manager = new BusinessRuleService<any>();
    manager.addRule(new RoleBusinessRule());
    return manager;
  }

  /**
   * 创建权限业务规则管理器
   *
   * @returns 权限业务规则管理器
   */
  static createPermissionManager(): BusinessRuleService<any> {
    const manager = new BusinessRuleService<any>();
    manager.addRule(new PermissionBusinessRule());
    return manager;
  }
}
