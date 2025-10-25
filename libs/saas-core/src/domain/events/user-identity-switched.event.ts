/**
 * 用户身份切换事件
 *
 * @description 表示用户身份切换的事件
 * @since 1.0.0
 */

import { DomainEvent } from "@hl8/domain-kernel";
import { UserId } from "../value-objects/user-id.vo.js";
import { TenantId } from "../value-objects/tenant-id.vo.js";
import { OrganizationId } from "../value-objects/organization-id.vo.js";
import { DepartmentId } from "../value-objects/department-id.vo.js";

/**
 * 用户身份切换事件接口
 */
export interface IUserIdentitySwitchedEvent {
  readonly userId: UserId;
  readonly fromTenantId?: TenantId;
  readonly toTenantId: TenantId;
  readonly fromOrganizationId?: OrganizationId;
  readonly toOrganizationId?: OrganizationId;
  readonly fromDepartmentId?: DepartmentId;
  readonly toDepartmentId?: DepartmentId;
  readonly reason?: string;
  readonly switchedAt: Date;
  readonly permissions: readonly string[];
  readonly roles: readonly string[];
  readonly metadata: Record<string, unknown>;
}

/**
 * 用户身份切换事件
 *
 * 用户身份切换事件表示用户身份切换的事件。
 * 当用户从一个租户切换到另一个租户时，系统会发布此事件以通知相关组件。
 *
 * @example
 * ```typescript
 * const event = new UserIdentitySwitchedEvent({
 *   userId: new UserId("user-123"),
 *   fromTenantId: new TenantId("tenant-1"),
 *   toTenantId: new TenantId("tenant-2"),
 *   reason: "User requested tenant switch",
 *   switchedAt: new Date(),
 *   permissions: ["user:read", "user:update"],
 *   roles: ["user", "tenant_member"],
 *   metadata: { source: "user_action", category: "tenant_switch" }
 * });
 * ```
 */
export class UserIdentitySwitchedEvent extends DomainEvent {
  constructor(eventData: IUserIdentitySwitchedEvent) {
    super("UserIdentitySwitchedEvent", eventData.userId.value);

    this.eventData = eventData;
  }

  /**
   * 获取用户ID
   *
   * @returns 用户ID
   */
  get userId(): UserId {
    return this.eventData.userId;
  }

  /**
   * 获取源租户ID
   *
   * @returns 源租户ID或undefined
   */
  get fromTenantId(): TenantId | undefined {
    return this.eventData.fromTenantId;
  }

  /**
   * 获取目标租户ID
   *
   * @returns 目标租户ID
   */
  get toTenantId(): TenantId {
    return this.eventData.toTenantId;
  }

  /**
   * 获取源组织ID
   *
   * @returns 源组织ID或undefined
   */
  get fromOrganizationId(): OrganizationId | undefined {
    return this.eventData.fromOrganizationId;
  }

  /**
   * 获取目标组织ID
   *
   * @returns 目标组织ID或undefined
   */
  get toOrganizationId(): OrganizationId | undefined {
    return this.eventData.toOrganizationId;
  }

  /**
   * 获取源部门ID
   *
   * @returns 源部门ID或undefined
   */
  get fromDepartmentId(): DepartmentId | undefined {
    return this.eventData.fromDepartmentId;
  }

  /**
   * 获取目标部门ID
   *
   * @returns 目标部门ID或undefined
   */
  get toDepartmentId(): DepartmentId | undefined {
    return this.eventData.toDepartmentId;
  }

  /**
   * 获取切换原因
   *
   * @returns 切换原因或undefined
   */
  get reason(): string | undefined {
    return this.eventData.reason;
  }

  /**
   * 获取切换时间
   *
   * @returns 切换时间
   */
  get switchedAt(): Date {
    return this.eventData.switchedAt;
  }

  /**
   * 获取权限列表
   *
   * @returns 权限列表
   */
  get permissions(): readonly string[] {
    return this.eventData.permissions;
  }

