/**
 * 租户仓储接口
 *
 * @description 定义租户聚合的持久化接口，遵循DDD仓储模式
 * @since 1.0.0
 */

import { TenantAggregate } from "../aggregates/tenant.aggregate.js";
import { TenantId } from "@hl8/domain-kernel";
import { TenantCode } from "../value-objects/tenant-code.vo.js";
import { TenantName } from "../value-objects/tenant-name.vo.js";
import { TenantType } from "../value-objects/tenant-type.vo.js";
import { TenantStatus } from "../value-objects/tenant-status.vo.js";
import { IsolationContext } from "../value-objects/isolation-context.vo.js";

/**
 * 租户仓储接口
 *
 * 定义租户聚合的持久化操作，包括查询、保存、删除等基础操作。
 * 仓储接口位于领域层，具体实现在基础设施层。
 *
 * @example
 * ```typescript
 * class TenantRepositoryAdapter implements ITenantRepository {
 *   async findById(id: TenantId): Promise<TenantAggregate | null> {
 *     // 实现细节
 *   }
 * }
 * ```
 */
export interface ITenantRepository {
  /**
   * 根据ID查找租户聚合
   *
   * @param id - 租户ID
   * @param context - 隔离上下文（可选）
   * @returns 租户聚合或null
   */
  findById(
    id: TenantId,
    context?: IsolationContext,
  ): Promise<TenantAggregate | null>;

  /**
   * 根据代码查找租户聚合
   *
   * @param code - 租户代码
   * @param context - 隔离上下文（可选）
   * @returns 租户聚合或null
   */
  findByCode(
    code: TenantCode,
    context?: IsolationContext,
  ): Promise<TenantAggregate | null>;

  /**
   * 根据名称查找租户聚合
   *
   * @param name - 租户名称
   * @param context - 隔离上下文（可选）
   * @returns 租户聚合或null
   */
  findByName(
    name: TenantName,
    context?: IsolationContext,
  ): Promise<TenantAggregate | null>;

  /**
   * 检查租户代码是否存在
   *
   * @param code - 租户代码
   * @param excludeId - 排除的租户ID（可选）
   * @param context - 隔离上下文（可选）
   * @returns 是否存在
   */
  existsByCode(
    code: TenantCode,
    excludeId?: TenantId,
    context?: IsolationContext,
  ): Promise<boolean>;

  /**
   * 检查租户名称是否存在
   *
   * @param name - 租户名称
   * @param excludeId - 排除的租户ID（可选）
   * @param context - 隔离上下文（可选）
   * @returns 是否存在
   */
  existsByName(
    name: TenantName,
    excludeId?: TenantId,
    context?: IsolationContext,
  ): Promise<boolean>;

  /**
   * 根据类型查找租户聚合列表
   *
   * @param type - 租户类型
   * @param context - 隔离上下文（可选）
   * @returns 租户聚合列表
   */
  findByType(
    type: TenantType,
    context?: IsolationContext,
  ): Promise<TenantAggregate[]>;

  /**
   * 根据状态查找租户聚合列表
   *
   * @param status - 租户状态
   * @param context - 隔离上下文（可选）
   * @returns 租户聚合列表
   */
  findByStatus(
    status: TenantStatus,
    context?: IsolationContext,
  ): Promise<TenantAggregate[]>;

  /**
   * 查找所有租户聚合
   *
   * @param context - 隔离上下文（可选）
   * @returns 租户聚合列表
   */
  findAll(context?: IsolationContext): Promise<TenantAggregate[]>;

  /**
   * 保存租户聚合
   *
   * @param aggregate - 租户聚合
   * @param context - 隔离上下文（可选）
   * @returns Promise<void>
   */
  save(aggregate: TenantAggregate, context?: IsolationContext): Promise<void>;

  /**
   * 删除租户聚合
   *
   * @param id - 租户ID
   * @param context - 隔离上下文（可选）
   * @returns Promise<void>
   */
  delete(id: TenantId, context?: IsolationContext): Promise<void>;

  /**
   * 批量保存租户聚合
   *
   * @param aggregates - 租户聚合列表
   * @param context - 隔离上下文（可选）
   * @returns Promise<void>
   */
  saveAll(
    aggregates: TenantAggregate[],
    context?: IsolationContext,
  ): Promise<void>;

  /**
   * 批量删除租户聚合
   *
   * @param ids - 租户ID列表
   * @param context - 隔离上下文（可选）
   * @returns Promise<void>
   */
  deleteAll(ids: TenantId[], context?: IsolationContext): Promise<void>;
}
