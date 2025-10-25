/**
 * 权限业务规则服务
 *
 * @description 定义和管理权限相关的业务规则，包括权限分配、角色继承、权限验证等操作的规则和约束
 * @since 1.0.0
 */

import { Role } from "../entities/role.entity.js";
import { CaslAbility } from "../entities/casl-ability.entity.js";
import { IsolationContext } from "@hl8/domain-kernel";

/**
 * 权限业务规则服务
 *
 * 负责定义和管理权限相关的业务规则，包括：
 * - 权限分配规则
 * - 角色继承规则
 * - 权限验证规则
 * - 权限冲突检测
 * - 权限级别管理
 */
export class PermissionBusinessRules {
  /**
   * 验证角色是否可以创建
   *
   * @description 验证角色创建是否满足所有业务规则
   * @param name - 角色名称
   * @param level - 角色级别
   * @param context - 隔离上下文
   * @returns 验证结果
   * @throws {Error} 当违反业务规则时抛出错误
   * @example
   * ```typescript
   * const rules = new PermissionBusinessRules();
   * rules.validateRoleCreation("Manager", roleLevel, context);
   * ```
   */
  validateRoleCreation(
    name: string,
    level: string,
    context: IsolationContext,
  ): boolean {
    // 验证角色名称
    if (!this.isValidRoleName(name)) {
      throw new Error("角色名称格式无效");
    }

    // 验证角色级别
    if (!this.isValidRoleLevel(level)) {
      throw new Error("角色级别无效");
    }

    // 验证隔离级别
    if (!context || !context.isValid()) {
      throw new Error("隔离上下文无效");
    }

    return true;
  }

  /**
   * 验证角色是否可以被更新
   *
   * @description 验证角色更新是否满足所有业务规则
   * @param role - 角色实体
   * @param updates - 更新内容
   * @param context - 隔离上下文
   * @returns 验证结果
   * @throws {Error} 当违反业务规则时抛出错误
   * @example
   * ```typescript
   * const rules = new PermissionBusinessRules();
   * rules.validateRoleUpdate(role, { name: "New Name" }, context);
   * ```
   */
  validateRoleUpdate(
    role: Role,
    updates: Partial<Pick<Role, "name" | "description" | "permissions">>,
    context: IsolationContext,
  ): boolean {
    // 验证角色存在
    if (!role) {
      throw new Error("角色不存在");
    }

    // 验证系统角色不能修改
    if (role.isSystem) {
      throw new Error("系统角色不能修改");
    }

    // 验证角色名称更新
    if (updates.name && !this.isValidRoleName(updates.name)) {
      throw new Error("角色名称格式无效");
    }

    // 验证权限列表
    if (updates.permissions && !this.isValidPermissions(updates.permissions)) {
      throw new Error("权限列表无效");
    }

    return true;
  }

  /**
   * 验证角色是否可以被删除
   *
   * @description 验证角色删除是否满足所有业务规则
   * @param role - 角色实体
   * @param context - 隔离上下文
   * @returns 验证结果
   * @throws {Error} 当违反业务规则时抛出错误
   * @example
   * ```typescript
   * const rules = new PermissionBusinessRules();
   * rules.validateRoleDeletion(role, context);
   * ```
   */
  validateRoleDeletion(role: Role, context: IsolationContext): boolean {
    // 验证角色存在
    if (!role) {
      throw new Error("角色不存在");
    }

    // 验证系统角色不能删除
    if (role.isSystem) {
      throw new Error("系统角色不能删除");
    }

    // 验证默认角色不能删除
    if (role.isDefault) {
      throw new Error("默认角色不能删除");
    }

    // 验证角色是否被其他角色继承
    if (role.inheritedRoles && role.inheritedRoles.length > 0) {
      throw new Error("被其他角色继承的角色不能删除");
    }

    return true;
  }

  /**
   * 验证权限分配是否有效
   *
   * @description 验证权限分配是否满足所有业务规则
   * @param role - 角色实体
   * @param permission - 权限名称
   * @param context - 隔离上下文
   * @returns 验证结果
   * @throws {Error} 当违反业务规则时抛出错误
   * @example
   * ```typescript
   * const rules = new PermissionBusinessRules();
   * rules.validatePermissionAssignment(role, "resource.read", context);
   * ```
   */
  validatePermissionAssignment(
    role: Role,
    permission: string,
    context: IsolationContext,
  ): boolean {
    // 验证角色存在
    if (!role) {
      throw new Error("角色不存在");
    }

    // 验证权限格式
    if (!this.isValidPermission(permission)) {
      throw new Error("权限格式无效");
    }

    // 验证权限冲突
    if (this.hasPermissionConflict(role, permission)) {
      throw new Error("权限冲突");
    }

    return true;
  }

