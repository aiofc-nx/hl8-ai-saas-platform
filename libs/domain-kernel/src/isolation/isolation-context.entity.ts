/**
 * 隔离上下文实体
 *
 * @description 封装多层级数据隔离的核心业务逻辑
 *
 * ## 业务规则（充血模型）
 *
 * ### 层级判断规则
 * - 有 departmentId → DEPARTMENT 级
 * - 有 organizationId → ORGANIZATION 级
 * - 有 tenantId → TENANT 级
 * - 有 userId（无租户）→ USER 级
 * - 默认 → PLATFORM 级
 *
 * ### 验证规则
 * - 组织级必须有租户
 * - 部门级必须有租户和组织
 * - 所有 ID 必须有效
 *
 * ### 访问权限规则
 * - 平台级上下文可访问所有数据
 * - 非共享数据：必须完全匹配隔离上下文
 * - 共享数据：检查共享级别是否允许访问
 *
 * ## 业务逻辑方法
 *
 * - buildCacheKey(): 供 caching 模块使用，生成缓存键
 * - buildLogContext(): 供 logging 模块使用，生成日志上下文
 * - buildWhereClause(): 供 database 模块使用，生成查询条件
 * - canAccess(): 供权限模块使用，验证数据访问权限
 *
 * @example
 * ```typescript
 * // 创建部门级上下文
 * const context = IsolationContext.department(
 *   TenantId.create('t123'),
 *   OrganizationId.create('o456'),
 *   DepartmentId.create('d789'),
 * );
 *
 * // 使用业务逻辑方法
 * const cacheKey = context.buildCacheKey('user', 'list');
 * const logContext = context.buildLogContext();
 * const where = context.buildWhereClause();
 * ```
 *
 * @since 1.0.0
 */

import { IsolationLevel } from "./isolation-level.enum.js";
import { SharingLevel } from "./sharing-level.enum.js";
import { IsolationValidationError } from "./isolation-validation.error.js";
import type { DepartmentId } from "../value-objects/ids/department-id.vo.js";
import type { OrganizationId } from "../value-objects/ids/organization-id.vo.js";
import type { TenantId } from "../value-objects/ids/tenant-id.vo.js";
import type { UserId } from "../value-objects/ids/user-id.vo.js";

/**
 * 隔离上下文实体
 *
 * 实体特性：
 * - 有标识符（通过值对象组合）
 * - 有生命周期
 * - 封装业务逻辑
 * - 不可变（所有属性 readonly）
 */
export class IsolationContext {
  private _level?: IsolationLevel; // 延迟计算缓存

  /**
   * 私有构造函数 - 强制使用静态工厂方法
   *
   * @param tenantId - 租户 ID（可选）
   * @param organizationId - 组织 ID（可选）
   * @param departmentId - 部门 ID（可选）
   * @param userId - 用户 ID（可选）
   */
  private constructor(
    public readonly tenantId?: TenantId,
    public readonly organizationId?: OrganizationId,
    public readonly departmentId?: DepartmentId,
    public readonly userId?: UserId,
  ) {
    this.validate();
  }

  /**
   * 创建平台级上下文
   *
   * @description 平台级上下文可以访问所有数据
   *
   * @returns IsolationContext 实例
   *
   * @example
   * ```typescript
   * const context = IsolationContext.platform();
   * console.log(context.isEmpty()); // true
   * ```
   */
  static platform(): IsolationContext {
    return new IsolationContext();
  }

  /**
   * 创建租户级上下文
   *
   * @description 租户级上下文只能访问该租户的数据
   *
   * @param tenantId - 租户 ID
   * @returns IsolationContext 实例
   *
   * @example
   * ```typescript
   * const context = IsolationContext.tenant(TenantId.create('t123'));
   * console.log(context.getIsolationLevel()); // TENANT
   * ```
   */
  static tenant(tenantId: TenantId): IsolationContext {
    return new IsolationContext(tenantId);
  }

