/**
 * 角色仓储接口
 *
 * @description 定义角色实体的持久化接口，遵循DDD仓储模式
 * @since 1.0.0
 */

import { Role } from "../entities/role.entity.js";
import { RoleId } from "@hl8/domain-kernel";
import { IsolationContext } from "../value-objects/isolation-context.vo.js";

/**
 * 角色仓储接口
 *
 * 定义角色实体的持久化操作。
 */
export interface IRoleRepository {
  /**
   * 根据ID查找角色
   */
  findById(id: RoleId, context?: IsolationContext): Promise<Role | null>;

  /**
   * 根据名称查找角色
   */
  findByName(name: string, context?: IsolationContext): Promise<Role | null>;

  /**
   * 检查角色名称是否存在
   */
  existsByName(
    name: string,
    excludeId?: RoleId,
    context?: IsolationContext,
  ): Promise<boolean>;

  /**
   * 查找所有角色
   */
  findAll(context?: IsolationContext): Promise<Role[]>;

  /**
   * 保存角色
   */
  save(role: Role, context?: IsolationContext): Promise<void>;

  /**
   * 删除角色
   */
  delete(id: RoleId, context?: IsolationContext): Promise<void>;
}
