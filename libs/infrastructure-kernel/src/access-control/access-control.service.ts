/**
 * 访问控制服务
 * @description 提供基于隔离上下文的访问控制能力
 */
import { IsolationContext } from "../isolation/isolation-context.js";
import { IsolationLevel } from "@hl8/domain-kernel";

/**
 * 访问控制服务
 */
export class AccessControlService {
  /**
   * 检查是否允许访问
   * @param userContext - 用户隔离上下文
   * @param resourceContext - 资源隔离上下文
   * @param requiredLevel - 所需隔离级别
   * @returns 是否允许访问
   */
  canAccess(
    userContext: IsolationContext,
    resourceContext: IsolationContext,
    requiredLevel: IsolationLevel,
  ): boolean {
    // 检查用户上下文是否满足所需隔离级别
    if (!this.hasRequiredLevel(userContext, requiredLevel)) {
      return false;
    }

    // 检查资源访问权限
    return this.checkResourceAccess(userContext, resourceContext);
  }

  /**
   * 检查用户上下文是否满足所需隔离级别
   * @param userContext - 用户隔离上下文
   * @param requiredLevel - 所需隔离级别
   * @returns 是否满足
   */
  private hasRequiredLevel(
    userContext: IsolationContext,
    requiredLevel: IsolationLevel,
  ): boolean {
    const userLevel = userContext.getIsolationLevel();
    // 用户隔离级别应该大于等于所需隔离级别
    // 例如：用户级用户 >= 租户级要求 = true
    return this.compareIsolationLevels(userLevel, requiredLevel) >= 0;
  }

  /**
   * 比较隔离级别
   * @param level1 - 级别1
   * @param level2 - 级别2
   * @returns 比较结果：>0 表示 level1 > level2，=0 表示相等，<0 表示 level1 < level2
   */
  private compareIsolationLevels(
    level1: IsolationLevel,
    level2: IsolationLevel,
  ): number {
    const levels = [
      IsolationLevel.PLATFORM,
      IsolationLevel.TENANT,
      IsolationLevel.ORGANIZATION,
      IsolationLevel.DEPARTMENT,
      IsolationLevel.USER,
    ];
    const index1 = levels.indexOf(level1);
    const index2 = levels.indexOf(level2);
    return index1 - index2;
  }

  /**
   * 检查资源访问权限
   * @param userContext - 用户隔离上下文
   * @param resourceContext - 资源隔离上下文
   * @returns 是否允许访问
   */
  private checkResourceAccess(
    userContext: IsolationContext,
    resourceContext: IsolationContext,
  ): boolean {
    // 平台级资源对所有用户可见
    if (resourceContext.getIsolationLevel() === IsolationLevel.PLATFORM) {
      return true;
    }

    // 租户级资源检查
    if (resourceContext.isTenantLevel()) {
      return this.checkTenantAccess(userContext, resourceContext);
    }

    // 组织级资源检查
    if (resourceContext.isOrganizationLevel()) {
      return this.checkOrganizationAccess(userContext, resourceContext);
    }

    // 部门级资源检查
    if (resourceContext.isDepartmentLevel()) {
      return this.checkDepartmentAccess(userContext, resourceContext);
    }

    // 用户级资源检查
    if (resourceContext.isUserLevel()) {
      return this.checkUserAccess(userContext, resourceContext);
    }

    return false;
  }

  /**
   * 检查租户级访问权限
   */
  private checkTenantAccess(
    userContext: IsolationContext,
    resourceContext: IsolationContext,
  ): boolean {
    if (!userContext.tenantId || !resourceContext.tenantId) {
      return false;
    }
    return userContext.tenantId.equals(resourceContext.tenantId);
  }

  /**
   * 检查组织级访问权限
   */
  private checkOrganizationAccess(
    userContext: IsolationContext,
    resourceContext: IsolationContext,
  ): boolean {
    if (!this.checkTenantAccess(userContext, resourceContext)) {
      return false;
    }
    if (!userContext.organizationId || !resourceContext.organizationId) {
      return false;
    }
    return userContext.organizationId.equals(resourceContext.organizationId);
  }

  /**
   * 检查部门级访问权限
   */
  private checkDepartmentAccess(
    userContext: IsolationContext,
    resourceContext: IsolationContext,
  ): boolean {
    if (!this.checkOrganizationAccess(userContext, resourceContext)) {
      return false;
    }
    if (!userContext.departmentId || !resourceContext.departmentId) {
      return false;
    }
    return userContext.departmentId.equals(resourceContext.departmentId);
  }

  /**
   * 检查用户级访问权限
   */
  private checkUserAccess(
    userContext: IsolationContext,
    resourceContext: IsolationContext,
  ): boolean {
    if (!this.checkDepartmentAccess(userContext, resourceContext)) {
      return false;
    }
    if (!userContext.userId || !resourceContext.userId) {
      return false;
    }
    return userContext.userId.equals(resourceContext.userId);
  }
}
