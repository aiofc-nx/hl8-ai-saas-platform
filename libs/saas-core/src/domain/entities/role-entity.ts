import { BaseEntity, TenantId, GenericEntityId } from "@hl8/domain-kernel";
import { RoleType } from "../value-objects/role-type.vo.js";

/**
 * 角色内部实体
 * @description 执行角色相关的业务操作和维护自身状态
 *
 * @remarks
 * 实体与聚合根分离：
 * - 内部实体（RoleEntity）：执行业务逻辑操作，维护自身状态
 * - 聚合根（Role）：协调内部实体，发布领域事件，管理聚合边界
 *
 * @example
 * ```typescript
 * const roleEntity = new RoleEntity(
 *   GenericEntityId.generate(),
 *   TenantId.create('tenant-123'),
 *   'admin',
 *   '管理员',
 *   RoleType.TENANT_ADMIN,
 *   '租户管理员角色'
 * );
 *
 * roleEntity.addPermission(PermissionId.create('perm-123'));
 * ```
 */
export class RoleEntity extends BaseEntity<GenericEntityId> {
  // 角色基本属性
  private _code: string;
  private _name: string;
  private _description?: string;
  private _type: RoleType;
  private _isActive: boolean;

  // 角色权限
  private _permissions: Set<GenericEntityId>;

  // 角色分配
  private _assignedUsers: Set<GenericEntityId>;

  /**
   * 创建角色内部实体
   * @description 构造函数，初始化角色实体
   *
   * @param id - 角色ID
   * @param tenantId - 租户ID
   * @param code - 角色代码
   * @param name - 角色名称
   * @param type - 角色类型
   * @param isActive - 是否激活（默认为true）
   * @param description - 角色描述（可选）
   */
  constructor(
    id: GenericEntityId,
    tenantId: TenantId,
    code: string,
    name: string,
    type: RoleType,
    isActive: boolean = true,
    description?: string,
  ) {
    super(id, tenantId);

    this._code = code;
    this._name = name;
    this._type = type;
    this._isActive = isActive;
    this._description = description;

    this._permissions = new Set();
    this._assignedUsers = new Set();
  }

  /**
   * 获取角色代码
   * @returns 角色代码
   */
  public getCode(): string {
    return this._code;
  }

  /**
   * 获取角色名称
   * @returns 角色名称
   */
  public getName(): string {
    return this._name;
  }

  /**
   * 获取角色描述
   * @returns 角色描述
   */
  public getDescription(): string | undefined {
    return this._description;
  }

  /**
   * 获取角色类型
   * @returns 角色类型
   */
  public getType(): RoleType {
    return this._type;
  }

  /**
   * 检查角色是否激活
   * @returns 是否激活
   */
  public isActive(): boolean {
    return this._isActive;
  }

  /**
   * 激活角色
   *
   * @example
   * ```typescript
   * roleEntity.activate();
   * ```
   */
  public activate(): void {
    this._isActive = true;
  }

  /**
   * 停用角色
   *
   * @example
   * ```typescript
   * roleEntity.deactivate();
   * ```
   */
  public deactivate(): void {
    this._isActive = false;
  }

  /**
   * 添加权限
   * @param permissionId - 权限ID
   *
   * @example
   * ```typescript
   * roleEntity.addPermission(PermissionId.create('perm-123'));
   * ```
   */
  public addPermission(permissionId: GenericEntityId): void {
    this._permissions.add(permissionId);
  }

  /**
   * 移除权限
   * @param permissionId - 权限ID
   *
   * @example
   * ```typescript
   * roleEntity.removePermission(PermissionId.create('perm-123'));
   * ```
   */
  public removePermission(permissionId: GenericEntityId): void {
    this._permissions.delete(permissionId);
  }

  /**
   * 检查是否有权限
   * @param permissionId - 权限ID
   * @returns 是否有权限
   */
  public hasPermission(permissionId: GenericEntityId): boolean {
    return this._permissions.has(permissionId);
  }

  /**
   * 获取所有权限ID
   * @returns 权限ID集合
   */
  public getPermissionIds(): ReadonlySet<GenericEntityId> {
    return this._permissions;
  }

  /**
   * 分配角色给用户
   * @param userId - 用户ID
   *
   * @example
   * ```typescript
   * roleEntity.assignToUser(UserId.create('user-123'));
   * ```
   */
  public assignToUser(userId: GenericEntityId): void {
    this._assignedUsers.add(userId);
  }

  /**
   * 取消用户角色分配
   * @param userId - 用户ID
   *
   * @example
   * ```typescript
   * roleEntity.revokeFromUser(UserId.create('user-123'));
   * ```
   */
  public revokeFromUser(userId: GenericEntityId): void {
    this._assignedUsers.delete(userId);
  }

  /**
   * 检查角色是否已分配给用户
   * @param userId - 用户ID
   * @returns 是否已分配
   */
  public isAssignedToUser(userId: GenericEntityId): boolean {
    return this._assignedUsers.has(userId);
  }

  /**
   * 获取所有已分配的用户ID
   * @returns 用户ID集合
   */
  public getAssignedUserIds(): ReadonlySet<GenericEntityId> {
    return this._assignedUsers;
  }

  /**
   * 检查角色是否可以操作
   * @returns 是否可以操作
   */
  public canOperate(): boolean {
    return this._isActive;
  }

  /**
   * 获取权限数量
   * @returns 权限数量
   */
  public getPermissionCount(): number {
    return this._permissions.size;
  }

  /**
   * 获取用户数量
   * @returns 用户数量
   */
  public getUserCount(): number {
    return this._assignedUsers.size;
  }
}