  /**
   * 获取角色列表
   *
   * @returns 角色列表
   */
  get roles(): readonly string[] {
    return this.eventData.roles;
  }

  /**
   * 获取元数据
   *
   * @returns 元数据
   */
  get metadata(): Record<string, unknown> {
    return this.eventData.metadata;
  }

  /**
   * 检查是否为租户切换
   *
   * @returns 是否为租户切换
   */
  isTenantSwitch(): boolean {
    return this.fromTenantId !== undefined && this.toTenantId !== undefined;
  }

  /**
   * 检查是否为组织切换
   *
   * @returns 是否为组织切换
   */
  isOrganizationSwitch(): boolean {
    return (
      this.fromOrganizationId !== undefined &&
      this.toOrganizationId !== undefined
    );
  }

  /**
   * 检查是否为部门切换
   *
   * @returns 是否为部门切换
   */
  isDepartmentSwitch(): boolean {
    return (
      this.fromDepartmentId !== undefined && this.toDepartmentId !== undefined
    );
  }

  /**
   * 检查是否为跨租户切换
   *
   * @returns 是否为跨租户切换
   */
  isCrossTenantSwitch(): boolean {
    return this.isTenantSwitch() && !this.fromTenantId!.equals(this.toTenantId);
  }

  /**
   * 检查是否为跨组织切换
   *
   * @returns 是否为跨组织切换
   */
  isCrossOrganizationSwitch(): boolean {
    return (
      this.isOrganizationSwitch() &&
      !this.fromOrganizationId!.equals(this.toOrganizationId!)
    );
  }

  /**
   * 检查是否为跨部门切换
   *
   * @returns 是否为跨部门切换
   */
  isCrossDepartmentSwitch(): boolean {
    return (
      this.isDepartmentSwitch() &&
      !this.fromDepartmentId!.equals(this.toDepartmentId!)
    );
  }

  /**
   * 获取权限数量
   *
   * @returns 权限数量
   */
  getPermissionCount(): number {
    return this.permissions.length;
  }

  /**
   * 获取角色数量
   *
   * @returns 角色数量
   */
  getRoleCount(): number {
    return this.roles.length;
  }

  /**
   * 获取事件摘要
   *
   * @returns 事件摘要
   */
  getSummary(): string {
    const fromContext = this.fromTenantId
      ? `tenant ${this.fromTenantId.value}`
      : "platform";
    const toContext = `tenant ${this.toTenantId.value}`;
    const reasonText = this.reason ? ` (${this.reason})` : "";

    return `User ${this.userId.value} switched from ${fromContext} to ${toContext}${reasonText}`;
  }

  /**
   * 获取事件详细信息
   *
   * @returns 事件详细信息
   */
  getDetails(): Record<string, unknown> {
    return {
      eventType: "UserIdentitySwitchedEvent",
      userId: this.userId.value,
      fromTenantId: this.fromTenantId?.value,
      toTenantId: this.toTenantId.value,
      fromOrganizationId: this.fromOrganizationId?.value,
      toOrganizationId: this.toOrganizationId?.value,
      fromDepartmentId: this.fromDepartmentId?.value,
      toDepartmentId: this.toDepartmentId?.value,
      reason: this.reason,
      switchedAt: this.switchedAt.toISOString(),
      permissions: this.permissions,
      roles: this.roles,
      isTenantSwitch: this.isTenantSwitch(),
      isOrganizationSwitch: this.isOrganizationSwitch(),
      isDepartmentSwitch: this.isDepartmentSwitch(),
      isCrossTenantSwitch: this.isCrossTenantSwitch(),
      isCrossOrganizationSwitch: this.isCrossOrganizationSwitch(),
      isCrossDepartmentSwitch: this.isCrossDepartmentSwitch(),
      permissionCount: this.getPermissionCount(),
      roleCount: this.getRoleCount(),
      metadata: this.metadata,
    };
  }

