/**
 * 用户身份管理器
 *
 * @description 处理用户身份管理，包括身份验证、授权、角色管理等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { DomainService } from "@hl8/domain-kernel";
import { UserId } from "../value-objects/user-id.vo.js";
import { TenantId } from "../value-objects/tenant-id.vo.js";
import { OrganizationId } from "../value-objects/organization-id.vo.js";
import { DepartmentId } from "../value-objects/department-id.vo.js";
import {
  PlatformUser,
  PlatformUserType,
  PlatformUserStatus,
} from "../value-objects/platform-user.vo.js";
import {
  TenantUser,
  TenantUserType,
  TenantUserStatus,
} from "../value-objects/tenant-user.vo.js";

/**
 * 用户身份查询条件接口
 */
export interface UserIdentityQuery {
  readonly userId?: UserId;
  readonly tenantId?: TenantId;
  readonly organizationId?: OrganizationId;
  readonly departmentId?: DepartmentId;
  readonly userType?: PlatformUserType | TenantUserType;
  readonly status?: PlatformUserStatus | TenantUserStatus;
  readonly permissions?: readonly string[];
  readonly roles?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

/**
 * 用户身份验证结果接口
 */
export interface UserIdentityValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly suggestions: readonly string[];
}

/**
 * 用户身份管理器
 *
 * 用户身份管理器负责处理用户身份管理，包括身份验证、授权、角色管理等。
 * 支持平台用户和租户用户两种身份类型，提供统一的身份管理接口。
 *
 * @example
 * ```typescript
 * const manager = new UserIdentityManager();
 * const result = await manager.validateUserIdentity(userId, tenantId);
 * if (result.isValid) {
 *   console.log("User identity is valid");
 * }
 * ```
 */
@Injectable()
export class UserIdentityManager extends DomainService {
  private readonly platformUsers: Map<string, PlatformUser> = new Map();
  private readonly tenantUsers: Map<string, TenantUser> = new Map();

  constructor() {
    super();
    this.setContext("UserIdentityManager");
  }

  /**
   * 创建平台用户身份
   *
   * @param userId - 用户ID
   * @param username - 用户名
   * @param email - 邮箱
   * @param type - 用户类型
   * @param permissions - 权限列表
   * @param roles - 角色列表
   * @param assignedTenants - 分配的租户列表
   * @param metadata - 元数据
   * @returns 平台用户身份
   */
  async createPlatformUserIdentity(
    userId: UserId,
    username: string,
    email: string,
    type: PlatformUserType,
    permissions: readonly string[],
    roles: readonly string[],
    assignedTenants: readonly TenantId[] = [],
    metadata?: Record<string, unknown>,
  ): Promise<PlatformUser> {
    this.logger.log(
      `Creating platform user identity for user ${userId.value}`,
      this.context,
    );

    // 检查用户是否已存在
    if (this.platformUsers.has(userId.value)) {
      throw new Error(
        `Platform user identity for user ${userId.value} already exists`,
      );
    }

    const platformUser = PlatformUser.create(
      userId,
      username,
      email,
      type,
      permissions,
      roles,
      assignedTenants,
      metadata,
    );

    this.platformUsers.set(userId.value, platformUser);

    this.logger.log(
      `Platform user identity for user ${userId.value} created successfully`,
      this.context,
    );

    return platformUser;
  }

  /**
   * 创建租户用户身份
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @param username - 用户名
   * @param email - 邮箱
   * @param type - 用户类型
   * @param permissions - 权限列表
   * @param roles - 角色列表
   * @param assignedOrganizations - 分配的组织列表
   * @param assignedDepartments - 分配的部门列表
   * @param metadata - 元数据
   * @returns 租户用户身份
   */
  async createTenantUserIdentity(
    userId: UserId,
    tenantId: TenantId,
    username: string,
    email: string,
    type: TenantUserType,
    permissions: readonly string[],
    roles: readonly string[],
    assignedOrganizations: readonly OrganizationId[] = [],
    assignedDepartments: readonly DepartmentId[] = [],
    metadata?: Record<string, unknown>,
  ): Promise<TenantUser> {
    this.logger.log(
      `Creating tenant user identity for user ${userId.value} in tenant ${tenantId.value}`,
      this.context,
    );

    // 检查用户是否已存在
    const key = `${userId.value}:${tenantId.value}`;
    if (this.tenantUsers.has(key)) {
      throw new Error(
        `Tenant user identity for user ${userId.value} in tenant ${tenantId.value} already exists`,
      );
    }

    const tenantUser = TenantUser.create(
      userId,
      tenantId,
      username,
      email,
      type,
      permissions,
      roles,
      assignedOrganizations,
      assignedDepartments,
      metadata,
    );

    this.tenantUsers.set(key, tenantUser);

    this.logger.log(
      `Tenant user identity for user ${userId.value} in tenant ${tenantId.value} created successfully`,
      this.context,
    );

    return tenantUser;
  }

