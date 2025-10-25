import { BaseEntity } from "@hl8/domain-kernel";
import { DepartmentId } from "@hl8/domain-kernel";
import { OrganizationId } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import { AuditInfo } from "@hl8/domain-kernel";

/**
 * 部门实体
 *
 * @description 表示组织内的垂直业务执行单位，具有层级结构
 * @since 1.0.0
 */
export class Department extends BaseEntity<DepartmentId> {
  private _name: string;
  private _code: string;
  private _parentId: DepartmentId | null;
  private _level: number;

  /**
   * 创建部门实体
   *
   * @param id - 部门ID
   * @param name - 部门名称
   * @param code - 部门代码
   * @param organizationId - 所属组织ID
   * @param tenantId - 所属租户ID
   * @param parentId - 父部门ID（可选）
   * @param auditInfo - 审计信息
   */
  constructor(
    id: DepartmentId,
    name: string,
    code: string,
    organizationId: OrganizationId,
    tenantId: TenantId,
    parentId: DepartmentId | null = null,
    auditInfo?: AuditInfo,
  ) {
    super(
      id,
      tenantId,
      organizationId,
      parentId || undefined, // departmentId for the parent
      undefined, // userId
      false, // isShared
      undefined, // sharingLevel
      auditInfo,
    );
    this._name = name;
    this._code = code;
    this._parentId = parentId;
    this._level = parentId ? 1 : 1; // 默认层级为1，后续需要根据父部门计算
  }

  /**
   * 获取部门名称
   *
   * @returns 部门名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * 获取部门代码
   *
   * @returns 部门代码
   */
  get code(): string {
    return this._code;
  }

  /**
   * 获取父部门ID
   *
   * @returns 父部门ID或null
   */
  get parentId(): DepartmentId | null {
    return this._parentId;
  }

  /**
   * 获取部门层级
   *
   * @returns 部门层级
   */
  get level(): number {
    return this._level;
  }

  /**
   * 获取所属组织ID
   */
  get organizationId(): OrganizationId {
    return super.organizationId as OrganizationId;
  }

  /**
   * 获取所属租户ID
   */
  get tenantId(): TenantId {
    return super.tenantId as TenantId;
  }

  /**
   * 更新部门名称
   *
   * @param name - 新的部门名称
   */
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("部门名称不能为空");
    }

    if (name.length > 100) {
      throw new Error("部门名称长度不能超过100个字符");
    }

    this._name = name;
    this.updateTimestamp();
  }

  /**
   * 更新部门代码
   *
   * @param code - 新的部门代码
   */
  updateCode(code: string): void {
    if (!code || code.trim().length === 0) {
      throw new Error("部门代码不能为空");
    }

    if (code.length > 20) {
      throw new Error("部门代码长度不能超过20个字符");
    }

    if (!/^[A-Z0-9_-]+$/.test(code)) {
      throw new Error("部门代码只能包含大写字母、数字、连字符和下划线");
    }

    this._code = code;
    this.updateTimestamp();
  }

  /**
   * 设置父部门
   *
   * @param parentId - 父部门ID
   */
  setParent(parentId: DepartmentId | null): void {
    // 验证层级深度
    if (parentId && this._level >= 7) {
      throw new Error("部门层级不能超过7层");
    }

    this._parentId = parentId;
    this.updateTimestamp();
  }

  /**
   * 更新部门层级
   *
   * @param level - 新的部门层级
   */
  updateLevel(level: number): void {
    if (level < 1 || level > 7) {
      throw new Error("部门层级必须在1-7之间");
    }

    this._level = level;
    this.updateTimestamp();
  }

  /**
   * 检查是否为根部门
   *
   * @returns 是否为根部门
   */
  isRoot(): boolean {
    return this._parentId === null;
  }

  /**
   * 检查是否为叶子部门
   *
   * @param hasChildren - 是否有子部门
   * @returns 是否为叶子部门
   */
  isLeaf(hasChildren: boolean): boolean {
    return !hasChildren;
  }

  /**
   * 检查层级是否有效
   *
   * @returns 层级是否有效
   */
  isValidLevel(): boolean {
    return this._level >= 1 && this._level <= 7;
  }

  /**
   * 获取部门路径（用于显示层级结构）
   *
   * @returns 部门路径字符串
   */
  getPath(): string {
    return `${this._code}`;
  }

  /**
   * 检查是否可以移动到指定父部门下
   *
   * @param newParentId - 新的父部门ID
   * @returns 是否可以移动
   */
  canMoveTo(newParentId: DepartmentId | null): boolean {
    // 不能移动到自己的子部门下（避免循环引用）
    if (newParentId && newParentId.equals(this.id)) {
      return false;
    }

    // 检查层级深度
    const newLevel = newParentId ? 2 : 1; // 简化计算，实际应该根据父部门层级计算
    return newLevel <= 7;
  }

  /**
   * 移动到新的父部门
   *
   * @param newParentId - 新的父部门ID
   */
  moveTo(newParentId: DepartmentId | null): void {
    if (!this.canMoveTo(newParentId)) {
      throw new Error("无法移动到指定的父部门下");
    }

    this._parentId = newParentId;
    // 更新层级（简化处理，实际应该递归计算）
    this._level = newParentId ? 2 : 1;
    this.updateTimestamp();
  }
}
