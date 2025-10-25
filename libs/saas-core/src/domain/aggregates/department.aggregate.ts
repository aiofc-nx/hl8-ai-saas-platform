import {
  AggregateRoot,
  TenantId as KernelTenantId,
} from "@hl8/domain-kernel";
import { Department } from "../entities/department.entity.js";
import { DepartmentId } from "@hl8/domain-kernel";
import { OrganizationId } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import { type AuditInfo } from "@hl8/domain-kernel";

/**
 * 部门聚合根
 *
 * @description 部门聚合根，管理部门层级结构和用户分配
 * @since 1.0.0
 */
export class DepartmentAggregate extends AggregateRoot<DepartmentId> {
  private _department: Department;

  /**
   * 创建部门聚合根
   *
   * @param department - 部门实体
   */
  constructor(department: Department) {
    // 创建 platform-level tenantId
    const platformTenantId = KernelTenantId.create(
      "00000000-0000-0000-0000-000000000000",
    );
    // 将 DepartmentId 转换为 domain-kernel 的 DepartmentId
    const departmentKernelId = department.id as unknown as DepartmentId;
    super(departmentKernelId, platformTenantId);
    this._department = department;
  }

  /**
   * 获取部门实体
   *
   * @returns 部门实体
   */
  get department(): Department {
    return this._department;
  }

  /**
   * 获取部门ID
   *
   * @returns 部门ID
   */
  get id(): DepartmentId {
    return this._department.id;
  }

  /**
   * 获取组织ID
   *
   * @returns 组织ID
   */
  get organizationId(): OrganizationId {
    return this._department.organizationId;
  }

  /**
   * 获取租户ID
   *
   * @returns 租户ID
   */
  get tenantId(): TenantId {
    return this._department.tenantId;
  }

  /**
   * 更新部门名称
   *
   * @param name - 新的部门名称
   */
  updateName(name: string): void {
    this._department.updateName(name);
    this.updateTimestamp();
  }

  /**
   * 更新部门代码
   *
   * @param code - 新的部门代码
   */
  updateCode(code: string): void {
    this._department.updateCode(code);
    this.updateTimestamp();
  }

  /**
   * 设置父部门
   *
   * @param parentId - 父部门ID
   */
  setParent(parentId: DepartmentId | null): void {
    this._department.setParent(parentId);
    this.updateTimestamp();
  }

  /**
   * 更新部门层级
   *
   * @param level - 新的部门层级
   */
  updateLevel(level: number): void {
    this._department.updateLevel(level);
    this.updateTimestamp();
  }

  /**
   * 移动到新的父部门
   *
   * @param newParentId - 新的父部门ID
   */
  moveTo(newParentId: DepartmentId | null): void {
    this._department.moveTo(newParentId);
    this.updateTimestamp();
  }

  /**
   * 检查是否为根部门
   *
   * @returns 是否为根部门
   */
  isRoot(): boolean {
    return this._department.isRoot();
  }

  /**
   * 检查是否为叶子部门
   *
   * @param hasChildren - 是否有子部门
   * @returns 是否为叶子部门
   */
  isLeaf(hasChildren: boolean): boolean {
    return this._department.isLeaf(hasChildren);
  }

  /**
   * 检查部门是否可以删除
   *
   * @param hasChildren - 是否有子部门
   * @param hasUsers - 是否有用户
   * @returns 是否可以删除
   */
  canBeDeleted(hasChildren: boolean, hasUsers: boolean): boolean {
    return !hasChildren && !hasUsers;
  }

  /**
   * 删除部门前的验证
   *
   * @param hasChildren - 是否有子部门
   * @param hasUsers - 是否有用户
   * @throws {Error} 当部门不能删除时抛出错误
   */
  validateDeletion(hasChildren: boolean, hasUsers: boolean): void {
    if (hasChildren) {
      throw new Error("无法删除包含子部门的部门");
    }

    if (hasUsers) {
      throw new Error("无法删除包含用户的部门");
    }
  }

  /**
   * 检查是否可以移动到指定父部门下
   *
   * @param newParentId - 新的父部门ID
   * @returns 是否可以移动
   */
  canMoveTo(newParentId: DepartmentId | null): boolean {
    return this._department.canMoveTo(newParentId);
  }

  /**
   * 获取部门路径
   *
   * @returns 部门路径字符串
   */
  getPath(): string {
    return this._department.getPath();
  }

  /**
   * 获取快照数据
   *
   * @returns 快照数据
   */
  getSnapshotData(): Record<string, unknown> {
    return {
      id: this._department.id.getValue(),
      name: this._department.name,
      code: this._department.code,
      parentId: this._department.parentId?.getValue() || null,
      level: this._department.level,
      organizationId: this._department.organizationId.getValue(),
      tenantId: this._department.tenantId.getValue(),
      auditInfo: this._department.auditInfo,
    };
  }

  /**
   * 从快照加载数据
   *
   * @param snapshot - 快照数据
   */
  loadFromSnapshot(_snapshot: Record<string, unknown>): void {
    // 这里应该重新构建部门实体
    // 实际实现中需要根据快照数据重建部门实体
    throw new Error("从快照加载数据的方法需要在具体实现中完成");
  }
}
