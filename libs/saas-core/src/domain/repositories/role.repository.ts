/**
 * 角色仓储接口
 * @description 定义角色聚合根的持久化契约
 *
 * @since 1.0.0
 */
import { GenericEntityId } from "@hl8/domain-kernel";
import { Role } from "../aggregates/role.aggregate.js";
import { RoleType } from "../value-objects/role-type.vo.js";

/**
 * 角色仓储接口
 */
export interface IRoleRepository {
  /**
   * 保存角色
   * @param role - 角色聚合根
   * @returns Promise<void>
   */
  save(role: Role): Promise<void>;

  /**
   * 根据ID查找角色
   * @param id - 角色ID
   * @returns 角色聚合根或null
   */
  findById(id: GenericEntityId): Promise<Role | null>;

  /**
   * 根据代码查找角色
   * @param code - 角色代码
   * @returns 角色聚合根或null
   */
  findByCode(code: string): Promise<Role | null>;

  /**
   * 根据类型查找角色列表
   * @param type - 角色类型
   * @param offset - 偏移量
   * @param limit - 限制数量
   * @returns 角色列表和总数
   */
  findByType(
    type: RoleType,
    offset?: number,
    limit?: number,
  ): Promise<{ roles: Role[]; total: number }>;

  /**
   * 查找分配给用户的所有角色
   * @param userId - 用户ID
   * @returns 角色列表
   */
  findByUser(userId: GenericEntityId): Promise<Role[]>;

  /**
   * 删除角色
   * @param id - 角色ID
   * @returns Promise<void>
   */
  delete(id: GenericEntityId): Promise<void>;
}
