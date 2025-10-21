/**
 * 实体接口
 *
 * 定义实体的基础契约，实体是DDD中具有唯一标识的业务对象。
 * 实体的相等性基于其标识符，而不是属性值。
 *
 * @description 实体接口定义了所有实体必须实现的基础能力
 *
 * ## 业务规则
 *
 * ### 实体标识规则
 * - 每个实体必须有唯一的标识符
 * - 标识符在实体生命周期内不可变更
 * - 标识符用于实体的相等性比较
 * - 标识符必须符合EntityId的格式要求
 *
 * ### 实体生命周期规则
 * - 实体创建时设置创建时间，不可修改
 * - 实体状态变更时自动更新修改时间
 * - 实体支持审计信息的记录和查询
 * - 实体变更会记录操作时间和上下文
 *
 * ### 实体相等性规则
 * - 实体的相等性基于标识符比较，而非属性值
 * - 相同类型且相同标识符的实体被视为相等
 * - 不同类型但相同标识符的实体被视为不相等
 * - null和undefined与任何实体都不相等
 *
 * ### 实体状态规则
 * - 实体状态变更必须通过业务方法进行
 * - 实体状态变更应该验证业务规则
 * - 实体状态变更会触发相应的事件
 * - 实体状态应该保持一致性
 *
 * @example
 * ```typescript
 * export class User extends BaseEntity implements IEntity {
 *   constructor(
 *     id: EntityId,
 *     private name: string,
 *     private email: string
 *   ) {
 *     super(id);
 *   }
 *
 *   getName(): string {
 *     return this.name;
 *   }
 *
 *   updateName(newName: string): void {
 *     if (this.name !== newName) {
 *       this.name = newName;
 *       this.updateTimestamp();
 *     }
 *   }
 *
 *   equals(other: IEntity): boolean {
 *     return this.id.equals(other.id) && other instanceof User;
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import { EntityId } from "../value-objects/ids/entity-id.vo.js";
import { IAuditInfo } from "../value-objects/audit-info.vo.js";

/**
 * 最基础的空接口，提供最小的类型约束，用于泛型约束
 *
 * @description 所有的实体都必须实现这个空接口，用于泛型约束，避免使用any
 */
export interface IBaseEntity {
  // 标记接口，用于类型约束
  readonly _marker?: never;
}

/**
 * 实体接口
 *
 * 定义实体必须实现的基础能力
 */
export interface IEntity extends IBaseEntity {
  /**
   * 实体标识符
   *
   * @description 实体的唯一标识符，用于：
   * - 实体的唯一标识和区分
   * - 实体相等性比较
   * - 数据库主键映射
   * - 事件关联和追踪
   *
   * @readonly
   */
  readonly id: EntityId;

  /**
   * 创建时间
   *
   * @description 实体创建的时间戳，用于：
   * - 审计追踪
   * - 数据分析
   * - 业务逻辑判断
   * - 时间范围查询
   *
   * @readonly
   */
  readonly createdAt: Date;

  /**
   * 更新时间
   *
   * @description 实体最后更新的时间戳，用于：
   * - 变更追踪
   * - 并发控制
   * - 缓存失效
   * - 同步判断
   *
   * @readonly
   */
  readonly updatedAt: Date;

  /**
   * 版本号
   *
   * @description 实体版本号，用于：
   * - 乐观锁控制
   * - 并发冲突检测
   * - 变更追踪
   * - 数据一致性保证
   *
   * @readonly
   */
  readonly version: number;

  /**
   * 租户标识符
   *
   * @description 实体所属租户标识符，用于：
   * - 多租户数据隔离
   * - 权限控制
   * - 数据安全
   * - 业务逻辑分离
   *
   * @readonly
   */
  readonly tenantId: EntityId;

  /**
   * 是否已删除
   *
   * @description 实体是否已被软删除，用于：
   * - 软删除状态检查
   * - 数据恢复
   * - 审计追踪
   * - 业务逻辑判断
   *
   * @readonly
   */
  readonly isDeleted: boolean;

  /**
   * 审计信息
   *
   * @description 实体的完整审计信息，用于：
   * - 操作追踪
   * - 合规审计
   * - 安全分析
   * - 数据治理
   *
   * @readonly
   */
  readonly auditInfo: IAuditInfo;

  /**
   * 实体相等性比较
   *
   * @description 比较两个实体是否相等，基于标识符和类型
   *
   * @param other - 要比较的实体
   * @returns 如果相等返回true，否则返回false
   *
   * @example
   * ```typescript
   * const user1 = new User(TenantId.create('user-123'), '张三', 'zhangsan@example.com');
   * const user2 = new User(TenantId.create('user-123'), '李四', 'lisi@example.com');
   *
   * console.log(user1.equals(user2)); // true - 相同ID，相同类型
   * ```
   */
  equals(other: IEntity | null | undefined): boolean;

  /**
   * 获取实体的业务标识符
   *
   * @description 返回用于业务逻辑的标识符，通常用于日志和调试
   * @returns 业务标识符字符串
   *
   * @example
   * ```typescript
   * getBusinessIdentifier(): string {
   *   return `User(${this.id.value}, ${this.name})`;
   * }
   * ```
   */
  getBusinessIdentifier(): string;

