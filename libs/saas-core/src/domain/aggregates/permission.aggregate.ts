import { AggregateRoot, TenantId, GenericEntityId } from "@hl8/domain-kernel";
import { PermissionEntity } from "../entities/permission-entity.js";
import { PermissionAction } from "../value-objects/permission-action.vo.js";
import { PermissionScope } from "../value-objects/permission-scope.vo.js";

/**
 * 权限聚合根
 * @description 协调权限内部实体，发布领域事件，管理聚合边界
 *
 * @remarks
 * 实体与聚合根分离：
 * - 聚合根（Permission）：协调内部实体，发布领域事件，管理聚合边界
 * - 内部实体（PermissionEntity）：执行业务逻辑操作，维护自身状态
 *
 * @example
 * ```typescript
 * const permission = Permission.create(
 *   TenantId.create('tenant-123'),
 *   'user.create',
 *   '创建用户',
 *   PermissionAction.CREATE,
 *   PermissionScope.TENANT
 * );
 *
 * permission.assignToUser(UserId.create('user-123'));
 * ```
 */
export class Permission extends AggregateRoot<GenericEntityId> {
  private _permission: PermissionEntity;

  /**
   * 构造函数
   * @description 创建权限聚合根实例
   * @param permission - 权限内部实体
   */
  private constructor(permission: PermissionEntity) {
    super(permission.id, permission.tenantId, undefined, undefined, 0);
    this._permission = permission;
  }

  /**
   * 创建权限
   * @description 创建新权限并发布权限创建事件
   *
   * @param tenantId - 租户ID
   * @param code - 权限代码
   * @param name - 权限名称
   * @param action - 权限操作
   * @param scope - 权限范围
   * @param description - 权限描述（可选）
   * @returns 权限聚合根
   *
   * @example
   * ```typescript
   * const permission = Permission.create(
   *   TenantId.create('tenant-123'),
   *   'user.create',
   *   '创建用户',
   *   PermissionAction.CREATE,
   *   PermissionScope.TENANT
   * );
   * ```
   */
  public static create(
    tenantId: TenantId,
    code: string,
    name: string,
    action: PermissionAction,
    scope: PermissionScope,
    description?: string,
  ): Permission {
    const id = GenericEntityId.generate();
    const permissionEntity = new PermissionEntity(
      id,
      tenantId,
      code,
      name,
      action,
      scope,
      true,
      description,
    );

    const permission = new Permission(permissionEntity);

    // 发布权限创建事件
    const createEvent = {
      eventId: GenericEntityId.generate(),
      occurredAt: new Date(),
      aggregateId: id,
      version: 1,
      eventType: "PermissionCreated",
      eventData: {
        permissionId: id.toString(),
        code,
        name,
        action,
        scope,
        description,
      },
    };
    permission.apply(createEvent);

    return permission;
  }

  /**
   * 从快照恢复
   * @description 从快照恢复权限聚合根
   */
  public static fromSnapshot(snapshot: {
    id: string;
    tenantId: string;
    code: string;
    name: string;
    action: PermissionAction;
    scope: PermissionScope;
    isActive: boolean;
    description?: string;
  }): Permission {
    const id = GenericEntityId.create(snapshot.id);
    const tenantId = TenantId.create(snapshot.tenantId);
    const permissionEntity = new PermissionEntity(
      id,
      tenantId,
      snapshot.code,
      snapshot.name,
      snapshot.action,
      snapshot.scope,
      snapshot.isActive,
      snapshot.description,
    );

    return new Permission(permissionEntity);
  }

  /**
   * 分配权限给用户
   * @description 验证并分配权限给用户，发布权限分配事件
   *
   * @param userId - 用户ID
   *
   * @example
   * ```typescript
   * permission.assignToUser(UserId.create('user-123'));
   * ```
   */
  public assignToUser(userId: GenericEntityId): void {
    this._permission.assignToUser(userId);

    // 发布权限分配事件
    const assignEvent = {
      eventId: GenericEntityId.generate(),
      occurredAt: new Date(),
      aggregateId: this.id,
      version: this.version + 1,
      eventType: "PermissionAssigned",
      eventData: {
        permissionId: this.id.toString(),
        userId: userId.toString(),
      },
    };
    this.apply(assignEvent);
  }

