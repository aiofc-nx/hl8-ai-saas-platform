/**
 * 组织实体映射器（PostgreSQL）
 *
 * @description 在组织数据库实体和组织领域聚合根之间进行转换
 * @since 1.0.0
 */

import { OrganizationAggregate } from "../../../domain/aggregates/organization.aggregate.js";
import { Organization } from "../../../domain/entities/organization.entity.js";
import {
  OrganizationTypeEnum,
  OrganizationStatusEnum,
} from "../../../domain/entities/organization.entity.js";
import { OrganizationId } from "../../../domain/value-objects/organization-id.vo.js";
import { TenantId } from "../../../domain/value-objects/tenant-id.vo.js";
import {
  OrganizationEntity,
  OrganizationType as DbOrganizationType,
  OrganizationStatus as DbOrganizationStatus,
} from "../../entities/postgresql/organization.entity.js";

/**
 * 组织映射器（PostgreSQL）
 *
 * 负责在数据库实体和领域聚合根之间进行双向转换：
 * - toDomain: 将数据库实体转换为领域聚合根
 * - toEntity: 将领域聚合根转换为数据库实体
 */
export class OrganizationMapper {
  /**
   * 将数据库实体转换为领域聚合根
   *
   * @param entity - 数据库实体
   * @returns 领域聚合根
   */
  static toDomain(entity: OrganizationEntity): OrganizationAggregate {
    // 转换值对象
    const organizationId = OrganizationId.create(entity.id);
    const tenantId = TenantId.create(entity.tenantId);
    const parentId = entity.parentId
      ? OrganizationId.create(entity.parentId)
      : undefined;

    // 转换枚举类型
    const type = this.mapDbTypeToDomainType(entity.type);
    const status = this.mapDbStatusToDomainStatus(entity.status);

    // 创建领域实体
    const organization = new Organization(
      organizationId,
      tenantId,
      entity.name,
      type,
      status,
      entity.description,
      parentId,
      entity.level,
      entity.path || "",
      entity.settings || {},
      entity.metadata || {},
    );

    // 创建领域聚合根
    return new OrganizationAggregate(organization);
  }

  /**
   * 将领域聚合根转换为数据库实体
   *
   * @param aggregate - 领域聚合根
   * @returns 数据库实体
   */
  static toEntity(aggregate: OrganizationAggregate): OrganizationEntity {
    const organization = aggregate.organization;

    // 转换枚举类型
    const dbType = this.mapDomainTypeToDbType(organization.type);
    const dbStatus = this.mapDomainStatusToDbStatus(organization.status);

    return new OrganizationEntity({
      id: aggregate.id.getValue(),
      tenantId: organization.tenantId.getValue(),
      name: organization.name,
      type: dbType,
      status: dbStatus,
      description: organization.description,
      parentId: organization.parentId?.getValue(),
      level: organization.level,
      path: organization.path,
      settings: organization.settings,
      metadata: organization.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    });
  }

  /**
   * 将数据库类型转换为领域类型
   *
   * @param dbType - 数据库类型
   * @returns 领域类型
   */
  private static mapDbTypeToDomainType(
    dbType: DbOrganizationType,
  ): OrganizationTypeEnum {
    switch (dbType) {
      case "COMPANY":
        return OrganizationTypeEnum.COMPANY;
      case "DEPARTMENT":
        return OrganizationTypeEnum.DEPARTMENT;
      case "TEAM":
        return OrganizationTypeEnum.TEAM;
      case "PROJECT":
        return OrganizationTypeEnum.PROJECT;
      default:
        throw new Error(`Unknown organization type: ${dbType}`);
    }
  }

  /**
   * 将领域类型转换为数据库类型
   *
   * @param domainType - 领域类型
   * @returns 数据库类型
   */
  private static mapDomainTypeToDbType(
    domainType: OrganizationTypeEnum,
  ): DbOrganizationType {
    switch (domainType) {
      case OrganizationTypeEnum.COMPANY:
        return "COMPANY";
      case OrganizationTypeEnum.DEPARTMENT:
        return "DEPARTMENT";
      case OrganizationTypeEnum.TEAM:
        return "TEAM";
      case OrganizationTypeEnum.PROJECT:
        return "PROJECT";
      default:
        throw new Error(`Unknown organization type: ${domainType}`);
    }
  }

  /**
   * 将数据库状态转换为领域状态
   *
   * @param dbStatus - 数据库状态
   * @returns 领域状态
   */
  private static mapDbStatusToDomainStatus(
    dbStatus: DbOrganizationStatus,
  ): OrganizationStatusEnum {
    switch (dbStatus) {
      case "ACTIVE":
        return OrganizationStatusEnum.ACTIVE;
      case "INACTIVE":
        return OrganizationStatusEnum.INACTIVE;
      case "SUSPENDED":
        return OrganizationStatusEnum.SUSPENDED;
      default:
        throw new Error(`Unknown organization status: ${dbStatus}`);
    }
  }

  /**
   * 将领域状态转换为数据库状态
   *
   * @param domainStatus - 领域状态
   * @returns 数据库状态
   */
  private static mapDomainStatusToDbStatus(
    domainStatus: OrganizationStatusEnum,
  ): DbOrganizationStatus {
    switch (domainStatus) {
      case OrganizationStatusEnum.ACTIVE:
        return "ACTIVE";
      case OrganizationStatusEnum.INACTIVE:
        return "INACTIVE";
      case OrganizationStatusEnum.SUSPENDED:
        return "SUSPENDED";
      default:
        throw new Error(`Unknown organization status: ${domainStatus}`);
    }
  }
}
