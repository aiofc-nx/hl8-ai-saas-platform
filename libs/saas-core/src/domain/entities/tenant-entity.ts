import { BaseEntity } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import {
  TenantType,
  getResourceLimits,
} from "../value-objects/tenant-type.vo.js";
import {
  TenantStatus,
  TenantStatusTransition,
} from "../value-objects/tenant-status.vo.js";

/**
 * 租户内部实体
 * @description 执行租户相关的业务操作和维护自身状态
 *
 * @remarks
 * 实体与聚合根分离：
 * - 内部实体（TenantEntity）：执行业务逻辑操作，维护自身状态
 * - 聚合根（Tenant）：协调内部实体，发布领域事件，管理聚合边界
 *
 * @example
 * ```typescript
 * const tenantEntity = new TenantEntity(
 *   TenantId.create('tenant-123'),
 *   'TENANT001',
 *   '测试租户',
 *   'example.com',
 *   TenantType.BASIC
 * );
 *
 * tenantEntity.updateStatus(TenantStatus.ACTIVE);
 * const canAddOrg = tenantEntity.canCreateOrganization();
 * ```
 */
export class TenantEntity extends BaseEntity<TenantId> {
  // 基础属性
  private _code: string;
  private _name: string;
  private _domain: string;

  // 租户类型和状态
  private _type: TenantType;
  private _status: TenantStatus;

  // 资源限制（从租户类型获取）
  private _maxUsers: number;
  private _maxStorage: string;
  private _maxOrganizations: number;
  private _maxDepartmentLevels: number;

  /**
   * 创建租户内部实体
   * @description 构造函数，初始化租户实体
   *
   * @param id - 租户ID
   * @param code - 租户代码（唯一标识）
   * @param name - 租户名称
   * @param domain - 租户域名
   * @param type - 租户类型
   * @param status - 租户状态（默认为TRIAL）
   */
  constructor(
    id: TenantId,
    tenantId: TenantId,
    code: string,
    name: string,
    domain: string,
    type: TenantType,
    status: TenantStatus = TenantStatus.TRIAL,
  ) {
    super(id, tenantId);

    this._code = code;
    this._name = name;
    this._domain = domain;
    this._type = type;
    this._status = status;

    // 根据租户类型设置资源限制
    const limits = getResourceLimits(type);
    this._maxUsers = limits.maxUsers;
    this._maxStorage = limits.maxStorage;
    this._maxOrganizations = limits.maxOrganizations;
    this._maxDepartmentLevels = limits.maxDepartmentLevels;
  }

  /**
   * 获取租户代码
   * @returns 租户代码
   */
  public getCode(): string {
    return this._code;
  }

  /**
   * 获取租户名称
   * @returns 租户名称
   */
  public getName(): string {
    return this._name;
  }

  /**
   * 获取租户域名
   * @returns 租户域名
   */
  public getDomain(): string {
    return this._domain;
  }

  /**
   * 获取租户类型
   * @returns 租户类型
   */
  public getType(): TenantType {
    return this._type;
  }

  /**
   * 获取租户状态
   * @returns 租户状态
   */
  public getStatus(): TenantStatus {
    return this._status;
  }

  /**
   * 获取最大用户数
   * @returns 最大用户数
   */
  public getMaxUsers(): number {
    return this._maxUsers;
  }

  /**
   * 获取最大存储空间
   * @returns 最大存储空间
   */
  public getMaxStorage(): string {
    return this._maxStorage;
  }

  /**
   * 获取最大组织数
   * @returns 最大组织数
   */
  public getMaxOrganizations(): number {
    return this._maxOrganizations;
  }

  /**
   * 获取最大部门层级
   * @description 返回租户支持的最大部门层级数（默认8层）
   * @returns 最大部门层级数
   */
  public getMaxDepartmentLevels(): number {
    return this._maxDepartmentLevels;
  }

  /**
   * 更新租户状态
   * @description 验证并更新租户状态，执行状态转换规则
   * @param newStatus - 新状态
   * @throws {Error} 如果状态转换不合法
   *
   * @example
   * ```typescript
   * tenantEntity.updateStatus(TenantStatus.ACTIVE);
   * ```
   */
  public updateStatus(newStatus: TenantStatus): void {
    TenantStatusTransition.validateTransition(this._status, newStatus);
    this._status = newStatus;
  }

  /**
   * 是否可以创建组织
   * @description 检查租户是否可以创建新组织（基于当前组织数限制）
   * @param currentOrgCount - 当前组织数量
   * @returns 是否可以创建
   *
   * @example
   * ```typescript
   * const canCreate = tenantEntity.canCreateOrganization(5);
   * ```
   */
  public canCreateOrganization(currentOrgCount: number): boolean {
    if (this._type === TenantType.CUSTOM) {
      return true; // 定制类型无限制
    }
    return currentOrgCount < this._maxOrganizations;
  }

  /**
   * 是否可以创建部门
   * @description 检查租户是否可以创建新部门（基于8层架构限制）
   * @param currentDeptLevel - 当前部门层级
   * @returns 是否可以创建
   *
   * @example
   * ```typescript
   * const canCreate = tenantEntity.canCreateDepartment(6);
   * ```
   */
  public canCreateDepartment(currentDeptLevel: number): boolean {
    if (this._type === TenantType.CUSTOM) {
      return true; // 定制类型无限制
    }
    return currentDeptLevel < this._maxDepartmentLevels;
  }

  /**
   * 是否可以添加用户
   * @description 检查租户是否可以添加新用户（基于用户数限制）
   * @param currentUserCount - 当前用户数量
   * @returns 是否可以添加
   *
   * @example
   * ```typescript
   * const canAdd = tenantEntity.canAddUser(45);
   * ```
   */
  public canAddUser(currentUserCount: number): boolean {
    if (this._type === TenantType.CUSTOM) {
      return true; // 定制类型无限制
    }
    return currentUserCount < this._maxUsers;
  }

  /**
   * 是否是活跃状态
   * @description 检查租户是否处于活跃状态
   * @returns 是否是活跃状态
   */
  public isActive(): boolean {
    return this._status === TenantStatus.ACTIVE;
  }

  /**
   * 是否是已删除状态
   * @description 检查租户是否已被删除（使用不同的方法名避免与基类冲突）
   * @returns 是否已删除
   */
  public isDeletedTenant(): boolean {
    return this._status === TenantStatus.DELETED;
  }

  /**
   * 是否允许操作
   * @description 检查租户是否允许执行操作（非已删除状态）
   * @returns 是否允许操作
   */
  public canOperate(): boolean {
    return !this.isDeletedTenant();
  }
}
