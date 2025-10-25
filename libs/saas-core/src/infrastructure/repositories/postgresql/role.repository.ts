/**
 * 角色仓储实现（PostgreSQL）
 *
 * @description 使用MikroORM实现角色实体的PostgreSQL持久化仓储
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/core";
import { IRoleRepository } from "../../../domain/repositories/role.repository.js";
import { Role } from "../../../domain/entities/role.entity.js";
import { RoleId } from "@hl8/domain-kernel";
import { IsolationContext } from "../../../domain/value-objects/isolation-context.vo.js";
import { RoleEntity } from "../../entities/postgresql/role.entity.js";
import { RoleMapper } from "../../mappers/postgresql/role.mapper.js";

/**
 * 角色仓储（PostgreSQL）
 */
@Injectable()
export class RoleRepositoryPostgreSQL implements IRoleRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: RoleId, context?: IsolationContext): Promise<Role | null> {
    const entity = await this.em.findOne(RoleEntity, { id: id.getValue() });
    if (!entity) return null;
    // TODO: 应用IsolationContext过滤
    return RoleMapper.toDomain(entity);
  }

  async findByName(
    name: string,
    context?: IsolationContext,
  ): Promise<Role | null> {
    const entity = await this.em.findOne(RoleEntity, { name: name });
    if (!entity) return null;
    // TODO: 应用IsolationContext过滤
    return RoleMapper.toDomain(entity);
  }

  async existsByName(
    name: string,
    excludeId?: RoleId,
    context?: IsolationContext,
  ): Promise<boolean> {
    const entities = await this.em.find(RoleEntity, { name: name });
    if (!excludeId) return entities.length > 0;
    return entities.some((entity) => entity.id !== excludeId.getValue());
  }

  async findAll(context?: IsolationContext): Promise<Role[]> {
    const entities = await this.em.find(RoleEntity, {});
    // TODO: 应用IsolationContext过滤
    return entities.map((entity) => RoleMapper.toDomain(entity));
  }

  async save(role: Role, context?: IsolationContext): Promise<void> {
    const entity = RoleMapper.toEntity(role);
    const existing = await this.em.findOne(RoleEntity, { id: entity.id });
    if (existing) {
      Object.assign(existing, entity);
      existing.updatedAt = new Date();
      existing.version += 1;
      await this.em.persistAndFlush(existing);
    } else {
      await this.em.persistAndFlush(entity);
    }
  }

  async delete(id: RoleId, context?: IsolationContext): Promise<void> {
    const entity = await this.em.findOne(RoleEntity, { id: id.getValue() });
    if (entity) await this.em.removeAndFlush(entity);
  }
}
