/**
 * 组织仓储实现（PostgreSQL）
 *
 * @description 使用MikroORM实现组织聚合的PostgreSQL持久化仓储
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { EntityManager, FilterQuery } from "@mikro-orm/core";
import { IOrganizationRepository } from "../../../domain/repositories/organization.repository.js";
import { OrganizationAggregate } from "../../../domain/aggregates/organization.aggregate.js";
import { OrganizationId } from "@hl8/domain-kernel";
import { IsolationContext } from "@hl8/domain-kernel";
import { OrganizationEntity } from "../../entities/postgresql/organization.entity.js";
import { OrganizationMapper } from "../../mappers/postgresql/organization.mapper.js";

/**
 * 组织仓储（PostgreSQL）
 *
 * 实现组织聚合的PostgreSQL持久化操作，使用MikroORM进行数据库交互。
 * 通过OrganizationMapper在领域聚合和数据库实体之间进行转换。
 */
@Injectable()
export class OrganizationRepositoryPostgreSQL implements IOrganizationRepository {
  constructor(private readonly em: EntityManager) {}

  /**
   * 根据ID查找组织聚合
   *
   * @param id - 组织ID
   * @param context - 隔离上下文（可选）
   * @returns 组织聚合或null
   */
  async findById(
    id: OrganizationId,
    context?: IsolationContext,
  ): Promise<OrganizationAggregate | null> {
    const entity = await this.em.findOne(OrganizationEntity, {
      id: id.getValue(),
    });

    if (!entity) {
      return null;
    }

    // TODO: 应用IsolationContext过滤

    return OrganizationMapper.toDomain(entity);
  }

  /**
   * 根据名称查找组织聚合
   *
   * @param name - 组织名称
   * @param context - 隔离上下文（可选）
   * @returns 组织聚合或null
   */
  async findByName(
    name: string,
    context?: IsolationContext,
  ): Promise<OrganizationAggregate | null> {
    const entity = await this.em.findOne(OrganizationEntity, {
      name: name,
    });

    if (!entity) {
      return null;
    }

    // TODO: 应用IsolationContext过滤

    return OrganizationMapper.toDomain(entity);
  }

  /**
   * 检查组织名称是否存在
   *
   * @param name - 组织名称
   * @param excludeId - 排除的组织ID（可选）
   * @param context - 隔离上下文（可选）
   * @returns 是否存在
   */
  async existsByName(
    name: string,
    excludeId?: OrganizationId,
    context?: IsolationContext,
  ): Promise<boolean> {
    const entities = await this.em.find(OrganizationEntity, { name: name });
    if (!excludeId) {
      return entities.length > 0;
    }
    return entities.some((entity) => entity.id !== excludeId.getValue());
  }

  /**
   * 查找所有组织聚合
   *
   * @param context - 隔离上下文（可选）
   * @returns 组织聚合列表
   */
  async findAll(context?: IsolationContext): Promise<OrganizationAggregate[]> {
    const entities = await this.em.find(OrganizationEntity, {});

    // TODO: 应用IsolationContext过滤

    return entities.map((entity) => OrganizationMapper.toDomain(entity));
  }

  /**
   * 保存组织聚合
   *
   * @param aggregate - 组织聚合
   * @param context - 隔离上下文（可选）
   */
  async save(
    aggregate: OrganizationAggregate,
    context?: IsolationContext,
  ): Promise<void> {
    const entity = OrganizationMapper.toEntity(aggregate);

    // 检查是否存在
    const existing = await this.em.findOne(OrganizationEntity, {
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
   * 删除组织聚合
   *
   * @param id - 组织ID
   * @param context - 隔离上下文（可选）
   */
  async delete(id: OrganizationId, context?: IsolationContext): Promise<void> {
    const entity = await this.em.findOne(OrganizationEntity, {
      id: id.getValue(),
    });

    if (entity) {
      await this.em.removeAndFlush(entity);
    }
  }
}
