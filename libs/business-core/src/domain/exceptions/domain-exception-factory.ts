/**
 * 简化的异常工厂
 *
 * @description 6层异常体系的统一创建接口
 * @since 2.0.0
 */

import {
  BusinessRuleException,
  ValidationException,
  StateException,
  PermissionException,
  ConcurrencyException,
  NotFoundException,
} from "./domain-exceptions.js";

/**
 * 简化的异常工厂
 *
 * @description 提供6个核心异常类型的创建方法
 */
export class DomainExceptionFactory {
  private static instance: DomainExceptionFactory;

  private constructor() {}

  /**
   * 获取单例实例
   *
   * @returns 异常工厂实例
   */
  static getInstance(): DomainExceptionFactory {
    if (!DomainExceptionFactory.instance) {
      DomainExceptionFactory.instance = new DomainExceptionFactory();
    }
    return DomainExceptionFactory.instance;
  }

  /**
   * 创建业务规则异常
   *
   * @param message - 异常消息
   * @param ruleName - 规则名称
   * @param context - 上下文信息
   * @returns 业务规则异常
   */
  createBusinessRuleViolation(
    message: string,
    ruleName: string,
    context: Record<string, unknown> = {},
  ): BusinessRuleException {
    return new BusinessRuleException(message, ruleName, context);
  }

  /**
   * 创建验证异常
   *
   * @param message - 异常消息
   * @param fieldName - 字段名称
   * @param fieldValue - 字段值
   * @param context - 上下文信息
   * @returns 验证异常
   */
  createValidationError(
    message: string,
    fieldName: string,
    fieldValue: unknown,
    context: Record<string, unknown> = {},
  ): ValidationException {
    return new ValidationException(message, fieldName, fieldValue, context);
  }

  /**
   * 创建状态异常
   *
   * @param message - 异常消息
   * @param currentState - 当前状态
   * @param requestedOperation - 请求的操作
   * @param context - 上下文信息
   * @returns 状态异常
   */
  createStateError(
    message: string,
    currentState: string,
    requestedOperation: string,
    context: Record<string, unknown> = {},
  ): StateException {
    return new StateException(
      message,
      currentState,
      requestedOperation,
      context,
    );
  }

  /**
   * 创建权限异常
   *
   * @param message - 异常消息
   * @param requiredPermission - 所需权限
   * @param resource - 资源
   * @param context - 上下文信息
   * @returns 权限异常
   */
  createPermissionError(
    message: string,
    requiredPermission: string,
    resource: string,
    context: Record<string, unknown> = {},
  ): PermissionException {
    return new PermissionException(
      message,
      requiredPermission,
      resource,
      context,
    );
  }

  /**
   * 创建并发异常
   *
   * @param message - 异常消息
   * @param resourceId - 资源ID
   * @param expectedVersion - 期望版本
   * @param actualVersion - 实际版本
   * @param context - 上下文信息
   * @returns 并发异常
   */
  createConcurrencyError(
    message: string,
    resourceId: string,
    expectedVersion: number,
    actualVersion: number,
    context: Record<string, unknown> = {},
  ): ConcurrencyException {
    return new ConcurrencyException(
      message,
      resourceId,
      expectedVersion,
      actualVersion,
      context,
    );
  }

  /**
   * 创建未找到异常
   *
   * @param message - 异常消息
   * @param resourceType - 资源类型
   * @param resourceId - 资源ID
   * @param context - 上下文信息
   * @returns 未找到异常
   */
  createNotFoundError(
    message: string,
    resourceType: string,
    resourceId: string,
    context: Record<string, unknown> = {},
  ): NotFoundException {
    return new NotFoundException(message, resourceType, resourceId, context);
  }

  // 便捷方法：租户相关异常

  /**
   * 创建租户名称已存在异常
   *
   * @param tenantName - 租户名称
   * @param existingTenantId - 已存在的租户ID
   * @returns 业务规则异常
   */
  createTenantNameAlreadyExists(
    tenantName: string,
    existingTenantId: string,
  ): BusinessRuleException {
    return this.createBusinessRuleViolation(
      `租户名称 "${tenantName}" 已存在`,
      "TENANT_NAME_UNIQUE",
      { tenantName, existingTenantId, entity: "Tenant" },
    );
  }

  /**
   * 创建无效租户类型异常
   *
   * @param tenantType - 租户类型
   * @returns 验证异常
   */
  createInvalidTenantType(tenantType: string): ValidationException {
    return this.createValidationError(
      `无效的租户类型: ${tenantType}`,
      "type",
      tenantType,
      { entity: "Tenant" },
    );
  }

  /**
   * 创建无效租户名称异常
   *
   * @param tenantName - 租户名称
   * @param reason - 失败原因
   * @returns 验证异常
   */
  createInvalidTenantName(
    tenantName: string,
    reason: string,
  ): ValidationException {
    return this.createValidationError(
      `租户名称无效: ${reason}`,
      "name",
      tenantName,
      { entity: "Tenant" },
    );
  }

