import {
  AggregateRoot,
  DepartmentId,
  OrganizationId,
  TenantId,
  GenericEntityId,
} from "@hl8/domain-kernel";
import { DepartmentEntity } from "../entities/department-entity.js";
import { DepartmentStatus } from "../value-objects/department-status.vo.js";
import { DepartmentPath } from "../value-objects/department-path.vo.js";

/**
 * 部门聚合根
 * @description 协调部门内部实体，发布领域事件，管理聚合边界
 *
 * @remarks
 * 实体与聚合根分离：
 * - 聚合根（Department）：协调内部实体，发布领域事件，管理聚合边界
 * - 内部实体（DepartmentEntity）：执行业务逻辑操作，维护自身状态
 *
 * @example
 * ```typescript
 * const department = Department.create(
 *   TenantId.create('tenant-123'),
 *   OrganizationId.create('org-123'),
 *   '研发部门',
 *   null // 根部门，无父部门
 * );
 *
 * department.changeStatus(DepartmentStatus.INACTIVE);
 * ```
 */
export class Department extends AggregateRoot<DepartmentId> {
  private _department: DepartmentEntity;

  /**
   * 构造函数
   * @description 创建部门聚合根实例
   * @param department - 部门内部实体
   */
  private constructor(department: DepartmentEntity) {
    super(department.id, department.tenantId, undefined, undefined, 0);
    this._department = department;
  }

  /**
   * 创建部门
   * @description 创建新部门并发布部门创建事件
   *
   * @param tenantId - 租户ID
   * @param organizationId - 组织ID
   * @param name - 部门名称
   * @param parentId - 父部门ID（可选，根部门为null）
   * @param description - 部门描述（可选）
   * @returns 部门聚合根
   *
   * @example
   * ```typescript
   * const department = Department.create(
   *   TenantId.create('tenant-123'),
   *   OrganizationId.create('org-123'),
   *   '研发部门',
   *   null // 根部门
   * );
   * ```
   */
  public static create(
    tenantId: TenantId,
    organizationId: OrganizationId,
    name: string,
    parentId: DepartmentId | null = null,
    description: string = "",
  ): Department {
    const id = DepartmentId.generate();
    const path = parentId
      ? DepartmentPath.fromString(parentId.toString()).append(id)
      : DepartmentPath.createRoot(id);

    const deptEntity = new DepartmentEntity(
      id,
      tenantId,
      organizationId,
      name,
      path,
      DepartmentStatus.ACTIVE,
      parentId,
      description,
    );

    const department = new Department(deptEntity);

    // 发布部门创建事件
    const createEvent = {
      eventId: GenericEntityId.generate(),
      occurredAt: new Date(),
      aggregateId: id,
      version: 1,
      eventType: "DepartmentCreated",
      eventData: {
        tenantId: tenantId.toString(),
        organizationId: organizationId.toString(),
        name,
        parentId: parentId?.toString() || null,
        description,
        level: path.getLevel(),
      },
    };
    department.apply(createEvent);

    return department;
  }

  /**
   * 从快照恢复
   * @description 从快照恢复部门聚合根
   */
  public static fromSnapshot(snapshot: {
    id: string;
    tenantId: string;
    organizationId: string;
    name: string;
    status: DepartmentStatus;
    parentId: string | null;
    path: string;
    level: number;
    description: string;
  }): Department {
    const id = DepartmentId.create(snapshot.id);
    const tenantId = TenantId.create(snapshot.tenantId);
    const organizationId = OrganizationId.create(snapshot.organizationId);
    const path = DepartmentPath.fromString(snapshot.path);
    const parentId = snapshot.parentId
      ? DepartmentId.create(snapshot.parentId)
      : null;

    const deptEntity = new DepartmentEntity(
      id,
      tenantId,
      organizationId,
      snapshot.name,
      path,
      snapshot.status,
      parentId,
      snapshot.description,
    );

    return new Department(deptEntity);
  }

  /**
   * 变更部门状态
   * @description 验证并更新部门状态，发布状态变更事件
   *
   * @param newStatus - 新状态
   * @throws {Error} 如果状态转换不合法
   *
   * @example
   * ```typescript
   * department.changeStatus(DepartmentStatus.INACTIVE);
   * ```
   */
  public changeStatus(newStatus: DepartmentStatus): void {
    const oldStatus = this._department.getStatus();
    this._department.updateStatus(newStatus);

    // 发布状态变更事件
    const statusChangeEvent = {
      eventId: GenericEntityId.generate(),
      occurredAt: new Date(),
      aggregateId: this.id,
      version: this.version + 1,
      eventType: "DepartmentStatusChanged",
      eventData: {
        oldStatus,
        newStatus,
      },
    };
    this.apply(statusChangeEvent);
  }

  /**
   * 获取部门名称
   * @returns 部门名称
   */
  public getName(): string {
    return this._department.getName();
  }

  /**
   * 获取部门状态
   * @returns 部门状态
   */
  public getStatus(): DepartmentStatus {
    return this._department.getStatus();
  }

  /**
   * 获取部门描述
   * @returns 部门描述
   */
  public getDescription(): string {
    return this._department.getDescription();
  }

  /**
   * 获取父部门ID
   * @returns 父部门ID，如果是根部门则返回null
   */
  public getParentId(): DepartmentId | null {
    return this._department.getParentId();
  }

  /**
   * 获取部门路径
   * @returns 部门路径
   */
  public getPath(): DepartmentPath {
    return this._department.getPath();
  }

  /**
   * 获取部门层级
   * @returns 部门层级（1-based）
   */
  public getLevel(): number {
    return this._department.getLevel();
  }

  /**
   * 检查部门是否活跃
   * @returns 是否活跃
   */
  public isActive(): boolean {
    return this._department.isActive();
  }

  /**
   * 检查部门是否可操作
   * @returns 是否可操作
   */
  public canOperate(): boolean {
    return this._department.canOperate();
  }

  /**
   * 检查是否为根部门
   * @returns 是否为根部门
   */
  public isRoot(): boolean {
    return this._department.isRoot();
  }

  /**
   * 获取快照数据
   * @description 用于事件溯源，返回聚合根的当前状态快照
   * @returns 快照数据
   */
  public getSnapshotData(): {
    id: string;
    tenantId: string;
    organizationId: string;
    name: string;
    status: DepartmentStatus;
    parentId: string | null;
    path: string;
    level: number;
    description: string;
  } {
    return {
      id: this.id.toString(),
      tenantId: this.tenantId.toString(),
      organizationId: this.organizationId?.toString() || "",
      name: this._department.getName(),
      status: this._department.getStatus(),
      parentId: this._department.getParentId()?.toString() || null,
      path: this._department.getPath().toString(),
      level: this._department.getLevel(),
      description: this._department.getDescription(),
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
    organizationId: string;
    name: string;
    status: DepartmentStatus;
    parentId: string | null;
    path: string;
    level: number;
    description: string;
  }): void {
    // 重建内部实体
    const id = DepartmentId.create(snapshot.id);
    const tenantId = TenantId.create(snapshot.tenantId);
    const organizationId = OrganizationId.create(snapshot.organizationId);
    const path = DepartmentPath.fromString(snapshot.path);
    const parentId = snapshot.parentId
      ? DepartmentId.create(snapshot.parentId)
      : null;

    this._department = new DepartmentEntity(
      id,
      tenantId,
      organizationId,
      snapshot.name,
      path,
      snapshot.status,
      parentId,
      snapshot.description,
    );
  }
}
