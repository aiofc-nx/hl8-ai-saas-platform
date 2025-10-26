import { BaseEntity, TenantId, GenericEntityId } from "@hl8/domain-kernel";
import { PermissionAction } from "../value-objects/permission-action.vo.js";
import { PermissionScope } from "../value-objects/permission-scope.vo.js";

/**
 * 权限内部实体
 * @description 执行权限相关的业务操作和维护自身状态
 *
 * @remarks
 * 实体与聚合根分离：
 * - 内部实体（PermissionEntity）：执行业务逻辑操作，维护自身状态
 * - 聚合根（Permission）：协调内部实体，发布领域事件，管理聚合边界
 *
 * @example
 * ```typescript
 * const permissionEntity = new PermissionEntity(
 *   GenericEntityId.generate(),
 *   TenantId.create('tenant-123'),
 *   'user.create',
 *   '创建用户',
 *   PermissionAction.CREATE,
 *   PermissionScope.TENANT,
 *   true
 * );
 *
 * permissionEntity.assignToUser(UserId.create('user-123'));
 * ```
 */
export class PermissionEntity extends BaseEntity<GenericEntityId> {
  // 权限基本属性
  private _code: string;
  private _name: string;
  private _description?: string;
  private _action: PermissionAction;
  private _scope: PermissionScope;
  private _isActive: boolean;

  // 权限分配
  private _assignedUsers: Set<GenericEntityId>;
  private _assignedRoles: Set<GenericEntityId>;

  /**
   * 创建权限内部实体
   * @description 构造函数，初始化权限实体
   *
   * @param id - 权限ID
   * @param tenantId - 租户ID
   * @param code - 权限代码
   * @param name - 权限名称
   * @param action - 权限操作
   * @param scope - 权限范围
   * @param isActive - 是否激活（默认为true）
   * @param description - 权限描述（可选）
   */
  constructor(
    id: GenericEntityId,
    tenantId: TenantId,
    code: string,
    name: string,
    action: PermissionAction,
    scope: PermissionScope,
    isActive: boolean = true,
    description?: string,
  ) {
    super(id, tenantId);

    this._code = code;
    this._name = name;
    this._action = action;
    this._scope = scope;
    this._isActive = isActive;
    this._description = description;

    this._assignedUsers = new Set();
    this._assignedRoles = new Set();
  }

  /**
   * 获取权限代码
   * @returns 权限代码
   */
  public getCode(): string {
    return this._code;
  }

  /**
   * 获取权限名称
   * @returns 权限名称
   */
  public getName(): string {
    return this._name;
  }

  /**
   * 获取权限描述
   * @returns 权限描述
   */
  public getDescription(): string | undefined {
    return this._description;
  }

  /**
   * 获取权限操作
   * @returns 权限操作
   */
  public getAction(): PermissionAction {
    return this._action;
  }

  /**
   * 获取权限范围
   * @returns 权限范围
   */
  public getScope(): PermissionScope {
    return this._scope;
  }

  /**
   * 检查权限是否激活
   * @returns 是否激活
   */
  public isActive(): boolean {
    return this._isActive;
  }

  /**
   * 激活权限
   *
   * @example
   * ```typescript
   * permissionEntity.activate();
   * ```
   */
  public activate(): void {
    this._isActive = true;
  }

  /**
   * 停用权限
   *
   * @example
   * ```typescript
   * permissionEntity.deactivate();
   * ```
   */
  public deactivate(): void {
    this._isActive = false;
  }

  /**
   * 分配权限给用户
   * @param userId - 用户ID
   *
   * @example
   * ```typescript
   * permissionEntity.assignToUser(UserId.create('user-123'));
   * ```
   */
  public assignToUser(userId: GenericEntityId): void {
    this._assignedUsers.add(userId);
  }

  /**
   * 取消用户权限分配
   * @param userId - 用户ID
   *
   * @example
   * ```typescript
   * permissionEntity.revokeFromUser(UserId.create('user-123'));
   * ```
   */
  public revokeFromUser(userId: GenericEntityId): void {
    this._assignedUsers.delete(userId);
  }

  /**
   * 检查权限是否已分配给用户
   * @param userId - 用户ID
   * @returns 是否已分配
   */
  public isAssignedToUser(userId: GenericEntityId): boolean {
    return this._assignedUsers.has(userId);
  }

  /**
   * 分配权限给角色
   * @param roleId - 角色ID
   *
   * @example
   * ```typescript
   * permissionEntity.assignToRole(RoleId.create('role-123'));
   * ```
   */
  public assignToRole(roleId: GenericEntityId): void {
    this._assignedRoles.add(roleId);
  }

  /**
   * 取消角色权限分配
   * @param roleId - 角色ID
   *
   * @example
   * ```typescript
   * permissionEntity.revokeFromRole(RoleId.create('role-123'));
   * ```
   */
  public revokeFromRole(roleId: GenericEntityId): void {
    this._assignedRoles.delete(roleId);
  }

  /**
   * 检查权限是否已分配给角色
   * @param roleId - 角色ID
   * @returns 是否已分配
   */
  public isAssignedToRole(roleId: GenericEntityId): boolean {
    return this._assignedRoles.has(roleId);
  }

  /**
   * 获取所有已分配的用户ID
   * @returns 用户ID集合
   */
  public getAssignedUserIds(): ReadonlySet<GenericEntityId> {
    return this._assignedUsers;
  }

  /**
   * 获取所有已分配的角色ID
   * @returns 角色ID集合
   */
  public getAssignedRoleIds(): ReadonlySet<GenericEntityId> {
    return this._assignedRoles;
  }

  /**
   * 检查权限是否可以操作
   * @returns 是否可以操作
   */
  public canOperate(): boolean {
    return this._isActive;
  }

  /**
   * 获取用户数量
   * @returns 用户数量
   */
  public getUserCount(): number {
    return this._assignedUsers.size;
  }

  /**
   * 获取角色数量
   * @returns 角色数量
   */
  public getRoleCount(): number {
    return this._assignedRoles.size;
  }
}
