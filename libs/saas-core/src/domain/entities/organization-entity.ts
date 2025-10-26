import {
  BaseEntity,
  TenantId,
  OrganizationId,
  UserId,
  DepartmentId,
  SharingLevel,
} from "@hl8/domain-kernel";
import { OrganizationType } from "../value-objects/organization-type.vo.js";
import {
  OrganizationStatus,
  OrganizationStatusTransition,
} from "../value-objects/organization-status.vo.js";

/**
 * 组织内部实体
 * @description 执行组织相关的业务操作和维护自身状态
 *
 * @remarks
 * 实体与聚合根分离：
 * - 内部实体（OrganizationEntity）：执行业务逻辑操作，维护自身状态
 * - 聚合根（Organization）：协调内部实体，发布领域事件，管理聚合边界
 *
 * @example
 * ```typescript
 * const orgEntity = new OrganizationEntity(
 *   OrganizationId.create('org-123'),
 *   TenantId.create('tenant-123'),
 *   '测试组织',
 *   OrganizationType.COMMITTEE,
 *   OrganizationStatus.ACTIVE
 * );
 *
 * orgEntity.updateStatus(OrganizationStatus.INACTIVE);
 * orgEntity.addMember(UserId.generate());
 * ```
 */
export class OrganizationEntity extends BaseEntity<OrganizationId> {
  // 基础属性
  private _name: string;
  private _description: string;
  private _type: OrganizationType;
  private _status: OrganizationStatus;

  // 关联数据
  private _departments: Set<DepartmentId>;
  private _members: Set<UserId>;

  /**
   * 创建组织内部实体
   * @description 构造函数，初始化组织实体
   *
   * @param id - 组织ID
   * @param tenantId - 租户ID
   * @param name - 组织名称
   * @param type - 组织类型
   * @param status - 组织状态（默认为ACTIVE）
   * @param description - 组织描述（可选）
   * @param sharingLevel - 共享级别（默认为TENANT）
   */
  constructor(
    id: OrganizationId,
    tenantId: TenantId,
    name: string,
    type: OrganizationType,
    status: OrganizationStatus = OrganizationStatus.ACTIVE,
    description: string = "",
    sharingLevel: SharingLevel = SharingLevel.TENANT,
  ) {
    super(id, tenantId, undefined, undefined, undefined, false, sharingLevel);

    this._name = name;
    this._description = description;
    this._type = type;
    this._status = status;

    this._departments = new Set();
    this._members = new Set();
  }

  /**
   * 获取组织名称
   * @returns 组织名称
   */
  public getName(): string {
    return this._name;
  }

  /**
   * 获取组织描述
   * @returns 组织描述
   */
  public getDescription(): string {
    return this._description;
  }

  /**
   * 获取组织类型
   * @returns 组织类型
   */
  public getType(): OrganizationType {
    return this._type;
  }

  /**
   * 获取组织状态
   * @returns 组织状态
   */
  public getStatus(): OrganizationStatus {
    return this._status;
  }

  /**
   * 更新组织状态
   * @param newStatus - 新状态
   * @throws {Error} 当状态转换无效时
   *
   * @example
   * ```typescript
   * orgEntity.updateStatus(OrganizationStatus.INACTIVE);
   * ```
   */
  public updateStatus(newStatus: OrganizationStatus): void {
    if (!OrganizationStatusTransition.canTransition(this._status, newStatus)) {
      throw new Error(`不能从 ${this._status} 转换到 ${newStatus}`);
    }

    this._status = newStatus;
  }

  /**
   * 添加部门
   * @param departmentId - 部门ID
   */
  public addDepartment(departmentId: DepartmentId): void {
    this._departments.add(departmentId);
  }

  /**
   * 移除部门
   * @param departmentId - 部门ID
   */
  public removeDepartment(departmentId: DepartmentId): void {
    this._departments.delete(departmentId);
  }

  /**
   * 检查是否包含指定部门
   * @param departmentId - 部门ID
   * @returns 是否包含
   */
  public hasDepartment(departmentId: DepartmentId): boolean {
    return this._departments.has(departmentId);
  }

  /**
   * 获取所有部门ID
   * @returns 部门ID集合
   */
  public getDepartmentIds(): ReadonlySet<DepartmentId> {
    return this._departments;
  }

  /**
   * 添加成员
   * @param userId - 用户ID
   */
  public addMember(userId: UserId): void {
    this._members.add(userId);
  }

  /**
   * 移除成员
   * @param userId - 用户ID
   */
  public removeMember(userId: UserId): void {
    this._members.delete(userId);
  }

  /**
   * 检查是否包含指定成员
   * @param userId - 用户ID
   * @returns 是否包含
   */
  public hasMember(userId: UserId): boolean {
    return this._members.has(userId);
  }

  /**
   * 获取所有成员ID
   * @returns 成员ID集合
   */
  public getMemberIds(): ReadonlySet<UserId> {
    return this._members;
  }

  /**
   * 获取共享级别
   * @returns 共享级别
   */
  public getSharingLevel(): SharingLevel | undefined {
    return this.sharingLevel;
  }

  /**
   * 检查组织是否活跃
   * @returns 是否活跃
   */
  public isActive(): boolean {
    return this._status === OrganizationStatus.ACTIVE;
  }

  /**
   * 检查组织是否暂停
   * @returns 是否暂停
   */
  public isSuspended(): boolean {
    return this._status === OrganizationStatus.SUSPENDED;
  }

  /**
   * 检查组织是否非活跃
   * @returns 是否非活跃
   */
  public isInactive(): boolean {
    return this._status === OrganizationStatus.INACTIVE;
  }

  /**
   * 检查是否可以操作
   * @returns 是否可操作
   */
  public canOperate(): boolean {
    return this.isActive();
  }

  /**
   * 获取部门数量
   * @returns 部门数量
   */
  public getDepartmentCount(): number {
    return this._departments.size;
  }

  /**
   * 获取成员数量
   * @returns 成员数量
   */
  public getMemberCount(): number {
    return this._members.size;
  }
}
