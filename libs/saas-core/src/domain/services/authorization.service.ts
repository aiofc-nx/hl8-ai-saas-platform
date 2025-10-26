import { GenericEntityId, BaseDomainService } from "@hl8/domain-kernel";
import { PermissionAction } from "../value-objects/permission-action.vo.js";
import { PermissionScope } from "../value-objects/permission-scope.vo.js";

/**
 * 授权领域服务接口
 * @description 提供用户授权的业务逻辑
 */
export interface IAuthorizationService {
  /**
   * 检查用户是否有权限
   */
  checkPermission(
    userId: GenericEntityId,
    action: PermissionAction,
    scope: PermissionScope,
    resourceId?: GenericEntityId,
  ): Promise<boolean>;

  /**
   * 检查用户是否有角色
   */
  checkRole(userId: GenericEntityId, roleType: string): Promise<boolean>;

  /**
   * 获取用户所有权限
   */
  getUserPermissions(userId: GenericEntityId): Promise<Set<string>>;

  /**
   * 获取用户所有角色
   */
  getUserRoles(userId: GenericEntityId): Promise<Set<string>>;
}

/**
 * 授权领域服务
 * @description 提供用户授权的业务逻辑
 *
 * @remarks
 * 授权服务的职责：
 * - 检查用户是否有权限执行某个操作
 * - 支持权限继承和角色继承
 * - 提供细粒度的访问控制
 *
 * @example
 * ```typescript
 * const authzService = new AuthorizationService();
 *
 * const hasPermission = await authzService.checkPermission(
 *   UserId.create('user-123'),
 *   PermissionAction.CREATE,
 *   PermissionScope.TENANT
 * );
 * ```
 */
export class AuthorizationService
  extends BaseDomainService
  implements IAuthorizationService
{
  public execute(_input: unknown): unknown {
    throw new Error(
      "AuthorizationService does not use execute method. Use specific methods instead.",
    );
  }

  public async checkPermission(
    userId: GenericEntityId,
    action: PermissionAction,
    scope: PermissionScope,
    resourceId?: GenericEntityId,
  ): Promise<boolean> {
    // TODO: 检查用户权限
    // 1. 查询用户直接分配的权限
    // 2. 查询用户角色关联的权限
    // 3. 检查权限层级（PLATFORM > TENANT > ORGANIZATION > DEPARTMENT > USER）
    return false;
  }

  public async checkRole(
    userId: GenericEntityId,
    roleType: string,
  ): Promise<boolean> {
    // TODO: 检查用户角色
    return false;
  }

  public async getUserPermissions(
    userId: GenericEntityId,
  ): Promise<Set<string>> {
    // TODO: 获取用户所有权限
    return new Set();
  }

  public async getUserRoles(userId: GenericEntityId): Promise<Set<string>> {
    // TODO: 获取用户所有角色
    return new Set();
  }
}