  /**
   * 转换为纯数据对象
   *
   * @description 将实体转换为纯数据对象，用于序列化和传输
   * @returns 包含所有实体数据的纯对象
   *
   * @example
   * ```typescript
   * toData(): Record<string, unknown> {
   *   return {
   *     id: this.id.value,
   *     name: this.name,
   *     email: this.email,
   *     createdAt: this.createdAt,
   *     updatedAt: this.updatedAt
   *   };
   * }
   * ```
   */
  toData(): Record<string, unknown>;

  /**
   * 检查实体是否为新创建的
   *
   * @description 检查实体是否是新创建的（尚未持久化）
   * 这个信息对于仓储模式的实现很重要
   *
   * @returns 如果是新创建的返回true，否则返回false
   *
   * @example
   * ```typescript
   * if (entity.isNew()) {
   *   await repository.save(entity);
   * } else {
   *   await repository.update(entity);
   * }
   * ```
   */
  isNew(): boolean;

  /**
   * 获取实体版本
   *
   * @description 返回实体的版本号，用于乐观锁控制
   * 版本号在每次实体状态变更时递增
   *
   * @returns 实体版本号
   *
   * @example
   * ```typescript
   * const version = entity.getVersion();
   * console.log(`当前实体版本: ${version}`);
   * ```
   */
  getVersion(): number;

  /**
   * 获取实体的哈希码
   *
   * @description 返回实体的哈希码，用于在集合中使用实体作为键
   * @returns 哈希码字符串
   */
  getHashCode(): string;

  /**
   * 比较两个实体的大小
   *
   * @description 基于标识符进行比较，用于排序
   * @param other - 要比较的另一个实体
   * @returns 比较结果：-1 表示小于，0 表示等于，1 表示大于
   */
  compareTo(other: IEntity | null | undefined): number;

  /**
   * 获取实体的类型名称
   *
   * @description 返回实体的类型名称，用于序列化和调试
   * @returns 类型名称
   */
  getTypeName(): string;

  /**
   * 将实体转换为字符串表示
   *
   * @description 返回实体的字符串表示，用于日志和调试
   * @returns 字符串表示
   */
  toString(): string;

  /**
   * 将实体转换为 JSON 表示
   *
   * @description 返回实体的 JSON 表示，用于序列化
   * @returns JSON 表示
   */
  toJSON(): Record<string, unknown>;
}

/**
 * 实体工厂接口
 *
 * 定义创建实体的工厂方法
 */
export interface IEntityFactory<T extends IEntity> {
  /**
   * 创建新的实体实例
   *
   * @param data - 创建实体所需的数据
   * @returns 新创建的实体实例
   */
  create(data: Record<string, unknown>): T;

  /**
   * 从持久化数据重建实体
   *
   * @param data - 持久化的数据
   * @returns 重建的实体实例
   */
  reconstitute(data: Record<string, unknown>): T;
}

/**
 * 实体规格接口
 *
 * 定义实体验证规格
 */
export interface IEntitySpecification<T extends IEntity> {
  /**
   * 检查实体是否满足规格
   *
   * @param entity - 要检查的实体
   * @returns 如果满足返回true，否则返回false
   */
  isSatisfiedBy(entity: T): boolean;

  /**
   * 获取规格描述
   *
   * @returns 规格描述
   */
  getDescription(): string;
}

/**
 * 实体验证器接口
 *
 * 定义实体验证器的契约
 */
export interface IEntityValidator<T extends IEntity> {
  /**
   * 验证实体
   *
   * @param entity - 要验证的实体
   * @returns 验证结果
   */
  validate(entity: T): Promise<IEntityValidationResult>;

  /**
   * 获取验证器名称
   *
   * @returns 验证器名称
   */
  getValidatorName(): string;
}

/**
 * 实体验证结果接口
 */
export interface IEntityValidationResult {
  /**
   * 验证是否通过
   */
  readonly isValid: boolean;

  /**
   * 验证错误列表
   */
  readonly errors: Array<{
    readonly field: string;
    readonly message: string;
    readonly code: string;
  }>;

  /**
   * 验证警告列表
   */
  readonly warnings: Array<{
    readonly field: string;
    readonly message: string;
    readonly code: string;
  }>;
}

/**
 * 实体审计信息接口
 */
export interface IEntityAuditInfo {
  /**
   * 创建者
   */
  readonly createdBy?: string;

  /**
   * 创建时间
   */
  readonly createdAt: Date;

  /**
   * 最后修改者
   */
  readonly updatedBy?: string;

  /**
   * 最后修改时间
   */
  readonly updatedAt: Date;

  /**
   * 版本号
   */
  readonly version: number;

  /**
   * 是否已删除
   */
  readonly isDeleted?: boolean;

  /**
   * 删除时间
   */
  readonly deletedAt?: Date;

  /**
   * 删除者
   */
  readonly deletedBy?: string;
}
