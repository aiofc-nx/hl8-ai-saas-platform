/**
 * 基础实体类
 *
 * 实体是领域驱动设计中的核心概念，具有唯一标识符和生命周期。
 * 实体的相等性基于其标识符，而不是属性值。
 *
 * 作为通用功能组件，提供业务模块所需的基础实体能力。
 *
 * ## 通用功能规则
 *
 * ### 标识符规则
 * - 每个实体必须具有唯一的标识符
 * - 标识符在实体生命周期内不可变更
 * - 标识符用于实体的相等性比较
 * - 标识符必须符合 EntityId 的格式要求
 *
 * ### 时间戳规则
 * - 创建时间在实体创建时设置，不可修改
 * - 更新时间在实体状态变更时自动更新
 * - 时间戳采用 UTC 时区，确保跨时区一致性
 * - 时间戳精度到毫秒级别
 *
 * ### 相等性规则
 * - 实体的相等性基于标识符比较，而非属性值
 * - 相同类型且相同标识符的实体被视为相等
 * - 不同类型但相同标识符的实体被视为不相等
 * - null 和 undefined 与任何实体都不相等
 *
 * ### 生命周期规则
 * - 实体创建后具有完整的生命周期管理
 * - 实体状态变更会触发相应的事件
 * - 实体支持序列化和反序列化操作
 * - 实体变更会记录操作时间和上下文
 *
 * @description 所有实体的基类，提供业务模块所需的基础实体功能
 * @example
 * ```typescript
 * class User extends BaseEntity {
 *   constructor(
 *     id: EntityId,
 *     tenantId: TenantId,
 *     private name: string,
 *     private email: string,
 *     organizationId?: OrganizationId,
 *     departmentId?: DepartmentId,
 *     isShared: boolean = false,
 *     sharingLevel?: SharingLevel,
 *     auditInfo?: Partial<AuditInfo>
 *   ) {
 *     super(id, tenantId, organizationId, departmentId, undefined, isShared, sharingLevel, auditInfo);
 *   }
 *
 *   getName(): string {
 *     return this.name;
 *   }
 *
 *   updateName(newName: string): void {
 *     this.name = newName;
 *     this.updateTimestamp(); // 自动更新修改时间
 *   }
 * }
 *
 * // 创建租户级私有用户实体
 * const privateUser = new User(
 *   UserId.generate(),
 *   TenantId.create('tenant-123'),
 *   '张三',
 *   'zhangsan@example.com'
 * );
 *
 * // 创建租户级共享用户实体
 * const sharedUser = new User(
 *   UserId.generate(),
 *   TenantId.create('tenant-123'),
 *   '李四',
 *   'lisi@example.com',
 *   undefined,
 *   undefined,
 *   true, // 标记为共享数据
 *   SharingLevel.TENANT // 租户级共享
 * );
 *
 * // 创建部门级用户实体
 * const departmentUser = new User(
 *   UserId.generate(),
 *   TenantId.create('tenant-123'),
 *   '王五',
 *   'wangwu@example.com',
 *   OrganizationId.create('org-456'),
 *   DepartmentId.create('dept-789')
 * );
 *
 * // 检查共享状态
 * console.log(privateUser.isSharedData()); // false
 * console.log(sharedUser.getSharingScopeDescription()); // "租户级共享，租户内所有组织、部门、用户可访问"
 *
 * // 更新用户信息
 * privateUser.updateName('张三更新');
 * ```
 *
 * @since 1.0.0
 */

import { EntityId } from "../value-objects/ids/entity-id.vo.js";
import { TenantId } from "../value-objects/ids/tenant-id.vo.js";
import { OrganizationId } from "../value-objects/ids/organization-id.vo.js";
import { DepartmentId } from "../value-objects/ids/department-id.vo.js";
import { UserId } from "../value-objects/ids/user-id.vo.js";
import { SharingLevel } from "../isolation/sharing-level.enum.js";
import {
  AuditInfo,
  IAuditInfo,
  IPartialAuditInfo,
} from "../value-objects/audit-info.vo.js";
import { IEntity } from "../interfaces/base-entity.interface.js";

