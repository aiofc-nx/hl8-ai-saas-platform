import { AggregateRoot } from "@hl8/domain-kernel";
import { Organization } from "../entities/organization.entity.js";
import { OrganizationId } from "../value-objects/organization-id.vo.js";
import { TenantId } from "../value-objects/tenant-id.vo.js";
import { type AuditInfo } from "@hl8/domain-kernel";

/**
 * 组织聚合根
 *
 * @description 组织聚合根，管理组织结构和权限
 * @since 1.0.0
 */
export class OrganizationAggregate extends AggregateRoot<OrganizationId> {
  private _organization: Organization;

  /**
   * 创建组织聚合根
   *
   * @param organization - 组织实体
   */
  constructor(organization: Organization) {
    super(organization.id);
    this._organization = organization;
  }

  /**
   * 获取组织实体
   *
   * @returns 组织实体
   */
  get organization(): Organization {
    return this._organization;
  }

  /**
   * 获取组织ID
   *
   * @returns 组织ID
   */
  get id(): OrganizationId {
    return this._organization.id;
  }

  /**
   * 获取租户ID
   *
   * @returns 租户ID
   */
  get tenantId(): TenantId {
    return this._organization.tenantId;
  }

  /**
   * 更新组织名称
   *
   * @param name - 新的组织名称
   */
  updateName(name: string): void {
    this._organization.updateName(name);
    this.updateTimestamp();
  }

  /**
   * 更新组织描述
   *
   * @param description - 新的组织描述
   */
  updateDescription(description: string): void {
    this._organization.updateDescription(description);
    this.updateTimestamp();
  }

  /**
   * 更新组织类型
   *
   * @param type - 新的组织类型
   */
  updateType(type: string): void {
    this._organization.updateType(type);
    this.updateTimestamp();
  }

  /**
   * 激活组织
   */
  activate(): void {
    this._organization.activate();
    this.updateTimestamp();
  }

  /**
   * 停用组织
   */
  deactivate(): void {
    this._organization.deactivate();
    this.updateTimestamp();
  }

  /**
   * 检查组织是否活跃
   *
   * @returns 是否活跃
   */
  isActive(): boolean {
    return this._organization.isActive();
  }

  /**
   * 检查组织是否可以删除
   *
   * @param hasDepartments - 是否有部门
   * @param hasUsers - 是否有用户
   * @returns 是否可以删除
   */
  canBeDeleted(hasDepartments: boolean, hasUsers: boolean): boolean {
    return !hasDepartments && !hasUsers;
  }

  /**
   * 删除组织前的验证
   *
   * @param hasDepartments - 是否有部门
   * @param hasUsers - 是否有用户
   * @throws {Error} 当组织不能删除时抛出错误
   */
  validateDeletion(hasDepartments: boolean, hasUsers: boolean): void {
    if (hasDepartments) {
      throw new Error("无法删除包含部门的组织");
    }

    if (hasUsers) {
      throw new Error("无法删除包含用户的组织");
    }
  }

  /**
   * 获取快照数据
   *
   * @returns 快照数据
   */
  getSnapshotData(): Record<string, unknown> {
    return {
      id: this._organization.id.getValue(),
      name: this._organization.name,
      description: this._organization.description,
      type: this._organization.type,
      tenantId: this._organization.tenantId.getValue(),
      status: this._organization.status,
      auditInfo: this._organization.auditInfo,
    };
  }

  /**
   * 从快照加载数据
   *
   * @param snapshot - 快照数据
   */
  loadFromSnapshot(_snapshot: Record<string, unknown>): void {
    // 这里应该重新构建组织实体
    // 实际实现中需要根据快照数据重建组织实体
    throw new Error("从快照加载数据的方法需要在具体实现中完成");
  }
}
