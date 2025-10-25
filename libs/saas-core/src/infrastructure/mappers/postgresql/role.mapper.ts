/**
 * 角色实体映射器（PostgreSQL）
 *
 * @description 在角色数据库实体和角色领域实体之间进行转换
 * @since 1.0.0
 */

import { Role } from "../../../domain/entities/role.entity.js";
import { EntityId } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel"";
import { OrganizationId } from "@hl8/domain-kernel"";
import { DepartmentId } from "@hl8/domain-kernel"";
import { AuditInfo } from "@hl8/domain-kernel";
import { RoleLevel } from "../../../domain/value-objects/index.js";
import { RoleTypeEnum, RoleStatusEnum } from "../../../domain/entities/role.entity.js";
import {
  RoleEntity,
  RoleType as DbRoleType,
  RoleStatus as DbRoleStatus,
  RoleLevel as DbRoleLevel,
} from "../../entities/postgresql/role.entity.js";

/**
 * 角色映射器（PostgreSQL）
 *
 * 负责在数据库实体和领域实体之间进行双向转换：
 * - toDomain: 将数据库实体转换为领域实体
 * - toEntity: 将领域实体转换为数据库实体
 */
export class RoleMapper {
  /**
   * 将数据库实体转换为领域实体
   *
   * @param entity - 数据库实体
   * @returns 领域实体
   */
  static toDomain(entity: RoleEntity): Role {
    // 转换值对象
    const roleId = new EntityId(entity.id);
    const tenantId = TenantId.create(entity.tenantId);
    const organizationId = entity.organizationId
      ? OrganizationId.create(entity.organizationId)
      : undefined;
    const departmentId = entity.departmentId
      ? DepartmentId.create(entity.departmentId)
      : undefined;

    // 转换枚举类型
    const level = this.mapDbLevelToDomainLevel(entity.level);
    const type = this.mapDbTypeToDomainType(entity.type);
    const status = this.mapDbStatusToDomainStatus(entity.status);

    // 创建审计信息
    const auditInfo: AuditInfo = {
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      version: entity.version,
    };

    // 创建领域实体
    return new Role(
      roleId,
      tenantId,
      entity.name,
      entity.description || "",
      level,
      type,
      status,
      entity.permissions || [],
      entity.inheritedRoles || [],
      entity.isDefault,
      entity.isSystem,
      entity.settings || {},
      entity.metadata || {},
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
  static toEntity(domain: Role): RoleEntity {
    // 转换枚举类型
    const dbLevel = this.mapDomainLevelToDbLevel(domain.level);
    const dbType = this.mapDomainTypeToDbType(domain.type);
    const dbStatus = this.mapDomainStatusToDbStatus(domain.status);

    return new RoleEntity({
      id: domain.id.getValue(),
      tenantId: domain.tenantId.getValue(),
      organizationId: domain.organizationId?.getValue(),
      departmentId: domain.departmentId?.getValue(),
      name: domain.name,
      description: domain.description,
      level: dbLevel,
      type: dbType,
      status: dbStatus,
      permissions: domain.permissions,
      inheritedRoles: domain.inheritedRoles,
      isDefault: domain.isDefault,
      isSystem: domain.isSystem,
      settings: domain.settings,
      metadata: domain.metadata,
      createdAt: domain.auditInfo.createdAt,
      updatedAt: domain.auditInfo.updatedAt,
      version: domain.auditInfo.version,
    });
  }

  /**
   * 将数据库级别转换为领域级别
   *
   * @param dbLevel - 数据库级别
   * @returns 领域级别
   */
  private static mapDbLevelToDomainLevel(dbLevel: DbRoleLevel): RoleLevel {
    // RoleLevel 是一个值对象，需要根据实际的字符串值创建
    // 假设 RoleLevel 有 fromString 方法或者接受字符串构造函数
    return new RoleLevel(dbLevel);
  }

  /**
   * 将领域级别转换为数据库级别
   *
   * @param domainLevel - 领域级别
   * @returns 数据库级别
   */
  private static mapDomainLevelToDbLevel(domainLevel: RoleLevel): DbRoleLevel {
    // 假设 RoleLevel 有一个 value 属性或 toString 方法
    return domainLevel.getValue() as DbRoleLevel;
  }

  /**
   * 将数据库类型转换为领域类型
   *
   * @param dbType - 数据库类型
   * @returns 领域类型
   */
  private static mapDbTypeToDomainType(dbType: DbRoleType): RoleTypeEnum {
    switch (dbType) {
      case "SYSTEM":
        return RoleTypeEnum.SYSTEM;
      case "CUSTOM":
        return RoleTypeEnum.CUSTOM;
      case "TEMPLATE":
        return RoleTypeEnum.TEMPLATE;
      default:
        throw new Error(`Unknown role type: ${dbType}`);
    }
  }

  /**
   * 将领域类型转换为数据库类型
   *
   * @param domainType - 领域类型
   * @returns 数据库类型
   */
  private static mapDomainTypeToDbType(domainType: RoleTypeEnum): DbRoleType {
    switch (domainType) {
      case RoleTypeEnum.SYSTEM:
        return "SYSTEM";
      case RoleTypeEnum.CUSTOM:
        return "CUSTOM";
      case RoleTypeEnum.TEMPLATE:
        return "TEMPLATE";
      default:
        throw new Error(`Unknown role type: ${domainType}`);
    }
  }

  /**
   * 将数据库状态转换为领域状态
   *
   * @param dbStatus - 数据库状态
   * @returns 领域状态
   */
  private static mapDbStatusToDomainStatus(dbStatus: DbRoleStatus): RoleStatusEnum {
    switch (dbStatus) {
      case "ACTIVE":
        return RoleStatusEnum.ACTIVE;
      case "INACTIVE":
        return RoleStatusEnum.INACTIVE;
      case "DEPRECATED":
        return RoleStatusEnum.DEPRECATED;
      default:
        throw new Error(`Unknown role status: ${dbStatus}`);
    }
  }

  /**
   * 将领域状态转换为数据库状态
   *
   * @param domainStatus - 领域状态
   * @returns 数据库状态
   */
  private static mapDomainStatusToDbStatus(domainStatus: RoleStatusEnum): DbRoleStatus {
    switch (domainStatus) {
      case RoleStatusEnum.ACTIVE:
        return "ACTIVE";
      case RoleStatusEnum.INACTIVE:
        return "INACTIVE";
      case RoleStatusEnum.DEPRECATED:
        return "DEPRECATED";
      default:
        throw new Error(`Unknown role status: ${domainStatus}`);
    }
  }
}
