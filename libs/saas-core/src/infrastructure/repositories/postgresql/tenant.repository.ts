/**
 * 租户仓储实现（PostgreSQL）
 *
 * @description 使用MikroORM实现租户聚合的PostgreSQL持久化仓储
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/core";
import { FilterQuery } from "@mikro-orm/core";
import { ITenantRepository } from "../../../domain/repositories/tenant.repository.js";
import { TenantAggregate } from "../../../domain/aggregates/tenant.aggregate.js";
import { TenantId } from "@hl8/domain-kernel";
import { TenantCode } from "../../../domain/value-objects/tenant-code.vo.js";
import { TenantName } from "../../../domain/value-objects/tenant-name.vo.js";
import { TenantType } from "../../../domain/value-objects/tenant-type.vo.js";
import { TenantStatus } from "../../../domain/value-objects/tenant-status.vo.js";
import { IsolationContext } from "../../../domain/value-objects/isolation-context.vo.js";
import { TenantEntity } from "../../entities/postgresql/tenant.entity.js";
import { TenantMapper } from "../../mappers/postgresql/tenant.mapper.js";

/**
 * 租户仓储（PostgreSQL）
 *
 * 实现租户聚合的PostgreSQL持久化操作，使用MikroORM进行数据库交互。
 * 通过TenantMapper在领域聚合和数据库实体之间进行转换。
 */
@Injectable()
export class TenantRepositoryPostgreSQL implements ITenantRepository {
  constructor(private readonly em: EntityManager) {}

  /**
   * 根据ID查找租户聚合
   *
   * @param id - 租户ID
   * @param context - 隔离上下文（可选）
   * @returns 租户聚合或null
   */
  async findById(
    id: TenantId,
    context?: IsolationContext,
  ): Promise<TenantAggregate | null> {
    const entity = await this.em.findOne(TenantEntity, {
      id: id.getValue(),
    });

    if (!entity) {
      return null;
    }

    // TODO: 应用IsolationContext过滤

    return TenantMapper.toDomain(entity);
  }

  /**
   * 根据代码查找租户聚合
   *
   * @param code - 租户代码
   * @param context - 隔离上下文（可选）
   * @returns 租户聚合或null
   */
  async findByCode(
    code: TenantCode,
    context?: IsolationContext,
  ): Promise<TenantAggregate | null> {
    const entity = await this.em.findOne(TenantEntity, {
      code: code.value,
    });

    if (!entity) {
      return null;
    }

    // TODO: 应用IsolationContext过滤

    return TenantMapper.toDomain(entity);
  }

  /**
   * 根据名称查找租户聚合
   *
   * @param name - 租户名称
   * @param context - 隔离上下文（可选）
   * @returns 租户聚合或null
   */
  async findByName(
    name: TenantName,
    context?: IsolationContext,
  ): Promise<TenantAggregate | null> {
    const entity = await this.em.findOne(TenantEntity, {
      name: name.value,
    });

    if (!entity) {
      return null;
    }

    // TODO: 应用IsolationContext过滤

    return TenantMapper.toDomain(entity);
  }

  /**
   * 检查租户代码是否存在
   *
   * @param code - 租户代码
   * @param excludeId - 排除的租户ID（可选）
   * @param context - 隔离上下文（可选）
   * @returns 是否存在
   */
  async existsByCode(
    code: TenantCode,
    excludeId?: TenantId,
    context?: IsolationContext,
  ): Promise<boolean> {
    const entities = await this.em.find(TenantEntity, { code: code.value });
    if (!excludeId) {
      return entities.length > 0;
    }
    return entities.some((entity) => entity.id !== excludeId.getValue());
  }

  /**
   * 检查租户名称是否存在
   *
   * @param name - 租户名称
   * @param excludeId - 排除的租户ID（可选）
   * @param context - 隔离上下文（可选）
   * @returns 是否存在
   */
  async existsByName(
    name: TenantName,
    excludeId?: TenantId,
    context?: IsolationContext,
  ): Promise<boolean> {
    const entities = await this.em.find(TenantEntity, { name: name.value });
    if (!excludeId) {
      return entities.length > 0;
    }
    return entities.some((entity) => entity.id !== excludeId.getValue());
  }