  /**
   * 创建组织级上下文
   *
   * @description 组织级上下文可以访问该组织及其下属部门的数据
   *
   * @param tenantId - 租户 ID
   * @param organizationId - 组织 ID
   * @returns IsolationContext 实例
   *
   * @example
   * ```typescript
   * const context = IsolationContext.organization(
   *   TenantId.create('t123'),
   *   OrganizationId.create('o456')
   * );
   * console.log(context.getIsolationLevel()); // ORGANIZATION
   * ```
   */
  static organization(
    tenantId: TenantId,
    organizationId: OrganizationId,
  ): IsolationContext {
    return new IsolationContext(tenantId, organizationId);
  }

  /**
   * 创建部门级上下文
   *
   * @description 部门级上下文只能访问该部门的数据
   *
   * @param tenantId - 租户 ID
   * @param organizationId - 组织 ID
   * @param departmentId - 部门 ID
   * @returns IsolationContext 实例
   *
   * @example
   * ```typescript
   * const context = IsolationContext.department(
   *   TenantId.create('t123'),
   *   OrganizationId.create('o456'),
   *   DepartmentId.create('d789')
   * );
   * console.log(context.getIsolationLevel()); // DEPARTMENT
   * ```
   */
  static department(
    tenantId: TenantId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
  ): IsolationContext {
    return new IsolationContext(tenantId, organizationId, departmentId);
  }

  /**
   * 创建用户级上下文
   *
   * @description 用户级上下文只能访问该用户的数据
   *
   * @param userId - 用户 ID
   * @param tenantId - 租户 ID（可选，用于多租户场景）
   * @returns IsolationContext 实例
   *
   * @example
   * ```typescript
   * const context = IsolationContext.user(UserId.create('u123'));
   * console.log(context.getIsolationLevel()); // USER
   * ```
   */
  static user(userId: UserId, tenantId?: TenantId): IsolationContext {
    return new IsolationContext(tenantId, undefined, undefined, userId);
  }

  /**
   * 验证上下文有效性
   *
   * @description 确保上下文的层级关系正确
   *
   * @throws {IsolationValidationError} 当上下文无效时
   *
   * @private
   */
  private validate(): void {
    // 组织级必须有租户
    if (this.organizationId && !this.tenantId) {
      throw new IsolationValidationError(
        "组织级上下文必须包含租户 ID",
        "INVALID_ORGANIZATION_CONTEXT",
        { organizationId: this.organizationId.getValue() },
      );
    }

    // 部门级必须有租户和组织
    if (this.departmentId && !this.organizationId) {
      throw new IsolationValidationError(
        "部门级上下文必须包含组织 ID",
        "INVALID_DEPARTMENT_CONTEXT",
        { departmentId: this.departmentId.getValue() },
      );
    }

    // 用户级上下文必须有租户（多租户场景）
    if (this.userId && !this.tenantId) {
      throw new IsolationValidationError(
        "用户级上下文必须包含租户 ID",
        "INVALID_USER_CONTEXT",
        { userId: this.userId.getValue() },
      );
    }
  }

  /**
   * 获取隔离级别
   *
   * @description 根据上下文中的 ID 确定隔离级别
   *
   * @returns 隔离级别
   *
   * @example
   * ```typescript
   * const context = IsolationContext.department(tenantId, orgId, deptId);
   * console.log(context.getIsolationLevel()); // DEPARTMENT
   * ```
   */
  getIsolationLevel(): IsolationLevel {
    if (this._level === undefined) {
      if (this.departmentId) {
        this._level = IsolationLevel.DEPARTMENT;
      } else if (this.organizationId) {
        this._level = IsolationLevel.ORGANIZATION;
      } else if (this.userId) {
        this._level = IsolationLevel.USER;
      } else if (this.tenantId) {
        this._level = IsolationLevel.TENANT;
      } else {
        this._level = IsolationLevel.PLATFORM;
      }
    }
    return this._level;
  }

  /**
   * 检查是否为平台级
   *
   * @returns 是否为平台级
   */
  isPlatformLevel(): boolean {
    return this.getIsolationLevel() === IsolationLevel.PLATFORM;
  }

