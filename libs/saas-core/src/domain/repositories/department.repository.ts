/**
 * 部门仓储接口
 *
 * @description 定义部门聚合的持久化接口，遵循DDD仓储模式
 * @since 1.0.0
 */

import { DepartmentAggregate } from "../aggregates/department.aggregate.js";
import { DepartmentId } from "@hl8/domain-kernel";
import { IsolationContext } from "../value-objects/isolation-context.vo.js";

/**
 * 部门仓储接口
 *
 * 定义部门聚合的持久化操作。
 */
export interface IDepartmentRepository {
  /**
   * 根据ID查找部门聚合
   */
  findById(
    id: DepartmentId,
    context?: IsolationContext,
  ): Promise<DepartmentAggregate | null>;

  /**
   * 根据名称查找部门聚合
   */
  findByName(
    name: string,
    context?: IsolationContext,
  ): Promise<DepartmentAggregate | null>;

  /**
   * 检查部门名称是否存在
   */
  existsByName(
    name: string,
    excludeId?: DepartmentId,
    context?: IsolationContext,
  ): Promise<boolean>;

  /**
   * 查找所有部门聚合
   */
  findAll(context?: IsolationContext): Promise<DepartmentAggregate[]>;

  /**
   * 保存部门聚合
   */
  save(
    aggregate: DepartmentAggregate,
    context?: IsolationContext,
  ): Promise<void>;

  /**
   * 删除部门聚合
   */
  delete(id: DepartmentId, context?: IsolationContext): Promise<void>;
}