  /**
   * 获取平台用户身份
   *
   * @param userId - 用户ID
   * @returns 平台用户身份或undefined
   */
  async getPlatformUserIdentity(
    userId: UserId,
  ): Promise<PlatformUser | undefined> {
    this.logger.log(
      `Getting platform user identity for user ${userId.value}`,
      this.context,
    );

    const platformUser = this.platformUsers.get(userId.value);

    this.logger.log(
      `Platform user identity for user ${userId.value} ${platformUser ? "found" : "not found"}`,
      this.context,
    );

    return platformUser;
  }

  /**
   * 获取租户用户身份
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @returns 租户用户身份或undefined
   */
  async getTenantUserIdentity(
    userId: UserId,
    tenantId: TenantId,
  ): Promise<TenantUser | undefined> {
    this.logger.log(
      `Getting tenant user identity for user ${userId.value} in tenant ${tenantId.value}`,
      this.context,
    );

    const key = `${userId.value}:${tenantId.value}`;
    const tenantUser = this.tenantUsers.get(key);

    this.logger.log(
      `Tenant user identity for user ${userId.value} in tenant ${tenantId.value} ${tenantUser ? "found" : "not found"}`,
      this.context,
    );

    return tenantUser;
  }

  /**
   * 查询用户身份
   *
   * @param query - 查询条件
   * @returns 用户身份列表
   */
  async queryUserIdentities(query: UserIdentityQuery): Promise<{
    readonly platformUsers: readonly PlatformUser[];
    readonly tenantUsers: readonly TenantUser[];
  }> {
    this.logger.log(
      `Querying user identities with criteria: ${JSON.stringify(query)}`,
      this.context,
    );

    const platformUsers: PlatformUser[] = [];
    const tenantUsers: TenantUser[] = [];

    // 查询平台用户
    for (const user of this.platformUsers.values()) {
      if (this.matchesPlatformUserQuery(user, query)) {
        platformUsers.push(user);
      }
    }

    // 查询租户用户
    for (const user of this.tenantUsers.values()) {
      if (this.matchesTenantUserQuery(user, query)) {
        tenantUsers.push(user);
      }
    }

    this.logger.log(
      `Found ${platformUsers.length} platform users and ${tenantUsers.length} tenant users matching query criteria`,
      this.context,
    );

    return { platformUsers, tenantUsers };
  }

  /**
   * 验证用户身份
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID（可选）
   * @returns 验证结果
   */
  async validateUserIdentity(
    userId: UserId,
    tenantId?: TenantId,
  ): Promise<UserIdentityValidationResult> {
    this.logger.log(
      `Validating user identity for user ${userId.value}${tenantId ? ` in tenant ${tenantId.value}` : ""}`,
      this.context,
    );

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 验证平台用户身份
    const platformUser = await this.getPlatformUserIdentity(userId);
    if (!platformUser) {
      errors.push(`Platform user identity for user ${userId.value} not found`);
    } else {
      // 验证平台用户状态
      if (!platformUser.isActive()) {
        errors.push(`Platform user ${userId.value} is not active`);
      }

      // 验证权限
      if (platformUser.getPermissionCount() === 0) {
        warnings.push(`Platform user ${userId.value} has no permissions`);
      }

      // 验证角色
      if (platformUser.getRoleCount() === 0) {
        warnings.push(`Platform user ${userId.value} has no roles`);
      }
    }

    // 验证租户用户身份（如果提供了租户ID）
    if (tenantId) {
      const tenantUser = await this.getTenantUserIdentity(userId, tenantId);
      if (!tenantUser) {
        errors.push(
          `Tenant user identity for user ${userId.value} in tenant ${tenantId.value} not found`,
        );
      } else {
        // 验证租户用户状态
        if (!tenantUser.isActive()) {
          errors.push(
            `Tenant user ${userId.value} in tenant ${tenantId.value} is not active`,
          );
        }

        // 验证权限
        if (tenantUser.getPermissionCount() === 0) {
          warnings.push(
            `Tenant user ${userId.value} in tenant ${tenantId.value} has no permissions`,
          );
        }

        // 验证角色
        if (tenantUser.getRoleCount() === 0) {
          warnings.push(
            `Tenant user ${userId.value} in tenant ${tenantId.value} has no roles`,
          );
        }

        // 验证组织分配
        if (tenantUser.getAssignedOrganizationCount() === 0) {
          warnings.push(
            `Tenant user ${userId.value} in tenant ${tenantId.value} has no assigned organizations`,
          );
        }
      }
    }

    // 生成建议
    if (errors.length === 0 && warnings.length === 0) {
      suggestions.push("User identity is valid and active");
    } else {
      suggestions.push("Review and fix the identified issues");
      suggestions.push("Consider updating user permissions and roles");
    }

    const result: UserIdentityValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };

