import { BaseSpecification } from "@hl8/domain-kernel";
import { User } from "../aggregates/user.aggregate.js";
import { PermissionScope } from "../value-objects/permission-scope.vo.js";
import { PermissionAction } from "../value-objects/permission-action.vo.js";
import { UserRole } from "../value-objects/user-role.vo.js";

/**
 * 用户权限上下文
 */
export interface UserPermissionContext {
  user: User;
  requiredPermission: {
    action: PermissionAction;
    scope: PermissionScope;
  };
}

/**
 * 用户权限规格
 * @description 检查用户是否拥有指定的权限
 */
export class UserPermissionSpecification extends BaseSpecification<UserPermissionContext> {
  /**
   * 检查用户是否满足权限要求
   * @param candidate - 候选对象（包含用户和权限要求）
   * @returns 是否满足规格
   */
  isSatisfiedBy(candidate: UserPermissionContext): boolean {
    const { user, requiredPermission } = candidate;
    const role = user.getRole();

    // 平台管理员拥有所有权限
    if (role === UserRole.PLATFORM_ADMIN) {
      return true;
    }

    // 租户管理员拥有租户范围内的所有权限
    if (role === UserRole.TENANT_ADMIN && requiredPermission.scope >= PermissionScope.TENANT) {
      return true;
    }

    // 组织管理员拥有组织范围内的所有权限
    if (role === UserRole.ORG_ADMIN && requiredPermission.scope >= PermissionScope.ORGANIZATION) {
      return true;
    }

    // 部门管理员拥有部门范围内的所有权限
    if (role === UserRole.DEPT_ADMIN && requiredPermission.scope >= PermissionScope.DEPARTMENT) {
      return true;
    }

    // TODO: 检查具体权限分配
    return false;
  }

  /**
   * 获取规格描述
   * @returns 规格描述
   */
  getDescription(): string {
    return "检查用户是否拥有指定的权限";
  }
}
