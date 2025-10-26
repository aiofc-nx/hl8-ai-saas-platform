import {
  AggregateRoot,
  OrganizationId,
  TenantId,
  GenericEntityId,
} from "@hl8/domain-kernel";
import { OrganizationEntity } from "../entities/organization-entity.js";
import { OrganizationType } from "../value-objects/organization-type.vo.js";
import { OrganizationStatus } from "../value-objects/organization-status.vo.js";

/**
 * 组织聚合根
 * @description 协调组织内部实体，发布领域事件，管理聚合边界
 *
 * @remarks
 * 实体与聚合根分离：
 * - 聚合根（Organization）：协调内部实体，发布领域事件，管理聚合边界
 * - 内部实体（OrganizationEntity）：执行业务逻辑操作，维护自身状态
 *
 * @example
 * ```typescript
 * const organization = Organization.create(
 *   TenantId.create('tenant-123'),
 *   '测试组织',
 *   OrganizationType.COMMITTEE
 * );
 *
 * organization.changeStatus(OrganizationStatus.INACTIVE);
 * ```
 */
export class Organization extends AggregateRoot<OrganizationId> {
  private _organization: OrganizationEntity;

  /**
   * 构造函数
   * @description 创建组织聚合根实例
   * @param organization - 组织内部实体
   */
  private constructor(organization: OrganizationEntity) {
    super(organization.id, organization.tenantId, undefined, undefined, 0);
    this._organization = organization;
  }

  /**
   * 创建组织
   * @description 创建新组织并发布组织创建事件
   *
   * @param tenantId - 租户ID
   * @param name - 组织名称
   * @param type - 组织类型
   * @param description - 组织描述（可选）
   * @returns 组织聚合根
   *
   * @example
   * ```typescript
   * const organization = Organization.create(
   *   TenantId.create('tenant-123'),
   *   '测试组织',
   *   OrganizationType.COMMITTEE
   * );
   * ```
   */
  public static create(
    tenantId: TenantId,
    name: string,
    type: OrganizationType,
    description: string = "",
  ): Organization {
    const id = OrganizationId.generate();
    const orgEntity = new OrganizationEntity(
      id,
      tenantId,
      name,
      type,
      OrganizationStatus.ACTIVE,
      description,
    );

    const organization = new Organization(orgEntity);

    // 发布组织创建事件
    const createEvent = {
      eventId: GenericEntityId.generate(),
      occurredAt: new Date(),
      aggregateId: id,
      version: 1,
      eventType: "OrganizationCreated",
      eventData: {
        tenantId: tenantId.toString(),
        name,
        type,
        description,
      },
    };
    organization.apply(createEvent);

    return organization;
  }

  /**
   * 从快照恢复
   * @description 从快照恢复组织聚合根
   */
  public static fromSnapshot(snapshot: {
    id: string;
    tenantId: string;
    name: string;
    type: OrganizationType;
    status: OrganizationStatus;
    description: string;
  }): Organization {
    const id = OrganizationId.create(snapshot.id);
    const tenantId = TenantId.create(snapshot.tenantId);
    const orgEntity = new OrganizationEntity(
      id,
      tenantId,
      snapshot.name,
      snapshot.type,
      snapshot.status,
      snapshot.description,
    );

    return new Organization(orgEntity);
  }

  /**
   * 变更组织状态
   * @description 验证并更新组织状态，发布状态变更事件
   *
   * @param newStatus - 新状态
   * @throws {Error} 如果状态转换不合法
   *
   * @example
   * ```typescript
   * organization.changeStatus(OrganizationStatus.INACTIVE);
   * ```
   */
  public changeStatus(newStatus: OrganizationStatus): void {
    const oldStatus = this._organization.getStatus();
    this._organization.updateStatus(newStatus);

    // 发布状态变更事件
    const statusChangeEvent = {
      eventId: GenericEntityId.generate(),
      occurredAt: new Date(),
      aggregateId: this.id,
      version: this.version + 1,
      eventType: "OrganizationStatusChanged",
      eventData: {
        oldStatus,
        newStatus,
      },
    };
    this.apply(statusChangeEvent);
  }

  /**
   * 获取组织名称
   * @returns 组织名称
   */
  public getName(): string {
    return this._organization.getName();
  }

  /**
   * 获取组织类型
   * @returns 组织类型
   */
  public getType(): OrganizationType {
    return this._organization.getType();
  }

  /**
   * 获取组织状态
   * @returns 组织状态
   */
  public getStatus(): OrganizationStatus {
    return this._organization.getStatus();
  }

  /**
   * 获取组织描述
   * @returns 组织描述
   */
  public getDescription(): string {
    return this._organization.getDescription();
  }

  /**
   * 检查组织是否活跃
   * @returns 是否活跃
   */
  public isActive(): boolean {
    return this._organization.isActive();
  }

  /**
   * 检查组织是否可操作
   * @returns 是否可操作
   */
  public canOperate(): boolean {
    return this._organization.canOperate();
  }

  /**
   * 获取快照数据
   * @description 用于事件溯源，返回聚合根的当前状态快照
   * @returns 快照数据
   */
  public getSnapshotData(): {
    id: string;
    tenantId: string;
    name: string;
    type: OrganizationType;
    status: OrganizationStatus;
    description: string;
  } {
    return {
      id: this.id.toString(),
      tenantId: this.tenantId.toString(),
      name: this._organization.getName(),
      type: this._organization.getType(),
      status: this._organization.getStatus(),
      description: this._organization.getDescription(),
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
    name: string;
    type: OrganizationType;
    status: OrganizationStatus;
    description: string;
  }): void {
    // 重建内部实体
    const id = OrganizationId.create(snapshot.id);
    const tenantId = TenantId.create(snapshot.tenantId);
    this._organization = new OrganizationEntity(
      id,
      tenantId,
      snapshot.name,
      snapshot.type,
      snapshot.status,
      snapshot.description,
    );
  }
}
