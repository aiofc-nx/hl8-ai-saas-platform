import { AggregateRoot, TenantId, GenericEntityId } from "@hl8/domain-kernel";
import { RoleEntity } from "../entities/role-entity.js";
import { RoleType } from "../value-objects/role-type.vo.js";

/**
 * 角色聚合根
 * @description 协调角色内部实体，发布领域事件，管理聚合边界
 *
 * @remarks
 * 实体与聚合根分离：
 * - 聚合根（Role）：协调内部实体，发布领域事件，管理聚合边界
 * - 内部实体（RoleEntity）：执行业务逻辑操作，维护自身状态
 *
 * @example
 * ```typescript
 * const role = Role.create(
 *   TenantId.create('tenant-123'),
 *   'admin',
 *   '管理员',
 *   RoleType.TENANT_ADMIN
 * );
 *
 * role.addPermission(PermissionId.create('perm-123'));
 * role.assignToUser(UserId.create('user-123'));
 * ```
 */
export class Role extends AggregateRoot<GenericEntityId> {
  private _role: RoleEntity;

  /**
   * 构造函数
   * @description 创建角色聚合根实例
   * @param role - 角色内部实体
   */
  private constructor(role: RoleEntity) {
    super(role.id, role.tenantId, undefined, undefined, 0);
    this._role = role;
  }

  /**
   * 创建角色
   * @description 创建新角色并发布角色创建事件
   *
   * @param tenantId - 租户ID
   * @param code - 角色代码
   * @param name - 角色名称
   * @param type - 角色类型
   * @param description - 角色描述（可选）
   * @returns 角色聚合根
   *
   * @example
   * ```typescript
   * const role = Role.create(
   *   TenantId.create('tenant-123'),
   *   'admin',
   *   '管理员',
   *   RoleType.TENANT_ADMIN
   * );
   * ```
   */
  public static create(
    tenantId: TenantId,
    code: string,
    name: string,
    type: RoleType,
    description?: string,
  ): Role {
    const id = GenericEntityId.generate();
    const roleEntity = new RoleEntity(
      id,
      tenantId,
      code,
      name,
      type,
      true,
      description,
    );

    const role = new Role(roleEntity);

    // 发布角色创建事件
    const createEvent = {
      eventId: GenericEntityId.generate(),
      occurredAt: new Date(),
      aggregateId: id,
      version: 1,
      eventType: "RoleCreated",
      eventData: {
        roleId: id.toString(),
        code,
        name,
        type,
        description,
      },
    };
    role.apply(createEvent);

    return role;
  }

  /**
   * 从快照恢复
   * @description 从快照恢复角色聚合根
   */
  public static fromSnapshot(snapshot: {
    id: string;
    tenantId: string;
    code: string;
    name: string;
    type: RoleType;
    isActive: boolean;
    description?: string;
  }): Role {
    const id = GenericEntityId.create(snapshot.id);
    const tenantId = TenantId.create(snapshot.tenantId);
    const roleEntity = new RoleEntity(
      id,
      tenantId,
      snapshot.code,
      snapshot.name,
      snapshot.type,
      snapshot.isActive,
      snapshot.description,
    );

    return new Role(roleEntity);
  }

  /**
   * 添加权限
   * @description 验证并添加权限到角色
   *
   * @param permissionId - 权限ID
   *
   * @example
   * ```typescript
   * role.addPermission(PermissionId.create('perm-123'));
   * ```
   */
  public addPermission(permissionId: GenericEntityId): void {
    this._role.addPermission(permissionId);
  }

  /**
   * 移除权限
   * @description 验证并移除角色权限
   *
   * @param permissionId - 权限ID
   *
   * @example
   * ```typescript
   * role.removePermission(PermissionId.create('perm-123'));
   * ```
   */
  public removePermission(permissionId: GenericEntityId): void {
    if (!this._role.hasPermission(permissionId)) {
      throw new Error(`角色没有权限 ${permissionId.toString()}`);
    }

    this._role.removePermission(permissionId);
  }

