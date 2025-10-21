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
 *     private name: string,
 *     private email: string,
 *     auditInfo: Partial<AuditInfo>
 *   ) {
 *     super(id, auditInfo);
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
 * // 创建用户实体
 * const user = new User(
 *   TenantId.generate(),
 *   '张三',
 *   'zhangsan@example.com',
 *   { createdBy: 'system', tenantId: TenantId.create('tenant-123') }
 * );
 *
 * // 更新用户信息
 * user.updateName('李四');
 * ```
 *
 * @since 1.0.0
 */

import { EntityId } from "../value-objects/ids/entity-id.vo.js";
import {
  AuditInfo,
  IAuditInfo,
  IPartialAuditInfo,
} from "../value-objects/audit-info.vo.js";
import { IEntity } from "../interfaces/entity.interface.js";

/**
 * 基础实体类
 * @template TId - 实体标识符类型
 */
export abstract class BaseEntity<TId extends EntityId = EntityId>
  implements IEntity
{
  private readonly _id: TId;
  private _auditInfo: AuditInfo;

  /**
   * 构造函数
   * @param id - 实体唯一标识符
   * @param auditInfo - 审计信息，可以是完整的或部分的
   */
  protected constructor(id: TId, auditInfo: IPartialAuditInfo) {
    this._id = id;
    this._auditInfo = this.buildAuditInfo(auditInfo);
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
    return this._auditInfo.tenantId;
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
      tenantId: this._auditInfo.tenantId.toString(),
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

    if (!this._auditInfo.tenantId || this._auditInfo.tenantId.isEmpty()) {
      throw new Error("Tenant ID cannot be null or empty");
    }
  }
}
