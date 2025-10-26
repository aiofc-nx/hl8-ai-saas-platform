import {
  BaseEntity,
  TenantId,
  OrganizationId,
  DepartmentId,
  UserId,
} from "@hl8/domain-kernel";
import {
  DepartmentStatus,
  DepartmentStatusTransition,
} from "../value-objects/department-status.vo.js";
import { DepartmentPath } from "../value-objects/department-path.vo.js";

/**
 * 部门内部实体
 * @description 执行部门相关的业务操作和维护自身状态
 *
 * @remarks
 * 实体与聚合根分离：
 * - 内部实体（DepartmentEntity）：执行业务逻辑操作，维护自身状态
 * - 聚合根（Department）：协调内部实体，发布领域事件，管理聚合边界
 *
 * @example
 * ```typescript
 * const deptEntity = new DepartmentEntity(
 *   DepartmentId.generate(),
 *   TenantId.create('tenant-123'),
 *   OrganizationId.create('org-123'),
 *   '研发部门',
 *   DepartmentPath.createRoot(DepartmentId.generate()),
 *   DepartmentStatus.ACTIVE
 * );
 *
 * deptEntity.updateStatus(DepartmentStatus.INACTIVE);
 * deptEntity.addMember(UserId.generate());
 * ```
 */
export class DepartmentEntity extends BaseEntity<DepartmentId> {
  // 基础属性
  private _name: string;
  private _description: string;
  private _status: DepartmentStatus;

  // 层级关系
  private _parentId: DepartmentId | null;
  private _path: DepartmentPath;
  private _level: number;

  // 关联数据
  private _members: Set<UserId>;
  private _children: Set<DepartmentId>;

  /**
   * 创建部门内部实体
   * @description 构造函数，初始化部门实体
   *
   * @param id - 部门ID
   * @param tenantId - 租户ID
   * @param organizationId - 组织ID
   * @param name - 部门名称
   * @param path - 部门路径
   * @param status - 部门状态（默认为ACTIVE）
   * @param parentId - 父部门ID（可选）
   * @param description - 部门描述（可选）
   */
  constructor(
    id: DepartmentId,
    tenantId: TenantId,
    organizationId: OrganizationId,
    name: string,
    path: DepartmentPath,
    status: DepartmentStatus = DepartmentStatus.ACTIVE,
    parentId: DepartmentId | null = null,
    description: string = "",
  ) {
    super(id, tenantId, organizationId, id);

    this._name = name;
    this._description = description;
    this._status = status;
    this._parentId = parentId;
    this._path = path;
    this._level = path.getLevel();

    this._members = new Set();
    this._children = new Set();
  }

  /**
   * 获取部门名称
   * @returns 部门名称
   */
  public getName(): string {
    return this._name;
  }

  /**
   * 获取部门描述
   * @returns 部门描述
   */
  public getDescription(): string {
    return this._description;
  }

  /**
   * 获取部门状态
   * @returns 部门状态
   */
  public getStatus(): DepartmentStatus {
    return this._status;
  }

  /**
   * 获取父部门ID
   * @returns 父部门ID，如果是根部门则返回null
   */
  public getParentId(): DepartmentId | null {
    return this._parentId;
  }

  /**
   * 获取部门路径
   * @returns 部门路径
   */
  public getPath(): DepartmentPath {
    return this._path;
  }

  /**
   * 获取部门层级
   * @returns 部门层级（1-based）
   */
  public getLevel(): number {
    return this._level;
  }

  /**
   * 更新部门状态
   * @param newStatus - 新状态
   * @throws {Error} 当状态转换无效时
   *
   * @example
   * ```typescript
   * deptEntity.updateStatus(DepartmentStatus.INACTIVE);
   * ```
   */
  public updateStatus(newStatus: DepartmentStatus): void {
    if (!DepartmentStatusTransition.canTransition(this._status, newStatus)) {
      throw new Error(`不能从 ${this._status} 转换到 ${newStatus}`);
    }

    this._status = newStatus;
  }

  /**
   * 添加子部门
   * @param departmentId - 子部门ID
   */
  public addChild(departmentId: DepartmentId): void {
    this._children.add(departmentId);
  }

  /**
   * 移除子部门
   * @param departmentId - 子部门ID
   */
  public removeChild(departmentId: DepartmentId): void {
    this._children.delete(departmentId);
  }

  /**
   * 检查是否包含指定子部门
   * @param departmentId - 部门ID
   * @returns 是否包含
   */
  public hasChild(departmentId: DepartmentId): boolean {
    return this._children.has(departmentId);
  }

  /**
   * 获取所有子部门ID
   * @returns 子部门ID集合
   */
  public getChildIds(): ReadonlySet<DepartmentId> {
    return this._children;
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
   * 检查是否为根部门
   * @returns 是否为根部门
   */
  public isRoot(): boolean {
    return this._path.isRoot();
  }

  /**
   * 检查部门是否活跃
   * @returns 是否活跃
   */
  public isActive(): boolean {
    return this._status === DepartmentStatus.ACTIVE;
  }

  /**
   * 检查部门是否非活跃
   * @returns 是否非活跃
   */
  public isInactive(): boolean {
    return this._status === DepartmentStatus.INACTIVE;
  }

  /**
   * 检查部门是否已归档
   * @returns 是否已归档
   */
  public isArchived(): boolean {
    return this._status === DepartmentStatus.ARCHIVED;
  }

  /**
   * 检查是否可以操作
   * @returns 是否可操作
   */
  public canOperate(): boolean {
    return this.isActive() && !this.isArchived();
  }

  /**
   * 检查是否为指定部门的后代
   * @param departmentPath - 部门路径
   * @returns 是否为其后代
   */
  public isDescendantOf(departmentPath: DepartmentPath): boolean {
    return this._path.isDescendantOf(departmentPath);
  }

  /**
   * 检查是否为指定部门的祖先
   * @param departmentPath - 部门路径
   * @returns 是否为其祖先
   */
  public isAncestorOf(departmentPath: DepartmentPath): boolean {
    return this._path.isAncestorOf(departmentPath);
  }

  /**
   * 获取祖先部门ID列表
   * @returns 祖先部门ID列表
   */
  public getAncestorIds(): DepartmentId[] {
    return this._path.getAncestorIds();
  }

  /**
   * 获取子部门数量
   * @returns 子部门数量
   */
  public getChildCount(): number {
    return this._children.size;
  }

  /**
   * 获取成员数量
   * @returns 成员数量
   */
  public getMemberCount(): number {
    return this._members.size;
  }
}
