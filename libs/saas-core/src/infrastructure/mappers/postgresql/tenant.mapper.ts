/**
 * 租户实体映射器
 *
 * @description 在租户数据库实体和租户领域聚合根之间进行转换
 * @since 1.0.0
 */

import { TenantAggregate } from "../../domain/aggregates/tenant.aggregate.js";
import { Tenant } from "../../domain/entities/index.js";
import {
  TenantCode,
  TenantName,
  TenantType,
  TenantStatus,
} from "../../domain/value-objects/index.js";
import { TenantId } from "@hl8/domain-kernel";
import { EntityId } from "@hl8/domain-kernel";
import { TenantEntity, TenantType as DbTenantType, TenantStatus as DbTenantStatus } from "../../entities/postgresql/tenant.entity.js";

/**
 * 租户映射器
 *
 * 负责在数据库实体和领域聚合根之间进行双向转换：
 * - toDomain: 将数据库实体转换为领域聚合根
 * - toEntity: 将领域聚合根转换为数据库实体
 */
export class TenantMapper {
  /**
   * 将数据库实体转换为领域聚合根
   *
   * @param entity - 数据库实体
   * @returns 领域聚合根
   */
  static toDomain(entity: TenantEntity): TenantAggregate {
    // 转换值对象
    const tenantId = TenantId.create(entity.id);
    const code = new TenantCode(entity.code);
    const name = new TenantName(entity.name);
    const type = this.mapDbTypeToDomainType(entity.type);
    const status = this.mapDbStatusToDomainStatus(entity.status);

    // 创建领域聚合根
    return new TenantAggregate(
      tenantId,
      code,
      name,
      type,
      status,
      entity.description,
      entity.contactEmail,
      entity.contactPhone,
      entity.address,
      entity.subscriptionStartDate,
      entity.subscriptionEndDate,
      entity.settings || {},
    );
  }

  /**
   * 将领域聚合根转换为数据库实体
   *
   * @param aggregate - 领域聚合根
   * @returns 数据库实体
   */
  static toEntity(aggregate: TenantAggregate): TenantEntity {
    const tenant = aggregate.tenant;

    // 转换值对象为数据库格式
    const dbType = this.mapDomainTypeToDbType(tenant.type);
    const dbStatus = this.mapDomainStatusToDbStatus(tenant.status);

    return new TenantEntity({
      id: aggregate.id.getValue(),
      code: tenant.code.value,
      name: tenant.name.value,
      type: dbType,
      status: dbStatus,
      description: tenant.description,
      contactEmail: tenant.contactEmail,
      contactPhone: tenant.contactPhone,
      address: tenant.address,
      subscriptionStartDate: tenant.subscriptionStartDate,
      subscriptionEndDate: tenant.subscriptionEndDate,
      settings: tenant.settings,
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
    dbType: DbTenantType,
  ): TenantType {
    switch (dbType) {
      case DbTenantType.FREE:
        return new TenantType(
          require("../../domain/value-objects/index.js").TenantTypeEnum.FREE,
        );
      case DbTenantType.BASIC:
        return new TenantType(
          require("../../domain/value-objects/index.js").TenantTypeEnum.BASIC,
        );
      case DbTenantType.PROFESSIONAL:
        return new TenantType(
          require("../../domain/value-objects/index.js")
            .TenantTypeEnum.PROFESSIONAL,
        );
      case DbTenantType.ENTERPRISE:
        return new TenantType(
          require("../../domain/value-objects/index.js")
            .TenantTypeEnum.ENTERPRISE,
        );
      case DbTenantType.CUSTOM:
        return new TenantType(
          require("../../domain/value-objects/index.js").TenantTypeEnum.CUSTOM,
        );
      default:
        throw new Error(`Unknown tenant type: ${dbType}`);
    }
  }

  /**
   * 将领域类型转换为数据库类型
   *
   * @param domainType - 领域类型
   * @returns 数据库类型
   */
  private static mapDomainTypeToDbType(domainType: TenantType): DbTenantType {
    const typeValue = domainType.value;
    switch (typeValue) {
      case "FREE":
        return DbTenantType.FREE;
      case "BASIC":
        return DbTenantType.BASIC;
      case "PROFESSIONAL":
        return DbTenantType.PROFESSIONAL;
      case "ENTERPRISE":
        return DbTenantType.ENTERPRISE;
      case "CUSTOM":
        return DbTenantType.CUSTOM;
      default:
        throw new Error(`Unknown domain type: ${typeValue}`);
    }
  }

  /**
   * 将数据库状态转换为领域状态
   *
   * @param dbStatus - 数据库状态
   * @returns 领域状态
   */
  private static mapDbStatusToDomainStatus(
    dbStatus: DbTenantStatus,
  ): TenantStatus {
    switch (dbStatus) {
      case DbTenantStatus.TRIAL:
        return new TenantStatus(
          require("../../domain/value-objects/index.js").TenantStatusEnum.TRIAL,
        );
      case DbTenantStatus.ACTIVE:
        return new TenantStatus(
          require("../../domain/value-objects/index.js")
            .TenantStatusEnum.ACTIVE,
        );
      case DbTenantStatus.SUSPENDED:
        return new TenantStatus(
          require("../../domain/value-objects/index.js")
            .TenantStatusEnum.SUSPENDED,
        );
      case DbTenantStatus.EXPIRED:
        return new TenantStatus(
          require("../../domain/value-objects/index.js")
            .TenantStatusEnum.EXPIRED,
        );
      case DbTenantStatus.DELETED:
        return new TenantStatus(
          require("../../domain/value-objects/index.js")
            .TenantStatusEnum.DELETED,
        );
      default:
        throw new Error(`Unknown tenant status: ${dbStatus}`);
    }
  }

  /**
   * 将领域状态转换为数据库状态
   *
   * @param domainStatus - 领域状态
   * @returns 数据库状态
   */
  private static mapDomainStatusToDbStatus(
    domainStatus: TenantStatus,
  ): DbTenantStatus {
    const statusValue = domainStatus.value;
    switch (statusValue) {
      case "TRIAL":
        return DbTenantStatus.TRIAL;
      case "ACTIVE":
        return DbTenantStatus.ACTIVE;
      case "SUSPENDED":
        return DbTenantStatus.SUSPENDED;
      case "EXPIRED":
        return DbTenantStatus.EXPIRED;
      case "DELETED":
        return DbTenantStatus.DELETED;
      default:
        throw new Error(`Unknown domain status: ${statusValue}`);
    }
  }
}
