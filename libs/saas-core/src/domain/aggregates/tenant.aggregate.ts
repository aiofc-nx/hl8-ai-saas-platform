import { AggregateRoot, TenantId, GenericEntityId } from "@hl8/domain-kernel";
import { TenantEntity } from "../entities/tenant-entity.js";
import { TenantType } from "../value-objects/tenant-type.vo.js";
import { TenantStatus } from "../value-objects/tenant-status.vo.js";

/**
 * 租户聚合根
 * @description 协调租户内部实体，发布领域事件，管理聚合边界
 *
 * @remarks
 * 实体与聚合根分离：
 * - 聚合根（Tenant）：协调内部实体，发布领域事件，管理聚合边界
 * - 内部实体（TenantEntity）：执行业务逻辑操作，维护自身状态
 *
 * @example
 * ```typescript
 * const tenant = Tenant.create(
 *   'TENANT001',
 *   '测试租户',
 *   'example.com',
 *   TenantType.BASIC
 * );
 *
 * tenant.changeStatus(TenantStatus.ACTIVE);
 * ```
 */
export class Tenant extends AggregateRoot<TenantId> {
  private _tenant: TenantEntity;

  /**
   * 构造函数
   * @description 创建租户聚合根实例
   * @param tenant - 租户内部实体
   */
  private constructor(tenant: TenantEntity) {
    super(tenant.id, tenant.tenantId);
    this._tenant = tenant;
  }

  /**
   * 创建租户
   * @description 创建新租户并发布租户创建事件
   *
   * @param code - 租户代码
   * @param name - 租户名称
   * @param domain - 租户域名
   * @param type - 租户类型
   * @returns 租户聚合根
   *
   * @example
   * ```typescript
   * const tenant = Tenant.create(
   *   'TENANT001',
   *   '测试租户',
   *   'example.com',
   *   TenantType.BASIC
   * );
   * ```
   */
  public static create(
    code: string,
    name: string,
    domain: string,
    type: TenantType,
  ): Tenant {
    const id = TenantId.generate();
    const tenantEntity = new TenantEntity(
      id,
      id, // tenantId 对于租户聚合根就是自身ID
      code,
      name,
      domain,
      type,
      TenantStatus.TRIAL,
    );

    const tenant = new Tenant(tenantEntity);

    // 发布租户创建事件
    const createEvent = {
      eventId: GenericEntityId.generate(),
      occurredAt: new Date(),
      aggregateId: id,
      version: 1,
      eventType: "TenantCreated",
      eventData: {
        code,
        name,
        domain,
        type,
      },
    };
    tenant.apply(createEvent);

    return tenant;
  }

  /**
   * 从快照恢复
   * @description 从快照恢复租户聚合根
   */
  public static fromSnapshot(snapshot: {
    id: string;
    code: string;
    name: string;
    domain: string;
    type: TenantType;
    status: TenantStatus;
  }): Tenant {
    const id = TenantId.create(snapshot.id);
    const tenantEntity = new TenantEntity(
      id,
      id, // tenantId 对于租户聚合根就是自身ID
      snapshot.code,
      snapshot.name,
      snapshot.domain,
      snapshot.type,
      snapshot.status,
    );

    return new Tenant(tenantEntity);
  }

  /**
   * 变更租户状态
   * @description 验证并更新租户状态，发布状态变更事件
   *
   * @param newStatus - 新状态
   * @throws {Error} 如果状态转换不合法
   *
   * @example
   * ```typescript
   * tenant.changeStatus(TenantStatus.ACTIVE);
   * ```
   */
  public changeStatus(newStatus: TenantStatus): void {
    const oldStatus = this._tenant.getStatus();
    this._tenant.updateStatus(newStatus);

    // 发布状态变更事件
    const statusChangeEvent = {
      eventId: GenericEntityId.generate(),
      occurredAt: new Date(),
      aggregateId: this.id,
      version: this.version + 1,
      eventType: "TenantStatusChanged",
      eventData: {
        oldStatus,
        newStatus,
      },
    };
    this.apply(statusChangeEvent);
  }

  /**
   * 获取租户代码
   * @returns 租户代码
   */
  public getCode(): string {
    return this._tenant.getCode();
  }

  /**
   * 获取租户名称
   * @returns 租户名称
   */
  public getName(): string {
    return this._tenant.getName();
  }

  /**
   * 获取租户域名
   * @returns 租户域名
   */
  public getDomain(): string {
    return this._tenant.getDomain();
  }

  /**
   * 获取租户类型
   * @returns 租户类型
   */
  public getType(): TenantType {
    return this._tenant.getType();
  }

  /**
   * 获取租户状态
   * @returns 租户状态
   */
  public getStatus(): TenantStatus {
    return this._tenant.getStatus();
  }

  /**
   * 获取最大部门层级
   * @description 返回租户支持的最大部门层级数（默认8层）
   * @returns 最大部门层级数
   */
  public getMaxDepartmentLevels(): number {
    return this._tenant.getMaxDepartmentLevels();
  }

  /**
   * 是否可以创建组织
   * @description 检查租户是否可以创建新组织
   * @param currentOrgCount - 当前组织数量
   * @returns 是否可以创建
   */
  public canCreateOrganization(currentOrgCount: number): boolean {
    return this._tenant.canCreateOrganization(currentOrgCount);
  }

  /**
   * 是否可以创建部门
   * @description 检查租户是否可以创建新部门（基于8层架构限制）
   * @param currentDeptLevel - 当前部门层级
   * @returns 是否可以创建
   */
  public canCreateDepartment(currentDeptLevel: number): boolean {
    return this._tenant.canCreateDepartment(currentDeptLevel);
  }

  /**
   * 是否可以添加用户
   * @description 检查租户是否可以添加新用户
   * @param currentUserCount - 当前用户数量
   * @returns 是否可以添加
   */
  public canAddUser(currentUserCount: number): boolean {
    return this._tenant.canAddUser(currentUserCount);
  }

  /**
   * 是否是活跃状态
   * @description 检查租户是否处于活跃状态
   * @returns 是否是活跃状态
   */
  public isActive(): boolean {
    return this._tenant.isActive();
  }

  /**
   * 检查租户是否被软删除
   * @description 检查租户是否已被删除（使用不同的方法名避免与基类冲突）
   * @returns 是否已删除
   */
  public isDeletedTenant(): boolean {
    return this._tenant.isDeletedTenant();
  }

  /**
   * 是否允许操作
   * @description 检查租户是否允许执行操作
   * @returns 是否允许操作
   */
  public canOperate(): boolean {
    return this._tenant.canOperate();
  }

  /**
   * 获取快照数据
   * @description 获取聚合的当前状态用于持久化
   * @returns 快照数据
   */
  protected getSnapshotData(): Record<string, unknown> {
    return {
      code: this._tenant.getCode(),
      name: this._tenant.getName(),
      domain: this._tenant.getDomain(),
      type: this._tenant.getType(),
      status: this._tenant.getStatus(),
    };
  }

  /**
   * 从快照加载
   * @description 从快照数据恢复聚合状态
   * @param snapshot - 快照数据
   */
  protected loadFromSnapshot(snapshot: Record<string, unknown>): void {
    const tenantEntity = new TenantEntity(
      this.id,
      this.tenantId,
      snapshot.code as string,
      snapshot.name as string,
      snapshot.domain as string,
      snapshot.type as TenantType,
      snapshot.status as TenantStatus,
    );
    this._tenant = tenantEntity;
  }
}