  /**
   * 创建租户状态异常
   *
   * @param currentState - 当前状态
   * @param requestedOperation - 请求的操作
   * @param tenantId - 租户ID
   * @returns 状态异常
   */
  createTenantStateError(
    currentState: string,
    requestedOperation: string,
    tenantId: string,
  ): StateException {
    return this.createStateError(
      `租户状态 "${currentState}" 不允许执行 "${requestedOperation}" 操作`,
      currentState,
      requestedOperation,
      { tenantId, entity: "Tenant" },
    );
  }

  /**
   * 创建领域状态异常 (兼容性方法)
   *
   * @param message - 异常消息
   * @param currentState - 当前状态
   * @param requestedOperation - 请求的操作
   * @param context - 上下文信息
   * @returns 状态异常
   */
  createDomainState(
    message: string,
    currentState: string,
    requestedOperation: string,
    context: Record<string, unknown> = {},
  ): StateException {
    return this.createStateError(
      message,
      currentState,
      requestedOperation,
      context,
    );
  }

  /**
   * 创建领域验证异常 (兼容性方法)
   *
   * @param message - 异常消息
   * @param fieldName - 字段名称
   * @param fieldValue - 字段值
   * @param context - 上下文信息
   * @returns 验证异常
   */
  createDomainValidation(
    message: string,
    fieldName: string,
    fieldValue: unknown,
    context: Record<string, unknown> = {},
  ): ValidationException {
    return this.createValidationError(message, fieldName, fieldValue, context);
  }

  /**
   * 创建无效组织名称异常
   *
   * @param organizationName - 组织名称
   * @param reason - 失败原因
   * @returns 验证异常
   */
  createInvalidOrganizationName(
    organizationName: string,
    reason: string,
  ): ValidationException {
    return this.createValidationError(
      `组织名称无效: ${reason}`,
      "name",
      organizationName,
      { entity: "Organization" },
    );
  }

  // 便捷方法：用户相关异常

  /**
   * 创建邮箱格式无效异常
   *
   * @param email - 邮箱地址
   * @returns 验证异常
   */
  createInvalidEmail(email: string): ValidationException {
    return this.createValidationError(
      `邮箱格式无效: ${email}`,
      "email",
      email,
      { entity: "User" },
    );
  }

  /**
   * 创建邮箱已存在异常
   *
   * @param email - 邮箱地址
   * @param existingUserId - 已存在的用户ID
   * @param tenantId - 租户ID
   * @returns 业务规则异常
   */
  createEmailAlreadyExists(
    email: string,
    existingUserId: string,
    tenantId: string,
  ): BusinessRuleException {
    return this.createBusinessRuleViolation(
      `邮箱 "${email}" 已存在`,
      "USER_EMAIL_UNIQUE",
      { email, existingUserId, tenantId, entity: "User" },
    );
  }

  /**
   * 创建用户名已存在异常
   *
   * @param username - 用户名
   * @param existingUserId - 已存在的用户ID
   * @param tenantId - 租户ID
   * @returns 业务规则异常
   */
  createUsernameAlreadyExists(
    username: string,
    existingUserId: string,
    tenantId: string,
  ): BusinessRuleException {
    return this.createBusinessRuleViolation(
      `用户名 "${username}" 已存在`,
      "USER_USERNAME_UNIQUE",
      { username, existingUserId, tenantId, entity: "User" },
    );
  }

  /**
   * 创建用户状态异常
   *
   * @param currentStatus - 当前状态
   * @param requestedOperation - 请求的操作
   * @param userId - 用户ID
   * @returns 状态异常
   */
  createUserStateError(
    currentStatus: string,
    requestedOperation: string,
    userId: string,
  ): StateException {
    return this.createStateError(
      `用户状态 "${currentStatus}" 不允许执行 "${requestedOperation}" 操作`,
      currentStatus,
      requestedOperation,
      { userId, entity: "User" },
    );
  }

  // 便捷方法：权限相关异常

  /**
   * 创建权限不足异常
   *
   * @param requiredPermission - 所需权限
   * @param resource - 资源
   * @param userId - 用户ID
   * @returns 权限异常
   */
  createInsufficientPermission(
    requiredPermission: string,
    resource: string,
    userId: string,
  ): PermissionException {
    return this.createPermissionError(
      `用户没有 "${requiredPermission}" 权限访问资源 "${resource}"`,
      requiredPermission,
      resource,
      { userId, entity: "User" },
    );
  }

  // 便捷方法：组织相关异常

  /**
   * 创建组织名称已存在异常
   *
   * @param organizationName - 组织名称
   * @param existingOrganizationId - 已存在的组织ID
   * @param tenantId - 租户ID
   * @returns 业务规则异常
   */
  createOrganizationNameAlreadyExists(
    organizationName: string,
    existingOrganizationId: string,
    tenantId: string,
  ): BusinessRuleException {
    return this.createBusinessRuleViolation(
      `组织名称 "${organizationName}" 已存在`,
      "ORGANIZATION_NAME_UNIQUE",
      {
        organizationName,
        existingOrganizationId,
        tenantId,
        entity: "Organization",
      },
    );
  }