/**
 * 基础实体类
 * @template TId - 实体标识符类型
 */
export abstract class BaseEntity<TId extends EntityId = EntityId>
  implements IEntity
{
  private readonly _id: TId;
  private _auditInfo: AuditInfo;

  // 多层级隔离字段
  private readonly _tenantId: TenantId;
  private readonly _organizationId?: OrganizationId;
  private readonly _departmentId?: DepartmentId;
  private readonly _userId?: UserId;

  // 数据共享字段
  private readonly _isShared: boolean;
  private readonly _sharingLevel?: SharingLevel;

  /**
   * 构造函数
   * @param id - 实体唯一标识符
   * @param tenantId - 租户ID（必填）
   * @param organizationId - 组织ID（可选）
   * @param departmentId - 部门ID（可选）
   * @param userId - 用户ID（可选）
   * @param isShared - 是否为共享数据（默认false）
   * @param sharingLevel - 共享级别（可选，仅在isShared为true时有效）
   * @param auditInfo - 审计信息，可以是完整的或部分的
   */
  protected constructor(
    id: TId,
    tenantId: TenantId,
    organizationId?: OrganizationId,
    departmentId?: DepartmentId,
    userId?: UserId,
    isShared: boolean = false,
    sharingLevel?: SharingLevel,
    auditInfo?: IPartialAuditInfo,
  ) {
    this._id = id;
    this._tenantId = tenantId;
    this._organizationId = organizationId;
    this._departmentId = departmentId;
    this._userId = userId;
    this._isShared = isShared;
    this._sharingLevel = sharingLevel;

    // 构建审计信息，包含隔离上下文
    const fullAuditInfo: IPartialAuditInfo = {
      ...auditInfo,
      tenantId: tenantId,
    };
    this._auditInfo = this.buildAuditInfo(fullAuditInfo);

    // 验证隔离字段的层级依赖关系
    this.validateIsolationHierarchy();

    // 验证共享字段的完整性
    this.validateSharingFields();
  }

  /**
   * 获取实体标识符
   */
  get id(): TId {
    return this._id;
  }

  /**
   * 获取审计信息
   */
  get auditInfo(): IAuditInfo {
    return this._auditInfo;
  }

  /**
   * 获取创建时间
   */
  get createdAt(): Date {
    return this._auditInfo.createdAt;
  }

  /**
   * 获取最后更新时间
   */
  get updatedAt(): Date {
    return this._auditInfo.updatedAt;
  }

  /**
   * 获取删除时间
   */
  get deletedAt(): Date | null {
    return this._auditInfo.deletedAt;
  }

  /**
   * 获取租户标识符
   */
  get tenantId(): EntityId {
    return this._tenantId;
  }

  /**
   * 获取组织标识符
   */
  get organizationId(): EntityId | undefined {
    return this._organizationId;
  }

  /**
   * 获取部门标识符
   */
  get departmentId(): EntityId | undefined {
    return this._departmentId;
  }

  /**
   * 获取用户标识符
   */
  get userId(): EntityId | undefined {
    return this._userId;
  }

  /**
   * 是否为共享数据
   */
  get isShared(): boolean {
    return this._isShared;
  }

  /**
   * 获取共享级别
   */
  get sharingLevel(): SharingLevel | undefined {
    return this._sharingLevel;
  }

  /**
   * 获取版本号
   */
  get version(): number {
    return this._auditInfo.version;
  }

  /**
   * 检查实体是否被删除
   */
  get isDeleted(): boolean {
    return this._auditInfo.deletedAt !== null;
  }

  /**
   * 获取创建者标识符
   */
  get createdBy(): string {
    return this._auditInfo.createdBy;
  }

  /**
   * 获取最后更新者标识符
   */
  get updatedBy(): string {
    return this._auditInfo.updatedBy;
  }

  /**
   * 获取删除者标识符
   */
  get deletedBy(): string | null {
    return this._auditInfo.deletedBy;
  }

  /**
   * 软删除实体
   *
   * @description 将实体标记为已删除，但不从存储中移除
   * 软删除会记录删除时间、删除者和删除原因
   *
   * @param deletedBy - 删除者标识符，可选，默认使用当前用户
   * @param deleteReason - 删除原因，可选
   *
   * @example
   * ```typescript
   * // 基本软删除
   * entity.markAsDeleted();
   *
   * // 带删除原因的软删除
   * entity.markAsDeleted('user-123', '用户主动删除');
   * ```
   */
  public markAsDeleted(deletedBy?: string, deleteReason?: string): void {
    if (this.isDeleted) {
      throw new Error("Cannot delete an entity that is already deleted");
    }

    const actualDeletedBy = deletedBy || this.getCurrentUserId();
    this._auditInfo = this._auditInfo.markAsDeleted(
      actualDeletedBy,
      deleteReason,
    );
  }

  /**
   * 恢复已删除的实体
   *
   * @description 将软删除的实体恢复为正常状态
   * 恢复会清除删除时间、删除者和删除原因
   *
   * @param restoredBy - 恢复者标识符，可选，默认使用当前用户
   *
   * @example
   * ```typescript
   * // 基本恢复
   * entity.restore();
   *
   * // 带恢复者的恢复
   * entity.restore('admin-123');
   * ```
   */
  public restore(restoredBy?: string): void {
    if (!this.isDeleted) {
      throw new Error("Cannot restore an entity that is not deleted");
    }

    const actualRestoredBy = restoredBy || this.getCurrentUserId();
    this._auditInfo = this._auditInfo.restore(actualRestoredBy);
  }

  /**
   * 检查两个实体是否相等
   *
   * 实体的相等性基于标识符比较，而不是属性值。
   *
   * @param other - 要比较的另一个实体
   * @returns 如果两个实体相等则返回 true，否则返回 false
   */
  public equals(other: IEntity | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (!(other instanceof this.constructor)) {
      return false;
    }

    return this._id.equals(other.id);
  }

  /**
   * 获取实体的哈希码
   *
   * 用于在 Map 或 Set 中使用实体作为键。
   *
   * @returns 哈希码字符串
   */
  public getHashCode(): string {
    return this._id.getHashCode();
  }

  /**
   * 将实体转换为字符串表示
   *
   * @returns 字符串表示
   */
  public toString(): string {
    return `${this.constructor.name}(${this._id.toString()})`;
  }

  /**
   * 将实体转换为 JSON 表示
   *
   * @returns JSON 表示
   */
  public toJSON(): Record<string, unknown> {
    return {
      id: this._id.toString(),
      type: this.constructor.name,
      auditInfo: this._auditInfo.toJSON(),
    };
  }

  /**
   * 获取实体的类型名称
   *
   * @returns 类型名称
   */
  public getTypeName(): string {
    return this.constructor.name;
  }

  /**
   * 比较两个实体的大小
   *
   * 基于标识符进行比较。
   *
   * @param other - 要比较的另一个实体
   * @returns 比较结果：-1 表示小于，0 表示等于，1 表示大于
   */
  public compareTo(other: IEntity | null | undefined): number {
    if (other === null || other === undefined) {
      return 1;
    }

    return this._id.compareTo(other.id);
  }

  /**
   * 获取实体的业务标识符
   *
   * @returns 业务标识符字符串
   */
  public getBusinessIdentifier(): string {
    return `${this.constructor.name}(${this._id.toString()})`;
  }

  /**
   * 转换为纯数据对象
   *
   * @returns 包含所有实体数据的纯对象
   */
  public toData(): Record<string, unknown> {
    return {
      id: this._id.toString(),
      type: this.constructor.name,
      createdAt: this._auditInfo.createdAt,
      updatedAt: this._auditInfo.updatedAt,
      version: this._auditInfo.version,
      tenantId: this._tenantId.toString(),
      organizationId: this._organizationId?.toString(),
      departmentId: this._departmentId?.toString(),
      userId: this._userId?.toString(),
      isShared: this._isShared,
      sharingLevel: this._sharingLevel,
      isDeleted: this._auditInfo.deletedAt !== null,
    };
  }

  /**
   * 检查实体是否为新创建的
   *
   * @returns 如果是新创建的返回true，否则返回false
   */
  public isNew(): boolean {
    // 如果版本为1且创建时间和更新时间相同，认为是新创建的
    return (
      this._auditInfo.version === 1 &&
      this._auditInfo.createdAt.getTime() ===
        this._auditInfo.updatedAt.getTime()
    );
  }

  /**
   * 获取实体版本
   *
   * @returns 实体版本号
   */
  public getVersion(): number {
    return this._auditInfo.version;
  }

  /**
   * 更新实体时间戳
   * @description 在实体状态变更时调用，更新更新时间戳和版本号
   *
   * @example
   * ```typescript
   * public activate(): void {
   *   this.status = UserStatus.Active;
   *   this.updateTimestamp(); // 更新时间戳
   * }
   * ```
   */
  protected updateTimestamp(): void {
    this._auditInfo = this._auditInfo.update({
      updatedBy: this.getCurrentUserId(),
      lastOperation: "UPDATE",
    });
  }

  /**
   * 构建完整的审计信息
   *
   * @param partialAuditInfo - 部分审计信息
   * @returns 完整的审计信息
   */
  private buildAuditInfo(partialAuditInfo: IPartialAuditInfo): AuditInfo {
    return AuditInfo.create(partialAuditInfo);
  }

  /**
   * 获取当前用户ID
   *
   * @description 获取当前操作用户的ID，用于审计追踪
   * @returns 当前用户ID，如果无法获取则返回 'system'
   */
  protected getCurrentUserId(): string {
    try {
      // 这里可以从上下文获取当前用户ID
      // 在实际应用中，可以通过依赖注入或上下文提供者获取
      return "system";
    } catch (_error) {
      return "system";
    }
  }

  /**
   * 验证实体的有效性
   *
   * 子类应该重写此方法以实现具体的验证逻辑。
   *
   * @protected
   */
  protected validate(): void {
    if (!this._id || this._id.isEmpty()) {
      throw new Error("Entity ID cannot be null or empty");
    }

    if (!this._tenantId || this._tenantId.isEmpty()) {
      throw new Error("Tenant ID cannot be null or empty");
    }
  }

  /**
   * 验证隔离字段的层级依赖关系
   *
   * @description 确保隔离字段的层级依赖关系正确：
   * - 组织级数据必须有租户
   * - 部门级数据必须有租户和组织
   * - 用户级数据可选租户
   *
   * @protected
   */
  protected validateIsolationHierarchy(): void {
    // 组织级数据必须有租户
    if (this._organizationId && (!this._tenantId || this._tenantId.isEmpty())) {
      throw new Error("Organization level data must have tenant ID");
    }

    // 部门级数据必须有租户和组织
    if (this._departmentId && (!this._tenantId || this._tenantId.isEmpty())) {
      throw new Error("Department level data must have tenant ID");
    }
    if (
      this._departmentId &&
      (!this._organizationId || this._organizationId.isEmpty())
    ) {
      throw new Error("Department level data must have organization ID");
    }

    // 用户级数据可选租户，但如果指定了租户，必须有效
    if (this._userId && this._tenantId && this._tenantId.isEmpty()) {
      throw new Error("User level data cannot have empty tenant ID");
    }
  }

  /**
   * 验证共享字段的完整性
   *
   * @description 确保共享字段的逻辑正确：
   * - 如果isShared为true，必须指定sharingLevel
   * - 如果isShared为false，sharingLevel应该为undefined
   * - 共享级别必须与实体的隔离级别兼容
   *
   * @protected
   */
  protected validateSharingFields(): void {
    // 如果标记为共享数据，必须指定共享级别
    if (this._isShared && !this._sharingLevel) {
      throw new Error("Shared data must specify sharing level");
    }

    // 如果不是共享数据，不应该有共享级别
    if (!this._isShared && this._sharingLevel) {
      throw new Error("Non-shared data should not have sharing level");
    }

    // 如果设置了共享级别，验证其与隔离级别的兼容性
    if (this._sharingLevel) {
      this.validateSharingLevelCompatibility();
    }
  }

  /**
   * 验证共享级别与隔离级别的兼容性
   *
   * @description 确保共享级别与实体的隔离级别兼容：
   * - 共享级别不能低于实体的隔离级别
   * - 例如：用户级数据不能设置为组织级共享
   *
   * @protected
   */
  protected validateSharingLevelCompatibility(): void {
    if (!this._sharingLevel) return;

    const entityLevel = this.getIsolationLevel();
    const sharingLevel = this._sharingLevel;

    // 定义级别优先级（数字越小优先级越高）
    const levelPriority = {
      platform: 0,
      tenant: 1,
      organization: 2,
      department: 3,
      user: 4,
    };

    const entityPriority =
      levelPriority[entityLevel as keyof typeof levelPriority];
    const sharingPriority =
      levelPriority[sharingLevel as keyof typeof levelPriority];

    // 共享级别不能低于实体的隔离级别
    if (sharingPriority < entityPriority) {
      throw new Error(
        `Sharing level '${sharingLevel}' is not compatible with entity level '${entityLevel}'. ` +
          `Sharing level cannot be lower than entity isolation level.`,
      );
    }
  }

  /**
   * 获取实体的隔离级别
   *
   * @description 根据隔离字段判断实体的隔离级别
   * @returns 隔离级别字符串
   */
  public getIsolationLevel(): string {
    if (this._userId) return "user";
    if (this._departmentId) return "department";
    if (this._organizationId) return "organization";
    if (this._tenantId) return "tenant";
    return "platform";
  }

  /**
   * 检查是否为特定隔离级别
   */
  public isTenantLevel(): boolean {
    return (
      this.getIsolationLevel() === "tenant" &&
      !this._organizationId &&
      !this._departmentId &&
      !this._userId
    );
  }

  public isOrganizationLevel(): boolean {
    return (
      this.getIsolationLevel() === "organization" &&
      !!this._organizationId &&
      !this._departmentId &&
      !this._userId
    );
  }

  public isDepartmentLevel(): boolean {
    return (
      this.getIsolationLevel() === "department" &&
      !!this._departmentId &&
      !this._userId
    );
  }

  public isUserLevel(): boolean {
    return this.getIsolationLevel() === "user" && !!this._userId;
  }

  public isPlatformLevel(): boolean {
    return this.getIsolationLevel() === "platform";
  }

  /**
   * 检查是否为共享数据
   */
  public isSharedData(): boolean {
    return this._isShared;
  }

  /**
   * 检查是否为非共享数据（私有数据）
   */
  public isPrivateData(): boolean {
    return !this._isShared;
  }

  /**
   * 检查是否可以与指定隔离上下文共享
   *
   * @param targetContext - 目标隔离上下文
   * @returns 是否可以共享
   */
  public canShareWith(_targetContext: unknown): boolean {
    if (!this._isShared || !this._sharingLevel) {
      return false;
    }

    // 这里可以根据具体的共享规则进行判断
    // 例如：检查目标上下文是否在共享级别范围内
    return true; // 简化实现，实际应该根据业务规则判断
  }

  /**
   * 获取共享数据的访问范围描述
   *
   * @returns 共享范围描述
   */
  public getSharingScopeDescription(): string {
    if (!this._isShared) {
      return "私有数据，仅限所有者访问";
    }

    const sharingLevel = this._sharingLevel;
    const descriptions = {
      platform: "平台级共享，所有租户可访问",
      tenant: "租户级共享，租户内所有组织、部门、用户可访问",
      organization: "组织级共享，组织内所有部门、用户可访问",
      department: "部门级共享，部门内所有用户可访问",
      user: "用户级共享，指定用户可访问",
    };

    return (
      descriptions[sharingLevel as keyof typeof descriptions] || "未知共享级别"
    );
  }
}