  /**
   * 撤销用户权限
   * @description 验证并撤销用户权限，发布权限撤销事件
   *
   * @param userId - 用户ID
   *
   * @example
   * ```typescript
   * permission.revokeFromUser(UserId.create('user-123'));
   * ```
   */
  public revokeFromUser(userId: GenericEntityId): void {
    if (!this._permission.isAssignedToUser(userId)) {
      throw new Error(`权限未分配给用户 ${userId.toString()}`);
    }

    this._permission.revokeFromUser(userId);

    // 发布权限撤销事件
    const revokeEvent = {
      eventId: GenericEntityId.generate(),
      occurredAt: new Date(),
      aggregateId: this.id,
      version: this.version + 1,
      eventType: "PermissionRevoked",
      eventData: {
        permissionId: this.id.toString(),
        userId: userId.toString(),
      },
    };
    this.apply(revokeEvent);
  }

  /**
   * 分配权限给角色
   * @description 验证并分配权限给角色
   *
   * @param roleId - 角色ID
   *
   * @example
   * ```typescript
   * permission.assignToRole(RoleId.create('role-123'));
   * ```
   */
  public assignToRole(roleId: GenericEntityId): void {
    this._permission.assignToRole(roleId);
  }

  /**
   * 撤销角色权限
   * @description 验证并撤销角色权限
   *
   * @param roleId - 角色ID
   *
   * @example
   * ```typescript
   * permission.revokeFromRole(RoleId.create('role-123'));
   * ```
   */
  public revokeFromRole(roleId: GenericEntityId): void {
    if (!this._permission.isAssignedToRole(roleId)) {
      throw new Error(`权限未分配给角色 ${roleId.toString()}`);
    }

    this._permission.revokeFromRole(roleId);
  }

  /**
   * 激活权限
   * @description 激活权限
   *
   * @example
   * ```typescript
   * permission.activate();
   * ```
   */
  public activate(): void {
    this._permission.activate();
  }

  /**
   * 停用权限
   * @description 停用权限
   *
   * @example
   * ```typescript
   * permission.deactivate();
   * ```
   */
  public deactivate(): void {
    this._permission.deactivate();
  }

  /**
   * 获取权限代码
   * @returns 权限代码
   */
  public getCode(): string {
    return this._permission.getCode();
  }

  /**
   * 获取权限名称
   * @returns 权限名称
   */
  public getName(): string {
    return this._permission.getName();
  }

  /**
   * 获取权限操作
   * @returns 权限操作
   */
  public getAction(): PermissionAction {
    return this._permission.getAction();
  }

  /**
   * 获取权限范围
   * @returns 权限范围
   */
  public getScope(): PermissionScope {
    return this._permission.getScope();
  }

  /**
   * 检查权限是否激活
   * @returns 是否激活
   */
  public isActive(): boolean {
    return this._permission.isActive();
  }

  /**
   * 检查用户是否有权限
   * @param userId - 用户ID
   * @returns 是否有权限
   */
  public isAssignedToUser(userId: GenericEntityId): boolean {
    return this._permission.isAssignedToUser(userId);
  }

  /**
   * 检查角色是否有权限
   * @param roleId - 角色ID
   * @returns 是否有权限
   */
  public isAssignedToRole(roleId: GenericEntityId): boolean {
    return this._permission.isAssignedToRole(roleId);
  }

  /**
   * 获取快照数据
   * @description 用于事件溯源，返回聚合根的当前状态快照
   * @returns 快照数据
   */
  public getSnapshotData(): {
    id: string;
    tenantId: string;
    code: string;
    name: string;
    action: PermissionAction;
    scope: PermissionScope;
    isActive: boolean;
    description?: string;
  } {
    return {
      id: this.id.toString(),
      tenantId: this.tenantId.toString(),
      code: this._permission.getCode(),
      name: this._permission.getName(),
      action: this._permission.getAction(),
      scope: this._permission.getScope(),
      isActive: this._permission.isActive(),
      description: this._permission.getDescription(),
    };
  }

  /**
   * 从快照加载
   * @description 从快照加载聚合根状态
   * @param snapshot - 快照数据
   */
  public loadFromSnapshot(snapshot: {
    id: string;
    tenantId: string;
    code: string;
    name: string;
    action: PermissionAction;
    scope: PermissionScope;
    isActive: boolean;
    description?: string;
  }): void {
    // 重建内部实体
    const id = GenericEntityId.create(snapshot.id);
    const tenantId = TenantId.create(snapshot.tenantId);
    this._permission = new PermissionEntity(
      id,
      tenantId,
      snapshot.code,
      snapshot.name,
      snapshot.action,
      snapshot.scope,
      snapshot.isActive,
      snapshot.description,
    );
  }
}