  // 便捷方法：部门相关异常

  /**
   * 创建部门名称已存在异常
   *
   * @param departmentName - 部门名称
   * @param existingDepartmentId - 已存在的部门ID
   * @param organizationId - 组织ID
   * @returns 业务规则异常
   */
  createDepartmentNameAlreadyExists(
    departmentName: string,
    existingDepartmentId: string,
    organizationId: string,
  ): BusinessRuleException {
    return this.createBusinessRuleViolation(
      `部门名称 "${departmentName}" 已存在`,
      "DEPARTMENT_NAME_UNIQUE",
      {
        departmentName,
        existingDepartmentId,
        organizationId,
        entity: "Department",
      },
    );
  }

  /**
   * 创建无效部门层级异常
   *
   * @param level - 层级
   * @param maxLevel - 最大层级
   * @returns 验证异常
   */
  createInvalidDepartmentLevel(
    level: number,
    maxLevel: number,
  ): ValidationException {
    return this.createValidationError(
      `部门层级 ${level} 超过最大层级 ${maxLevel}`,
      "level",
      level,
      { maxLevel, entity: "Department" },
    );
  }

  /**
   * 创建无效部门名称异常
   *
   * @param departmentName - 部门名称
   * @param reason - 失败原因
   * @returns 验证异常
   */
  createInvalidDepartmentName(
    departmentName: string,
    reason: string,
  ): ValidationException {
    return this.createValidationError(
      `部门名称无效: ${reason}`,
      "name",
      departmentName,
      { entity: "Department" },
    );
  }

  // 便捷方法：并发相关异常

  /**
   * 创建租户并发冲突异常
   *
   * @param tenantId - 租户ID
   * @param expectedVersion - 期望版本
   * @param actualVersion - 实际版本
   * @returns 并发异常
   */
  createTenantConcurrencyError(
    tenantId: string,
    expectedVersion: number,
    actualVersion: number,
  ): ConcurrencyException {
    return this.createConcurrencyError(
      `租户 "${tenantId}" 发生并发冲突`,
      tenantId,
      expectedVersion,
      actualVersion,
      { entity: "Tenant" },
    );
  }

  /**
   * 创建用户并发冲突异常
   *
   * @param userId - 用户ID
   * @param expectedVersion - 期望版本
   * @param actualVersion - 实际版本
   * @returns 并发异常
   */
  createUserConcurrencyError(
    userId: string,
    expectedVersion: number,
    actualVersion: number,
  ): ConcurrencyException {
    return this.createConcurrencyError(
      `用户 "${userId}" 发生并发冲突`,
      userId,
      expectedVersion,
      actualVersion,
      { entity: "User" },
    );
  }

  // 便捷方法：未找到相关异常

  /**
   * 创建租户未找到异常
   *
   * @param tenantId - 租户ID
   * @returns 未找到异常
   */
  createTenantNotFoundError(tenantId: string): NotFoundException {
    return this.createNotFoundError(
      `租户 "${tenantId}" 不存在`,
      "Tenant",
      tenantId,
      { entity: "Tenant" },
    );
  }

  /**
   * 创建用户未找到异常
   *
   * @param userId - 用户ID
   * @returns 未找到异常
   */
  createUserNotFoundError(userId: string): NotFoundException {
    return this.createNotFoundError(`用户 "${userId}" 不存在`, "User", userId, {
      entity: "User",
    });
  }

  /**
   * 创建组织未找到异常
   *
   * @param organizationId - 组织ID
   * @returns 未找到异常
   */
  createOrganizationNotFoundError(organizationId: string): NotFoundException {
    return this.createNotFoundError(
      `组织 "${organizationId}" 不存在`,
      "Organization",
      organizationId,
      { entity: "Organization" },
    );
  }

  /**
   * 创建部门未找到异常
   *
   * @param departmentId - 部门ID
   * @returns 未找到异常
   */
  createDepartmentNotFoundError(departmentId: string): NotFoundException {
    return this.createNotFoundError(
      `部门 "${departmentId}" 不存在`,
      "Department",
      departmentId,
      { entity: "Department" },
    );
  }

  /**
   * 创建角色未找到异常
   *
   * @param roleId - 角色ID
   * @returns 未找到异常
   */
  createRoleNotFoundError(roleId: string): NotFoundException {
    return this.createNotFoundError(`角色 "${roleId}" 不存在`, "Role", roleId, {
      entity: "Role",
    });
  }

  /**
   * 创建权限未找到异常
   *
   * @param permissionId - 权限ID
   * @returns 未找到异常
   */
  createPermissionNotFoundError(permissionId: string): NotFoundException {
    return this.createNotFoundError(
      `权限 "${permissionId}" 不存在`,
      "Permission",
      permissionId,
      { entity: "Permission" },
    );
  }
}