  /**
   * 根据类型查找租户聚合列表
   *
   * @param type - 租户类型
   * @param context - 隔离上下文（可选）
   * @returns 租户聚合列表
   */
  async findByType(
    type: TenantType,
    context?: IsolationContext,
  ): Promise<TenantAggregate[]> {
    // TODO: 转换TenantType到数据库类型
    // Note: TenantMapper should handle this conversion
    const entities = await this.em.find(TenantEntity, {});

    // TODO: 应用IsolationContext过滤

    return entities
      .filter((entity) => {
        // Filter by type - this needs to be implemented properly based on the actual value object
        return true; // Placeholder
      })
      .map((entity) => TenantMapper.toDomain(entity));
  }

  /**
   * 根据状态查找租户聚合列表
   *
   * @param status - 租户状态
   * @param context - 隔离上下文（可选）
   * @returns 租户聚合列表
   */
  async findByStatus(
    status: TenantStatus,
    context?: IsolationContext,
  ): Promise<TenantAggregate[]> {
    // TODO: 转换TenantStatus到数据库状态
    // Note: TenantMapper should handle this conversion
    const entities = await this.em.find(TenantEntity, {});

    // TODO: 应用IsolationContext过滤

    return entities
      .filter((entity) => {
        // Filter by status - this needs to be implemented properly based on the actual value object
        return true; // Placeholder
      })
      .map((entity) => TenantMapper.toDomain(entity));
  }

  /**
   * 查找所有租户聚合
   *
   * @param context - 隔离上下文（可选）
   * @returns 租户聚合列表
   */
  async findAll(context?: IsolationContext): Promise<TenantAggregate[]> {
    const entities = await this.em.find(TenantEntity, {});

    // TODO: 应用IsolationContext过滤

    return entities.map((entity) => TenantMapper.toDomain(entity));
  }

  /**
   * 保存租户聚合
   *
   * @param aggregate - 租户聚合
   * @param context - 隔离上下文（可选）
   */
  async save(
    aggregate: TenantAggregate,
    context?: IsolationContext,
  ): Promise<void> {
    const entity = TenantMapper.toEntity(aggregate);

    // 检查是否存在
    const existing = await this.em.findOne(TenantEntity, {
      id: entity.id,
    });

    if (existing) {
      // 更新现有实体
      Object.assign(existing, entity);
      existing.updatedAt = new Date();
      existing.version += 1;
      await this.em.persistAndFlush(existing);
    } else {
      // 创建新实体
      await this.em.persistAndFlush(entity);
    }
  }

  /**
   * 删除租户聚合
   *
   * @param id - 租户ID
   * @param context - 隔离上下文（可选）
   */
  async delete(id: TenantId, context?: IsolationContext): Promise<void> {
    const entity = await this.em.findOne(TenantEntity, {
      id: id.getValue(),
    });

    if (entity) {
      await this.em.removeAndFlush(entity);
    }
  }

  /**
   * 批量保存租户聚合
   *
   * @param aggregates - 租户聚合列表
   * @param context - 隔离上下文（可选）
   */
  async saveAll(
    aggregates: TenantAggregate[],
    context?: IsolationContext,
  ): Promise<void> {
    for (const aggregate of aggregates) {
      await this.save(aggregate, context);
    }
  }

  /**
   * 批量删除租户聚合
   *
   * @param ids - 租户ID列表
   * @param context - 隔离上下文（可选）
   */
  async deleteAll(ids: TenantId[], context?: IsolationContext): Promise<void> {
    const idStrings = ids.map((id) => id.getValue());
    await this.em.nativeDelete(TenantEntity, { id: { $in: idStrings } });
  }
}