  /**
   * 创建用户身份切换事件
   *
   * @param userId - 用户ID
   * @param toTenantId - 目标租户ID
   * @param permissions - 权限列表
   * @param roles - 角色列表
   * @param fromTenantId - 源租户ID
   * @param fromOrganizationId - 源组织ID
   * @param toOrganizationId - 目标组织ID
   * @param fromDepartmentId - 源部门ID
   * @param toDepartmentId - 目标部门ID
   * @param reason - 切换原因
   * @param metadata - 元数据
   * @returns 用户身份切换事件
   */
  static create(
    userId: UserId,
    toTenantId: TenantId,
    permissions: readonly string[],
    roles: readonly string[],
    fromTenantId?: TenantId,
    fromOrganizationId?: OrganizationId,
    toOrganizationId?: OrganizationId,
    fromDepartmentId?: DepartmentId,
    toDepartmentId?: DepartmentId,
    reason?: string,
    metadata: Record<string, unknown> = {},
  ): UserIdentitySwitchedEvent {
    return new UserIdentitySwitchedEvent({
      userId,
      fromTenantId,
      toTenantId,
      fromOrganizationId,
      toOrganizationId,
      fromDepartmentId,
      toDepartmentId,
      reason,
      switchedAt: new Date(),
      permissions,
      roles,
      metadata,
    });
  }

  /**
   * 创建租户切换事件
   *
   * @param userId - 用户ID
   * @param fromTenantId - 源租户ID
   * @param toTenantId - 目标租户ID
   * @param permissions - 权限列表
   * @param roles - 角色列表
   * @param reason - 切换原因
   * @param metadata - 元数据
   * @returns 租户切换事件
   */
  static createTenantSwitch(
    userId: UserId,
    fromTenantId: TenantId,
    toTenantId: TenantId,
    permissions: readonly string[],
    roles: readonly string[],
    reason?: string,
    metadata: Record<string, unknown> = {},
  ): UserIdentitySwitchedEvent {
    return UserIdentitySwitchedEvent.create(
      userId,
      toTenantId,
      permissions,
      roles,
      fromTenantId,
      undefined,
      undefined,
      undefined,
      undefined,
      reason,
      metadata,
    );
  }

  /**
   * 创建组织切换事件
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @param fromOrganizationId - 源组织ID
   * @param toOrganizationId - 目标组织ID
   * @param permissions - 权限列表
   * @param roles - 角色列表
   * @param reason - 切换原因
   * @param metadata - 元数据
   * @returns 组织切换事件
   */
  static createOrganizationSwitch(
    userId: UserId,
    tenantId: TenantId,
    fromOrganizationId: OrganizationId,
    toOrganizationId: OrganizationId,
    permissions: readonly string[],
    roles: readonly string[],
    reason?: string,
    metadata: Record<string, unknown> = {},
  ): UserIdentitySwitchedEvent {
    return UserIdentitySwitchedEvent.create(
      userId,
      tenantId,
      permissions,
      roles,
      undefined,
      fromOrganizationId,
      toOrganizationId,
      undefined,
      undefined,
      reason,
      metadata,
    );
  }

  /**
   * 创建部门切换事件
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @param fromDepartmentId - 源部门ID
   * @param toDepartmentId - 目标部门ID
   * @param permissions - 权限列表
   * @param roles - 角色列表
   * @param reason - 切换原因
   * @param metadata - 元数据
   * @returns 部门切换事件
   */
  static createDepartmentSwitch(
    userId: UserId,
    tenantId: TenantId,
    fromDepartmentId: DepartmentId,
    toDepartmentId: DepartmentId,
    permissions: readonly string[],
    roles: readonly string[],
    reason?: string,
    metadata: Record<string, unknown> = {},
  ): UserIdentitySwitchedEvent {
    return UserIdentitySwitchedEvent.create(
      userId,
      tenantId,
      permissions,
      roles,
      undefined,
      undefined,
      undefined,
      fromDepartmentId,
      toDepartmentId,
      reason,
      metadata,
    );
  }
}
