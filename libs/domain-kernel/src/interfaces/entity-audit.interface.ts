/**
 * 实体审计信息接口
 *
 * @description 定义实体审计信息的契约，用于跟踪实体的生命周期和变更历史
 *
 * ## 设计原则
 *
 * ### 审计追踪
 * - 记录实体的创建、修改、删除操作
 * - 追踪操作用户和时间
 * - 支持完整的审计日志
 * - 满足合规性要求
 *
 * ### 生命周期管理
 * - 跟踪实体的完整生命周期
 * - 记录关键操作的时间点
 * - 支持软删除和恢复操作
 * - 维护数据变更历史
 *
 * @example
 * ```typescript
 * export class UserAuditInfo implements IEntityAuditInfo {
 *   constructor(
 *     public readonly createdBy: string,
 *     public readonly createdAt: Date,
 *     public readonly updatedBy?: string,
 *     public readonly updatedAt?: Date,
 *     public readonly version: number = 1,
 *     public readonly isDeleted?: boolean,
 *     public readonly deletedAt?: Date,
 *     public readonly deletedBy?: string
 *   ) {}
 *
 *   static create(createdBy: string): UserAuditInfo {
 *     const now = new Date();
 *     return new UserAuditInfo(createdBy, now, createdBy, now);
 *   }
 *
 *   update(updatedBy: string): UserAuditInfo {
 *     const now = new Date();
 *     return new UserAuditInfo(
 *       this.createdBy,
 *       this.createdAt,
 *       updatedBy,
 *       now,
 *       this.version + 1,
 *       this.isDeleted,
 *       this.deletedAt,
 *       this.deletedBy
 *     );
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

/**
 * 实体审计信息接口
 */
export interface IEntityAuditInfo {
  /**
   * 创建者
   *
   * @description 记录创建实体的用户或系统标识符
   */
  readonly createdBy?: string;

  /**
   * 创建时间
   *
   * @description 记录实体创建的时间戳，使用UTC时区
   */
  readonly createdAt: Date;

  /**
   * 最后修改者
   *
   * @description 记录最后修改实体的用户或系统标识符
   */
  readonly updatedBy?: string;

  /**
   * 最后修改时间
   *
   * @description 记录实体最后修改的时间戳，使用UTC时区
   */
  readonly updatedAt: Date;

  /**
   * 版本号
   *
   * @description 记录实体的版本号，用于乐观锁控制和变更追踪
   * 每次实体修改时版本号递增
   */
  readonly version: number;

  /**
   * 是否已删除
   *
   * @description 指示实体是否已被软删除
   */
  readonly isDeleted?: boolean;

  /**
   * 删除时间
   *
   * @description 记录实体被删除的时间戳，使用UTC时区
   */
  readonly deletedAt?: Date;

  /**
   * 删除者
   *
   * @description 记录删除实体的用户或系统标识符
   */
  readonly deletedBy?: string;
}
