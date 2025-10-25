/**
 * 组织仓储接口
 *
 * @description 定义组织聚合的持久化接口，遵循DDD仓储模式
 * @since 1.0.0
 */

import { OrganizationAggregate } from "../aggregates/organization.aggregate.js";
import { OrganizationId } from "@hl8/domain-kernel";
import { IsolationContext } from "@hl8/domain-kernel";

/**
 * 组织仓储接口
 *
 * 定义组织聚合的持久化操作。
 *
 * @example
 * ```typescript
 * class OrganizationRepositoryAdapter implements IOrganizationRepository {
 *   async findById(id: OrganizationId): Promise<OrganizationAggregate | null> {
 *     // 实现细节
 *   }
 * }
 * ```
 */
export interface IOrganizationRepository {
  /**
   * 根据ID查找组织聚合
   */
  findById(
    id: OrganizationId,
    context?: IsolationContext,
  ): Promise<OrganizationAggregate | null>;

  /**
   * 根据名称查找组织聚合
   */
  findByName(
    name: string,
    context?: IsolationContext,
  ): Promise<OrganizationAggregate | null>;

  /**
   * 检查组织名称是否存在
   */
  existsByName(
    name: string,
    excludeId?: OrganizationId,
    context?: IsolationContext,
  ): Promise<boolean>;

  /**
   * 查找所有组织聚合
   */
  findAll(context?: IsolationContext): Promise<OrganizationAggregate[]>;

  /**
   * 保存组织聚合
   */
  save(
    aggregate: OrganizationAggregate,
    context?: IsolationContext,
  ): Promise<void>;

  /**
   * 删除组织聚合
   */
  delete(id: OrganizationId, context?: IsolationContext): Promise<void>;
}