  /**
   * 分配角色给用户
   * @description 验证并分配角色给用户，发布角色分配事件
   *
   * @param userId - 用户ID
   *
   * @example
   * ```typescript
   * role.assignToUser(UserId.create('user-123'));
   * ```
   */
  public assignToUser(userId: GenericEntityId): void {
    this._role.assignToUser(userId);

    // 发布角色分配事件
    const assignEvent = {
      eventId: GenericEntityId.generate(),
      occurredAt: new Date(),
      aggregateId: this.id,
      version: this.version + 1,
      eventType: "RoleAssigned",
      eventData: {
        roleId: this.id.toString(),
        userId: userId.toString(),
      },
    };
    this.apply(assignEvent);
  }

  /**
   * 撤销用户角色
   * @description 验证并撤销用户角色，发布角色撤销事件
   *
   * @param userId - 用户ID
   *
   * @example
   * ```typescript
   * role.revokeFromUser(UserId.create('user-123'));
   * ```
   */
  public revokeFromUser(userId: GenericEntityId): void {
    if (!this._role.isAssignedToUser(userId)) {
      throw new Error(`角色未分配给用户 ${userId.toString()}`);
    }

    this._role.revokeFromUser(userId);

    // 发布角色撤销事件
    const revokeEvent = {
      eventId: GenericEntityId.generate(),
      occurredAt: new Date(),
      aggregateId: this.id,
      version: this.version + 1,
      eventType: "RoleRevoked",
      eventData: {
        roleId: this.id.toString(),
        userId: userId.toString(),
      },
    };
    this.apply(revokeEvent);
  }

  /**
   * 激活角色
   * @description 激活角色
   *
   * @example
   * ```typescript
   * role.activate();
   * ```
   */
  public activate(): void {
    this._role.activate();
  }

  /**
   * 停用角色
   * @description 停用角色
   *
   * @example
   * ```typescript
   * role.deactivate();
   * ```
   */
  public deactivate(): void {
    this._role.deactivate();
  }

  /**
   * 获取角色代码
   * @returns 角色代码
   */
  public getCode(): string {
    return this._role.getCode();
  }

  /**
   * 获取角色名称
   * @returns 角色名称
   */
  public getName(): string {
    return this._role.getName();
  }

  /**
   * 获取角色类型
   * @returns 角色类型
   */
  public getType(): RoleType {
    return this._role.getType();
  }

  /**
   * 检查角色是否激活
   * @returns 是否激活
   */
  public isActive(): boolean {
    return this._role.isActive();
  }

  /**
   * 检查是否有权限
   * @param permissionId - 权限ID
   * @returns 是否有权限
   */
  public hasPermission(permissionId: GenericEntityId): boolean {
    return this._role.hasPermission(permissionId);
  }

  /**
   * 检查用户是否有角色
   * @param userId - 用户ID
   * @returns 是否有角色
   */
  public isAssignedToUser(userId: GenericEntityId): boolean {
    return this._role.isAssignedToUser(userId);
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
    type: RoleType;
    isActive: boolean;
    description?: string;
  } {
    return {
      id: this.id.toString(),
      tenantId: this.tenantId.toString(),
      code: this._role.getCode(),
      name: this._role.getName(),
      type: this._role.getType(),
      isActive: this._role.isActive(),
      description: this._role.getDescription(),
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
    type: RoleType;
    isActive: boolean;
    description?: string;
  }): void {
    // 重建内部实体
    const id = GenericEntityId.create(snapshot.id);
    const tenantId = TenantId.create(snapshot.tenantId);
    this._role = new RoleEntity(
      id,
      tenantId,
      snapshot.code,
      snapshot.name,
      snapshot.type,
      snapshot.isActive,
      snapshot.description,
    );
  }
}