  /**
   * 检查是否为租户级
   *
   * @returns 是否为租户级
   */
  isTenantLevel(): boolean {
    return this.getIsolationLevel() === IsolationLevel.TENANT;
  }

  /**
   * 检查是否为组织级
   *
   * @returns 是否为组织级
   */
  isOrganizationLevel(): boolean {
    return this.getIsolationLevel() === IsolationLevel.ORGANIZATION;
  }

  /**
   * 检查是否为部门级
   *
   * @returns 是否为部门级
   */
  isDepartmentLevel(): boolean {
    return this.getIsolationLevel() === IsolationLevel.DEPARTMENT;
  }

  /**
   * 检查是否为用户级
   *
   * @returns 是否为用户级
   */
  isUserLevel(): boolean {
    return this.getIsolationLevel() === IsolationLevel.USER;
  }

  /**
   * 检查当前上下文是否为空（平台级）
   *
   * @returns 是否为空
   */
  isEmpty(): boolean {
    return (
      !this.tenantId &&
      !this.organizationId &&
      !this.departmentId &&
      !this.userId
    );
  }

  /**
   * 生成缓存键
   *
   * @description 根据隔离上下文生成缓存键，确保不同层级的数据不会冲突
   *
   * @param namespace - 命名空间
   * @param key - 键
   * @returns 缓存键
   *
   * @example
   * ```typescript
   * const context = IsolationContext.tenant(TenantId.create('t123'));
   * const cacheKey = context.buildCacheKey('user', 'list');
   * // 返回: "tenant:t123:user:list"
   * ```
   */
  buildCacheKey(namespace: string, key: string): string {
    const parts: string[] = ["cache"];
    switch (this.getIsolationLevel()) {
      case IsolationLevel.USER:
        parts.push(
          "tenant",
          this.tenantId!.getValue(),
          "user",
          this.userId!.getValue(),
          namespace,
          key,
        );
        break;
      case IsolationLevel.DEPARTMENT:
        parts.push(
          "tenant",
          this.tenantId!.getValue(),
          "org",
          this.organizationId!.getValue(),
          "dept",
          this.departmentId!.getValue(),
          namespace,
          key,
        );
        break;
      case IsolationLevel.ORGANIZATION:
        parts.push(
          "tenant",
          this.tenantId!.getValue(),
          "org",
          this.organizationId!.getValue(),
          namespace,
          key,
        );
        break;
      case IsolationLevel.TENANT:
        parts.push("tenant", this.tenantId!.getValue(), namespace, key);
        break;
      case IsolationLevel.PLATFORM:
        parts.push("platform", namespace, key);
        break;
    }
    return parts.join(":");
  }

  /**
   * 生成日志上下文
   *
   * @description 生成用于日志记录的上下文信息
   *
   * @returns 日志上下文对象
   *
   * @example
   * ```typescript
   * const context = IsolationContext.department(tenantId, orgId, deptId);
   * const logContext = context.buildLogContext();
   * // 返回: { isolationLevel: 'department', tenantId: 't123', organizationId: 'o456', departmentId: 'd789' }
   * ```
   */
  buildLogContext(): Record<string, string> {
    const context: Record<string, string> = {
      isolationLevel: this.getIsolationLevel(),
    };
    if (this.tenantId) context.tenantId = this.tenantId.getValue();
    if (this.organizationId)
      context.organizationId = this.organizationId.getValue();
    if (this.departmentId) context.departmentId = this.departmentId.getValue();
    if (this.userId) context.userId = this.userId.getValue();
    return context;
  }