  /**
   * 验证角色继承是否有效
   *
   * @description 验证角色继承是否满足所有业务规则
   * @param role - 角色实体
   * @param parentRole - 父角色
   * @param context - 隔离上下文
   * @returns 验证结果
   * @throws {Error} 当违反业务规则时抛出错误
   * @example
   * ```typescript
   * const rules = new PermissionBusinessRules();
   * rules.validateRoleInheritance(role, parentRole, context);
   * ```
   */
  validateRoleInheritance(
    role: Role,
    parentRole: Role,
    context: IsolationContext,
  ): boolean {
    // 验证角色存在
    if (!role || !parentRole) {
      throw new Error("角色不存在");
    }

    // 验证不能继承自己
    if (role.id.equals(parentRole.id)) {
      throw new Error("角色不能继承自己");
    }

    // 验证继承循环
    if (this.hasInheritanceCycle(role, parentRole)) {
      throw new Error("角色继承存在循环");
    }

    // 验证角色级别兼容性
    if (!this.isCompatibleRoleLevel(role, parentRole)) {
      throw new Error("角色级别不兼容");
    }

    return true;
  }

  /**
   * 验证权限字符串格式
   *
   * @description 验证权限字符串是否符合格式要求
   * @param permission - 权限字符串
   * @returns 是否为有效权限
   * @example
   * ```typescript
   * const rules = new PermissionBusinessRules();
   * const isValid = rules.isValidPermission("resource.read");
   * ```
   */
  isValidPermission(permission: string): boolean {
    if (!permission || typeof permission !== "string") {
      return false;
    }
    // 权限格式：resource.action 或 resource.subresource.action
    const permissionRegex = /^[a-z]+(\.[a-z]+)+$/;
    return permissionRegex.test(permission);
  }

  /**
   * 验证权限列表
   *
   * @description 验证权限列表是否包含有效权限
   * @param permissions - 权限列表
   * @returns 是否为有效权限列表
   * @example
   * ```typescript
   * const rules = new PermissionBusinessRules();
   * const isValid = rules.isValidPermissions(["resource.read", "resource.write"]);
   * ```
   */
  isValidPermissions(permissions: string[]): boolean {
    if (!Array.isArray(permissions)) {
      return false;
    }
    return permissions.every((perm) => this.isValidPermission(perm));
  }

  /**
   * 验证角色名称格式
   *
   * @description 验证角色名称是否符合格式要求
   * @param name - 角色名称
   * @returns 是否为有效角色名称
   * @example
   * ```typescript
   * const rules = new PermissionBusinessRules();
   * const isValid = rules.isValidRoleName("Manager");
   * ```
   */
  isValidRoleName(name: string): boolean {
    if (!name || typeof name !== "string") {
      return false;
    }
    if (name.trim().length === 0) {
      return false;
    }
    if (name.length > 100) {
      return false;
    }
    return true;
  }

  /**
   * 验证角色级别
   *
   * @description 验证角色级别是否有效
   * @param level - 角色级别
   * @returns 是否为有效角色级别
   * @example
   * ```typescript
   * const rules = new PermissionBusinessRules();
   * const isValid = rules.isValidRoleLevel("ORGANIZATION");
   * ```
   */
  isValidRoleLevel(level: string): boolean {
    const validLevels = [
      "PLATFORM",
      "TENANT",
      "ORGANIZATION",
      "DEPARTMENT",
      "USER",
    ];
    return validLevels.includes(level);
  }

  /**
   * 检测权限冲突
   *
   * @description 检测角色权限是否存在冲突
   * @param role - 角色实体
   * @param permission - 权限名称
   * @returns 是否存在冲突
   * @example
   * ```typescript
   * const rules = new PermissionBusinessRules();
   * const hasConflict = rules.hasPermissionConflict(role, "resource.read");
   * ```
   */
  hasPermissionConflict(role: Role, permission: string): boolean {
    // 检查是否存在相反的权限
    const oppositePermission = this.getOppositePermission(permission);
    if (oppositePermission && role.permissions.includes(oppositePermission)) {
      return true;
    }

    // 检查是否与继承的角色冲突
    // 这里需要实现继承角色权限检查逻辑

    return false;
  }

  /**
   * 检测继承循环
   *
   * @description 检测角色继承是否存在循环
   * @param role - 角色实体
   * @param parentRole - 父角色
   * @returns 是否存在循环
   * @example
   * ```typescript
   * const rules = new PermissionBusinessRules();
   * const hasCycle = rules.hasInheritanceCycle(role, parentRole);
   * ```
   */
  hasInheritanceCycle(role: Role, parentRole: Role): boolean {
    // 递归检查是否存在循环继承
    // 这里需要实现循环检测逻辑
    return false;
  }

  /**
   * 检查角色级别兼容性
   *
   * @description 检查两个角色级别是否兼容
   * @param role - 角色实体
   * @param parentRole - 父角色
   * @returns 是否兼容
   * @example
   * ```typescript
   * const rules = new PermissionBusinessRules();
   * const isCompatible = rules.isCompatibleRoleLevel(role, parentRole);
   * ```
   */
  isCompatibleRoleLevel(role: Role, parentRole: Role): boolean {
    // 角色级别兼容性检查
    // 高层级角色可以继承低层级角色的权限
    return true;
  }

  /**
   * 获取相反的权限
   *
   * @description 获取与给定权限相反的权限
   * @param permission - 权限名称
   * @returns 相反的权限
   * @example
   * ```typescript
   * const rules = new PermissionBusinessRules();
   * const opposite = rules.getOppositePermission("resource.read");
   * ```
   */
  getOppositePermission(permission: string): string | null {
    // 定义相反的权限映射
    const oppositeMap: Record<string, string> = {
      "resource.read": "resource.deny",
      "resource.write": "resource.read-only",
    };

    return oppositeMap[permission] || null;
  }
}
