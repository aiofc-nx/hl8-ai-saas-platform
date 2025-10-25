/**
 * 部门仓储实现（PostgreSQL）
 *
 * @description 使用MikroORM实现部门聚合的PostgreSQL持久化仓储
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/core";
import { IDepartmentRepository } from "../../../domain/repositories/department.repository.js";
import { DepartmentAggregate } from "../../../domain/aggregates/department.aggregate.js";
import { DepartmentId } from "@hl8/domain-kernel";
import { IsolationContext } from "@hl8/domain-kernel";
import { DepartmentEntity } from "../../entities/postgresql/department.entity.js";
import { DepartmentMapper } from "../../mappers/postgresql/department.mapper.js";

/**
 * 部门仓储（PostgreSQL）
 */
@Injectable()
export class DepartmentRepositoryPostgreSQL implements IDepartmentRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(
    id: DepartmentId,
    context?: IsolationContext,
  ): Promise<DepartmentAggregate | null> {
    const entity = await this.em.findOne(DepartmentEntity, {
      id: id.getValue(),
    });
    if (!entity) return null;
    // TODO: 应用IsolationContext过滤
    return DepartmentMapper.toDomain(entity);
  }

  async findByName(
    name: string,
    context?: IsolationContext,
  ): Promise<DepartmentAggregate | null> {
    const entity = await this.em.findOne(DepartmentEntity, { name: name });
    if (!entity) return null;
    // TODO: 应用IsolationContext过滤
    return DepartmentMapper.toDomain(entity);
  }

  async existsByName(
    name: string,
    excludeId?: DepartmentId,
    context?: IsolationContext,
  ): Promise<boolean> {
    const entities = await this.em.find(DepartmentEntity, { name: name });
    if (!excludeId) return entities.length > 0;
    return entities.some((entity) => entity.id !== excludeId.getValue());
  }

  async findAll(context?: IsolationContext): Promise<DepartmentAggregate[]> {
    const entities = await this.em.find(DepartmentEntity, {});
    // TODO: 应用IsolationContext过滤
    return entities.map((entity) => DepartmentMapper.toDomain(entity));
  }

  async save(
    aggregate: DepartmentAggregate,
    context?: IsolationContext,
  ): Promise<void> {
    const entity = DepartmentMapper.toEntity(aggregate.department);
    const existing = await this.em.findOne(DepartmentEntity, {
      id: entity.id,
    });
    if (existing) {
      Object.assign(existing, entity);
      existing.updatedAt = new Date();
      existing.version += 1;
      await this.em.persistAndFlush(existing);
    } else {
      await this.em.persistAndFlush(entity);
    }
  }

  async delete(id: DepartmentId, context?: IsolationContext): Promise<void> {
    const entity = await this.em.findOne(DepartmentEntity, {
      id: id.getValue(),
    });
    if (entity) await this.em.removeAndFlush(entity);
  }
}