  /**
   * 生成 WHERE 子句
   *
   * @description 生成用于数据库查询的 WHERE 条件
   *
   * @param alias - 表别名（可选）
   * @returns WHERE 子句对象
   *
   * @example
   * ```typescript
   * const context = IsolationContext.tenant(TenantId.create('t123'));
   * const where = context.buildWhereClause('u');
   * // 返回: { 'u.tenantId': 't123' }
   * ```
   */
  buildWhereClause(alias: string = ""): Record<string, unknown> {
    const prefix = alias ? `${alias}.` : "";
    const clause: Record<string, unknown> = {};

    switch (this.getIsolationLevel()) {
      case IsolationLevel.USER:
        clause[`${prefix}userId`] = this.userId!.getValue();
      // fallthrough
      case IsolationLevel.DEPARTMENT:
        clause[`${prefix}departmentId`] = this.departmentId!.getValue();
      // fallthrough
      case IsolationLevel.ORGANIZATION:
        clause[`${prefix}organizationId`] = this.organizationId!.getValue();
      // fallthrough
      case IsolationLevel.TENANT:
        clause[`${prefix}tenantId`] = this.tenantId!.getValue();
        break;
      case IsolationLevel.PLATFORM:
        // 平台级数据，无需额外 WHERE 子句
        break;
    }
    return clause;
  }

  /**
   * 检查是否可以访问数据
   *
   * @description 根据隔离上下文和共享级别判断是否可以访问数据
   *
   * @param targetContext - 目标隔离上下文
   * @param sharingLevel - 数据的共享级别
   * @returns 是否允许访问
   *
   * @example
   * ```typescript
   * const userContext = IsolationContext.department(tenantId, orgId, deptId);
   * const dataContext = IsolationContext.organization(tenantId, orgId);
   * const canAccess = userContext.canAccess(dataContext, SharingLevel.ORGANIZATION);
   * // 返回: true（部门级用户可以访问组织级共享数据）
   * ```
   */
  canAccess(
    targetContext: IsolationContext,
    sharingLevel: SharingLevel,
  ): boolean {
    // 平台级上下文可以访问所有数据
    if (this.isPlatformLevel()) {
      return true;
    }

    // 检查共享级别
    return this.canShareWith(targetContext, sharingLevel);
  }

  /**
   * 检查是否可以共享数据
   *
   * @description 根据共享级别判断是否可以共享数据
   *
   * @param targetContext - 目标隔离上下文
   * @param sharingLevel - 数据的共享级别
   * @returns 是否允许共享
   *
   * @private
   */
  private canShareWith(
    targetContext: IsolationContext,
    sharingLevel: SharingLevel,
  ): boolean {
    // 平台级共享数据对所有层级可见
    if (sharingLevel === SharingLevel.PLATFORM) {
      return true;
    }

    // 租户级共享数据
    if (sharingLevel === SharingLevel.TENANT) {
      // 目标上下文必须是租户级或更低，且租户ID相同
      return (
        this.compareIsolationLevels(
          targetContext.getIsolationLevel(),
          IsolationLevel.TENANT,
        ) >= 0 &&
        (this.tenantId?.equals(targetContext.tenantId) ?? false)
      );
    }

    // 组织级共享数据
    if (sharingLevel === SharingLevel.ORGANIZATION) {
      // 目标上下文必须是组织级或更低，且组织ID相同
      return (
        this.compareIsolationLevels(
          targetContext.getIsolationLevel(),
          IsolationLevel.ORGANIZATION,
        ) >= 0 &&
        (this.organizationId?.equals(targetContext.organizationId) ?? false)
      );
    }

    // 部门级共享数据
    if (sharingLevel === SharingLevel.DEPARTMENT) {
      // 目标上下文必须是部门级或更低，且部门ID相同
      return (
        this.compareIsolationLevels(
          targetContext.getIsolationLevel(),
          IsolationLevel.DEPARTMENT,
        ) >= 0 &&
        (this.departmentId?.equals(targetContext.departmentId) ?? false)
      );
    }

    // 用户级共享数据
    if (sharingLevel === SharingLevel.USER) {
      // 目标上下文必须是用户级，且用户ID相同
      return (
        targetContext.getIsolationLevel() === IsolationLevel.USER &&
        (this.userId?.equals(targetContext.userId) ?? false)
      );
    }

    return false;
  }

  /**
   * 比较隔离级别
   *
   * @description 比较两个隔离级别的大小关系
   *
   * @param level1 - 级别1
   * @param level2 - 级别2
   * @returns 比较结果：>0 表示 level1 > level2，=0 表示相等，<0 表示 level1 < level2
   *
   * @private
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
}
