/**
 * 权限仓储接口
 * @description 定义权限聚合根的持久化契约
 *
 * @since 1.0.0
 */
import { GenericEntityId } from "@hl8/domain-kernel";
import { Permission } from "../aggregates/permission.aggregate.js";
import { PermissionAction } from "../value-objects/permission-action.vo.js";
import { PermissionScope } from "../value-objects/permission-scope.vo.js";

/**
 * 权限仓储接口
 */
export interface IPermissionRepository {
  /**
   * 保存权限
   * @param permission - 权限聚合根
   * @returns Promise<void>
   */
  save(permission: Permission): Promise<void>;

  /**
   * 根据ID查找权限
   * @param id - 权限ID
   * @returns 权限聚合根或null
   */
  findById(id: GenericEntityId): Promise<Permission | null>;

  /**
   * 根据代码查找权限
   * @param code - 权限代码
   * @returns 权限聚合根或null
   */
  findByCode(code: string): Promise<Permission | null>;

  /**
   * 根据操作和作用域查找权限
   * @param action - 操作类型
   * @param scope - 作用域
   * @returns 权限聚合根或null
   */
  findByActionAndScope(
    action: PermissionAction,
    scope: PermissionScope,
  ): Promise<Permission | null>;

  /**
   * 查找分配给用户的所有权限
   * @param userId - 用户ID
   * @returns 权限列表
   */
  findByUser(userId: GenericEntityId): Promise<Permission[]>;

  /**
   * 查找分配给角色的所有权限
   * @param roleId - 角色ID
   * @returns 权限列表
   */
  findByRole(roleId: GenericEntityId): Promise<Permission[]>;

  /**
   * 删除权限
   * @param id - 权限ID
   * @returns Promise<void>
   */
  delete(id: GenericEntityId): Promise<void>;
}
