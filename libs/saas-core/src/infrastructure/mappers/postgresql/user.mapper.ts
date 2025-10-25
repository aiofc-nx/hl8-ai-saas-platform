/**
 * 用户实体映射器（PostgreSQL）
 *
 * @description 在用户数据库实体和用户领域实体之间进行转换
 * @since 1.0.0
 */

import { User } from "../../../domain/entities/user.entity.js";
import { UserId } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import { OrganizationId } from "@hl8/domain-kernel";
import { DepartmentId } from "@hl8/domain-kernel";
import { AuditInfo } from "@hl8/domain-kernel";
import { UserTypeEnum, UserStatusEnum } from "../../../domain/entities/user.entity.js";
import {
  UserEntity,
  UserType as DbUserType,
  UserStatus as DbUserStatus,
} from "../../entities/postgresql/user.entity.js";

/**
 * 用户映射器（PostgreSQL）
 *
 * 负责在数据库实体和领域实体之间进行双向转换：
 * - toDomain: 将数据库实体转换为领域实体
 * - toEntity: 将领域实体转换为数据库实体
 */
export class UserMapper {
  /**
   * 将数据库实体转换为领域实体
   *
   * @param entity - 数据库实体
   * @returns 领域实体
   */
  static toDomain(entity: UserEntity): User {
    // 转换值对象
    const userId = UserId.create(entity.id);
    const tenantId = TenantId.create(entity.tenantId);
    const organizationId = entity.organizationId
      ? OrganizationId.create(entity.organizationId)
      : undefined;
    const departmentId = entity.departmentId
      ? DepartmentId.create(entity.departmentId)
      : undefined;

    // 转换枚举类型
    const type = this.mapDbTypeToDomainType(entity.type);
    const status = this.mapDbStatusToDomainStatus(entity.status);

    // 创建审计信息
    const auditInfo: AuditInfo = {
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      version: entity.version,
    };

    // 创建领域实体
    return new User(
      userId,
      tenantId,
      entity.email,
      entity.username,
      entity.displayName,
      type,
      status,
      entity.firstName,
      entity.lastName,
      entity.phone,
      entity.avatar,
      entity.timezone,
      entity.language,
      organizationId,
      departmentId,
      false, // isShared
      undefined, // sharingLevel
      auditInfo,
    );
  }

  /**
   * 将领域实体转换为数据库实体
   *
   * @param domain - 领域实体
   * @returns 数据库实体
   */
  static toEntity(domain: User): UserEntity {
    // 转换枚举类型
    const dbType = this.mapDomainTypeToDbType(domain.type);
    const dbStatus = this.mapDomainStatusToDbStatus(domain.status);

    return new UserEntity({
      id: domain.id.getValue(),
      tenantId: domain.tenantId.getValue(),
      organizationId: domain.organizationId?.getValue(),
      departmentId: domain.departmentId?.getValue(),
      email: domain.email,
      username: domain.username,
      displayName: domain.displayName,
      type: dbType,
      status: dbStatus,
      firstName: domain.firstName,
      lastName: domain.lastName,
      phone: domain.phone,
      avatar: domain.avatar,
      timezone: domain.timezone,
      language: domain.language,
      passwordHash: domain.passwordHash,
      emailVerified: domain.emailVerified,
      phoneVerified: domain.phoneVerified,
      twoFactorEnabled: domain.twoFactorEnabled,
      lastLoginAt: domain.lastLoginAt,
      roles: domain.roles,
      permissions: domain.permissions,
      settings: domain.settings,
      metadata: domain.metadata,
      createdAt: domain.auditInfo.createdAt,
      updatedAt: domain.auditInfo.updatedAt,
      version: domain.auditInfo.version,
    });
  }

  /**
   * 将数据库类型转换为领域类型
   *
   * @param dbType - 数据库类型
   * @returns 领域类型
   */
  private static mapDbTypeToDomainType(dbType: DbUserType): UserTypeEnum {
    switch (dbType) {
      case "ADMIN":
        return UserTypeEnum.ADMIN;
      case "MANAGER":
        return UserTypeEnum.MANAGER;
      case "USER":
        return UserTypeEnum.USER;
      case "GUEST":
        return UserTypeEnum.GUEST;
      case "SYSTEM":
        return UserTypeEnum.SYSTEM;
      default:
        throw new Error(`Unknown user type: ${dbType}`);
    }
  }

  /**
   * 将领域类型转换为数据库类型
   *
   * @param domainType - 领域类型
   * @returns 数据库类型
   */
  private static mapDomainTypeToDbType(domainType: UserTypeEnum): DbUserType {
    switch (domainType) {
      case UserTypeEnum.ADMIN:
        return "ADMIN";
      case UserTypeEnum.MANAGER:
        return "MANAGER";
      case UserTypeEnum.USER:
        return "USER";
      case UserTypeEnum.GUEST:
        return "GUEST";
      case UserTypeEnum.SYSTEM:
        return "SYSTEM";
      default:
        throw new Error(`Unknown user type: ${domainType}`);
    }
  }

  /**
   * 将数据库状态转换为领域状态
   *
   * @param dbStatus - 数据库状态
   * @returns 领域状态
   */
  private static mapDbStatusToDomainStatus(
    dbStatus: DbUserStatus,
  ): UserStatusEnum {
    switch (dbStatus) {
      case "ACTIVE":
        return UserStatusEnum.ACTIVE;
      case "INACTIVE":
        return UserStatusEnum.INACTIVE;
      case "SUSPENDED":
        return UserStatusEnum.SUSPENDED;
      case "PENDING":
        return UserStatusEnum.PENDING;
      case "LOCKED":
        return UserStatusEnum.LOCKED;
      default:
        throw new Error(`Unknown user status: ${dbStatus}`);
    }
  }

  /**
   * 将领域状态转换为数据库状态
   *
   * @param domainStatus - 领域状态
   * @returns 数据库状态
   */
  private static mapDomainStatusToDbStatus(
    domainStatus: UserStatusEnum,
  ): DbUserStatus {
    switch (domainStatus) {
      case UserStatusEnum.ACTIVE:
        return "ACTIVE";
      case UserStatusEnum.INACTIVE:
        return "INACTIVE";
      case UserStatusEnum.SUSPENDED:
        return "SUSPENDED";
      case UserStatusEnum.PENDING:
        return "PENDING";
      case UserStatusEnum.LOCKED:
        return "LOCKED";
      default:
        throw new Error(`Unknown user status: ${domainStatus}`);
    }
  }
}