    this.logger.log(
      `User identity validation completed: ${errors.length} errors, ${warnings.length} warnings`,
      this.context,
    );

    return result;
  }

  /**
   * 更新用户身份
   *
   * @param userId - 用户ID
   * @param updates - 更新内容
   * @param tenantId - 租户ID（可选）
   * @returns 更新后的用户身份
   */
  async updateUserIdentity(
    userId: UserId,
    updates: {
      readonly username?: string;
      readonly email?: string;
      readonly permissions?: readonly string[];
      readonly roles?: readonly string[];
      readonly metadata?: Record<string, unknown>;
    },
    tenantId?: TenantId,
  ): Promise<PlatformUser | TenantUser | undefined> {
    this.logger.log(
      `Updating user identity for user ${userId.value}${tenantId ? ` in tenant ${tenantId.value}` : ""}`,
      this.context,
    );

    if (tenantId) {
      // 更新租户用户身份
      const tenantUser = await this.getTenantUserIdentity(userId, tenantId);
      if (!tenantUser) {
        throw new Error(
          `Tenant user identity for user ${userId.value} in tenant ${tenantId.value} not found`,
        );
      }

      const updatedTenantUser = TenantUser.createFromUser(tenantUser, updates);
      const key = `${userId.value}:${tenantId.value}`;
      this.tenantUsers.set(key, updatedTenantUser);

      this.logger.log(
        `Tenant user identity for user ${userId.value} in tenant ${tenantId.value} updated successfully`,
        this.context,
      );

      return updatedTenantUser;
    } else {
      // 更新平台用户身份
      const platformUser = await this.getPlatformUserIdentity(userId);
      if (!platformUser) {
        throw new Error(
          `Platform user identity for user ${userId.value} not found`,
        );
      }

      const updatedPlatformUser = PlatformUser.createFromUser(
        platformUser,
        updates,
      );
      this.platformUsers.set(userId.value, updatedPlatformUser);

      this.logger.log(
        `Platform user identity for user ${userId.value} updated successfully`,
        this.context,
      );

      return updatedPlatformUser;
    }
  }

  /**
   * 删除用户身份
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID（可选）
   * @returns 是否删除成功
   */
  async deleteUserIdentity(
    userId: UserId,
    tenantId?: TenantId,
  ): Promise<boolean> {
    this.logger.log(
      `Deleting user identity for user ${userId.value}${tenantId ? ` in tenant ${tenantId.value}` : ""}`,
      this.context,
    );

    if (tenantId) {
      // 删除租户用户身份
      const key = `${userId.value}:${tenantId.value}`;
      const deleted = this.tenantUsers.delete(key);

      this.logger.log(
        `Tenant user identity for user ${userId.value} in tenant ${tenantId.value} deleted: ${deleted}`,
        this.context,
      );

      return deleted;
    } else {
      // 删除平台用户身份
      const deleted = this.platformUsers.delete(userId.value);

      this.logger.log(
        `Platform user identity for user ${userId.value} deleted: ${deleted}`,
        this.context,
      );

      return deleted;
    }
  }

  /**
   * 获取用户身份统计信息
   *
   * @returns 用户身份统计信息
   */
  async getUserIdentityStatistics(): Promise<{
    readonly totalPlatformUsers: number;
    readonly totalTenantUsers: number;
    readonly platformUsersByType: Record<PlatformUserType, number>;
    readonly tenantUsersByType: Record<TenantUserType, number>;
    readonly platformUsersByStatus: Record<PlatformUserStatus, number>;
    readonly tenantUsersByStatus: Record<TenantUserStatus, number>;
    readonly averagePermissionsPerUser: number;
    readonly averageRolesPerUser: number;
  }> {
    this.logger.log(`Getting user identity statistics`, this.context);

    const totalPlatformUsers = this.platformUsers.size;
    const totalTenantUsers = this.tenantUsers.size;

    const platformUsersByType: Record<PlatformUserType, number> = {} as Record<
      PlatformUserType,
      number
    >;
    const tenantUsersByType: Record<TenantUserType, number> = {} as Record<
      TenantUserType,
      number
    >;
    const platformUsersByStatus: Record<PlatformUserStatus, number> =
      {} as Record<PlatformUserStatus, number>;
    const tenantUsersByStatus: Record<TenantUserStatus, number> = {} as Record<
      TenantUserStatus,
      number
    >;

    // 初始化统计
    for (const type of Object.values(PlatformUserType)) {
      platformUsersByType[type] = 0;
    }
    for (const type of Object.values(TenantUserType)) {
      tenantUsersByType[type] = 0;
    }
    for (const status of Object.values(PlatformUserStatus)) {
      platformUsersByStatus[status] = 0;
    }
    for (const status of Object.values(TenantUserStatus)) {
      tenantUsersByStatus[status] = 0;
    }

    let totalPermissions = 0;
    let totalRoles = 0;

    // 统计平台用户
    for (const user of this.platformUsers.values()) {
      platformUsersByType[user.type]++;
      platformUsersByStatus[user.status]++;
      totalPermissions += user.getPermissionCount();
      totalRoles += user.getRoleCount();
    }

    // 统计租户用户
    for (const user of this.tenantUsers.values()) {
      tenantUsersByType[user.type]++;
      tenantUsersByStatus[user.status]++;
      totalPermissions += user.getPermissionCount();
      totalRoles += user.getRoleCount();
    }

    const totalUsers = totalPlatformUsers + totalTenantUsers;
    const averagePermissionsPerUser =
      totalUsers > 0 ? totalPermissions / totalUsers : 0;
    const averageRolesPerUser = totalUsers > 0 ? totalRoles / totalUsers : 0;

    const result = {
      totalPlatformUsers,
      totalTenantUsers,
      platformUsersByType,
      tenantUsersByType,
      platformUsersByStatus,
      tenantUsersByStatus,
      averagePermissionsPerUser,
      averageRolesPerUser,
    };

    this.logger.log(
      `User identity statistics generated: ${totalPlatformUsers} platform users, ${totalTenantUsers} tenant users`,
      this.context,
    );

    return result;
  }

  /**
   * 检查平台用户查询是否匹配
   *
   * @param user - 平台用户
   * @param query - 查询条件
   * @returns 是否匹配
   */
  private matchesPlatformUserQuery(
    user: PlatformUser,
    query: UserIdentityQuery,
  ): boolean {
    if (query.userId && !user.userId.equals(query.userId)) {
      return false;
    }

    if (query.userType && user.type !== query.userType) {
      return false;
    }

    if (query.status && user.status !== query.status) {
      return false;
    }

    if (query.permissions && query.permissions.length > 0) {
      const hasAllPermissions = query.permissions.every((permission) =>
        user.hasPermission(permission),
      );
      if (!hasAllPermissions) {
        return false;
      }
    }

    if (query.roles && query.roles.length > 0) {
      const hasAllRoles = query.roles.every((role) => user.hasRole(role));
      if (!hasAllRoles) {
        return false;
      }
    }

    if (query.metadata && Object.keys(query.metadata).length > 0) {
      const userMetadata = user.metadata;
      const hasAllMetadata = Object.entries(query.metadata).every(
        ([key, value]) => userMetadata[key] === value,
      );
      if (!hasAllMetadata) {
        return false;
      }
    }

    return true;
  }

  /**
   * 检查租户用户查询是否匹配
   *
   * @param user - 租户用户
   * @param query - 查询条件
   * @returns 是否匹配
   */
  private matchesTenantUserQuery(
    user: TenantUser,
    query: UserIdentityQuery,
  ): boolean {
    if (query.userId && !user.userId.equals(query.userId)) {
      return false;
    }

    if (query.tenantId && !user.tenantId.equals(query.tenantId)) {
      return false;
    }

    if (
      query.organizationId &&
      !user.hasAssignedOrganization(query.organizationId)
    ) {
      return false;
    }

    if (query.departmentId && !user.hasAssignedDepartment(query.departmentId)) {
      return false;
    }

    if (query.userType && user.type !== query.userType) {
      return false;
    }

    if (query.status && user.status !== query.status) {
      return false;
    }

    if (query.permissions && query.permissions.length > 0) {
      const hasAllPermissions = query.permissions.every((permission) =>
        user.hasPermission(permission),
      );
      if (!hasAllPermissions) {
        return false;
      }
    }

    if (query.roles && query.roles.length > 0) {
      const hasAllRoles = query.roles.every((role) => user.hasRole(role));
      if (!hasAllRoles) {
        return false;
      }
    }

    if (query.metadata && Object.keys(query.metadata).length > 0) {
      const userMetadata = user.metadata;
      const hasAllMetadata = Object.entries(query.metadata).every(
        ([key, value]) => userMetadata[key] === value,
      );
      if (!hasAllMetadata) {
        return false;
      }
    }

    return true;
  }
}
