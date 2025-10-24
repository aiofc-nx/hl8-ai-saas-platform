import { BaseValueObject } from "./base-value-object.js";
import { PlatformId } from "./platform-id.vo.js";
import { TenantId } from "./tenant-id.vo.js";
import { OrganizationId } from "./organization-id.vo.js";
import { DepartmentId } from "./department-id.vo.js";
import { UserId } from "./user-id.vo.js";

/**
 * 隔离上下文值对象
 *
 * @description 表示数据隔离的上下文信息，包含完整的层级结构
 * @since 1.0.0
 */
export interface IsolationContextData {
  platformId: PlatformId;
  tenantId: TenantId;
  organizationId?: OrganizationId | null;
  departmentId?: DepartmentId | null;
  userId?: UserId | null;
}

/**
 * 隔离上下文值对象
 *
 * @description 表示数据隔离的上下文信息，包含完整的层级结构
 * @since 1.0.0
 */
export class IsolationContext extends BaseValueObject<IsolationContextData> {
  /**
   * 验证隔离上下文值
   *
   * @param value - 隔离上下文值
   * @throws {Error} 当隔离上下文格式无效时抛出错误
   */
  protected validateValue(value: IsolationContextData): void {
    if (!value) {
      throw new Error("隔离上下文不能为空");
    }

    if (!value.platformId) {
      throw new Error("平台ID不能为空");
    }

    if (!value.tenantId) {
      throw new Error("租户ID不能为空");
    }

    // 验证层级关系：如果存在部门ID，则必须存在组织ID
    if (value.departmentId && !value.organizationId) {
      throw new Error("如果存在部门ID，则必须存在组织ID");
    }

    // 验证层级关系：如果存在用户ID，则必须存在组织ID
    if (value.userId && !value.organizationId) {
      throw new Error("如果存在用户ID，则必须存在组织ID");
    }
  }

  /**
   * 获取平台ID
   *
   * @returns 平台ID值对象
   */
  getPlatformId(): PlatformId {
    return this.value.platformId;
  }

  /**
   * 获取租户ID
   *
   * @returns 租户ID值对象
   */
  getTenantId(): TenantId {
    return this.value.tenantId;
  }

  /**
   * 获取组织ID
   *
   * @returns 组织ID值对象或null
   */
  getOrganizationId(): OrganizationId | null {
    return this.value.organizationId || null;
  }

  /**
   * 获取部门ID
   *
   * @returns 部门ID值对象或null
   */
  getDepartmentId(): DepartmentId | null {
    return this.value.departmentId || null;
  }

  /**
   * 获取用户ID
   *
   * @returns 用户ID值对象或null
   */
  getUserId(): UserId | null {
    return this.value.userId || null;
  }

  /**
   * 检查是否包含完整的隔离上下文
   *
   * @returns 是否包含完整的隔离上下文
   */
  isComplete(): boolean {
    return !!(
      this.value.platformId &&
      this.value.tenantId &&
      this.value.organizationId &&
      this.value.departmentId &&
      this.value.userId
    );
  }

  /**
   * 获取隔离级别
   *
   * @returns 隔离级别（1-5）
   */
  getIsolationLevel(): number {
    let level = 2; // 至少包含平台和租户

    if (this.value.organizationId) {
      level = 3;
    }

    if (this.value.departmentId) {
      level = 4;
    }

    if (this.value.userId) {
      level = 5;
    }

    return level;
  }

  /**
   * 比较两个隔离上下文是否相等
   *
   * @param other - 另一个隔离上下文值对象
   * @returns 是否相等
   */
  equals(other: IsolationContext): boolean {
    return (
      this.value.platformId.equals(other.value.platformId) &&
      this.value.tenantId.equals(other.value.tenantId) &&
      this.value.organizationId?.equals(other.value.organizationId || null) ===
        true &&
      this.value.departmentId?.equals(other.value.departmentId || null) ===
        true &&
      this.value.userId?.equals(other.value.userId || null) === true
    );
  }

  /**
   * 创建租户级别的隔离上下文
   *
   * @param platformId - 平台ID
   * @param tenantId - 租户ID
   * @returns 租户级别的隔离上下文
   */
  static createTenantLevel(
    platformId: PlatformId,
    tenantId: TenantId,
  ): IsolationContext {
    return new IsolationContext({
      platformId,
      tenantId,
      organizationId: null,
      departmentId: null,
      userId: null,
    });
  }

  /**
   * 创建组织级别的隔离上下文
   *
   * @param platformId - 平台ID
   * @param tenantId - 租户ID
   * @param organizationId - 组织ID
   * @returns 组织级别的隔离上下文
   */
  static createOrganizationLevel(
    platformId: PlatformId,
    tenantId: TenantId,
    organizationId: OrganizationId,
  ): IsolationContext {
    return new IsolationContext({
      platformId,
      tenantId,
      organizationId,
      departmentId: null,
      userId: null,
    });
  }

  /**
   * 创建部门级别的隔离上下文
   *
   * @param platformId - 平台ID
   * @param tenantId - 租户ID
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @returns 部门级别的隔离上下文
   */
  static createDepartmentLevel(
    platformId: PlatformId,
    tenantId: TenantId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
  ): IsolationContext {
    return new IsolationContext({
      platformId,
      tenantId,
      organizationId,
      departmentId,
      userId: null,
    });
  }

  /**
   * 创建用户级别的隔离上下文
   *
   * @param platformId - 平台ID
   * @param tenantId - 租户ID
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @param userId - 用户ID
   * @returns 用户级别的隔离上下文
   */
  static createUserLevel(
    platformId: PlatformId,
    tenantId: TenantId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
    userId: UserId,
  ): IsolationContext {
    return new IsolationContext({
      platformId,
      tenantId,
      organizationId,
      departmentId,
      userId,
    });
  }
}
