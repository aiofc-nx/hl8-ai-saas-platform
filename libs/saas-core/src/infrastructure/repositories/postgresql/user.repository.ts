/**
 * 用户仓储实现（PostgreSQL）
 *
 * @description 使用MikroORM实现用户实体的PostgreSQL持久化仓储
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/core";
import { IUserRepository } from "../../../domain/repositories/user.repository.js";
import { User } from "../../../domain/entities/user.entity.js";
import { UserId } from "@hl8/domain-kernel"";
import { IsolationContext } from "../../../domain/value-objects/isolation-context.vo.js";
import { UserEntity } from "../../entities/postgresql/user.entity.js";
import { UserMapper } from "../../mappers/postgresql/user.mapper.js";

/**
 * 用户仓储（PostgreSQL）
 */
@Injectable()
export class UserRepositoryPostgreSQL implements IUserRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: UserId, context?: IsolationContext): Promise<User | null> {
    const entity = await this.em.findOne(UserEntity, { id: id.getValue() });
    if (!entity) return null;
    // TODO: 应用IsolationContext过滤
    return UserMapper.toDomain(entity);
  }

  async findByEmail(
    email: string,
    context?: IsolationContext,
  ): Promise<User | null> {
    const entity = await this.em.findOne(UserEntity, { email: email });
    if (!entity) return null;
    // TODO: 应用IsolationContext过滤
    return UserMapper.toDomain(entity);
  }

  async existsByEmail(
    email: string,
    excludeId?: UserId,
    context?: IsolationContext,
  ): Promise<boolean> {
    const entities = await this.em.find(UserEntity, { email: email });
    if (!excludeId) return entities.length > 0;
    return entities.some((entity) => entity.id !== excludeId.getValue());
  }

  async findAll(context?: IsolationContext): Promise<User[]> {
    const entities = await this.em.find(UserEntity, {});
    // TODO: 应用IsolationContext过滤
    return entities.map((entity) => UserMapper.toDomain(entity));
  }

  async save(user: User, context?: IsolationContext): Promise<void> {
    const entity = UserMapper.toEntity(user);
    const existing = await this.em.findOne(UserEntity, { id: entity.id });
    if (existing) {
      Object.assign(existing, entity);
      existing.updatedAt = new Date();
      existing.version += 1;
      await this.em.persistAndFlush(existing);
    } else {
      await this.em.persistAndFlush(entity);
    }
  }

  async delete(id: UserId, context?: IsolationContext): Promise<void> {
    const entity = await this.em.findOne(UserEntity, { id: id.getValue() });
    if (entity) await this.em.removeAndFlush(entity);
  }
}
