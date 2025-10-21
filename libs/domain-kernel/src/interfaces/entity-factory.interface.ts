/**
 * 实体工厂接口
 *
 * @description 定义创建实体的工厂方法，遵循工厂模式
 *
 * ## 设计原则
 *
 * ### 工厂模式
 * - 封装实体创建逻辑
 * - 提供统一的创建接口
 * - 支持复杂的实体构建过程
 * - 隐藏实体实现的复杂性
 *
 * ### 生命周期管理
 * - 新实体创建（create）
 * - 持久化数据重建（reconstitute）
 * - 支持不同的创建策略
 * - 确保实体的完整性
 *
 * @example
 * ```typescript
 * export class UserFactory implements IEntityFactory<User> {
 *   create(data: { name: string; email: string; tenantId: TenantId }): User {
 *     const userId = UserId.generate();
 *     const auditInfo = AuditInfo.create({
 *       createdBy: 'system',
 *       tenantId: data.tenantId
 *     });
 *
 *     return new User(userId, data.name, data.email, auditInfo);
 *   }
 *
 *   reconstitute(data: Record<string, unknown>): User {
 *     const userId = UserId.create(data.id as string);
 *     const auditInfo = AuditInfo.fromJSON(data.auditInfo as Record<string, unknown>);
 *
 *     return new User(userId, data.name as string, data.email as string, auditInfo);
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import { IEntity } from "./base-entity.interface.js";

/**
 * 实体工厂接口
 *
 * 定义创建实体的工厂方法
 */
export interface IEntityFactory<T extends IEntity> {
  /**
   * 创建新的实体实例
   *
   * @description 根据业务数据创建全新的实体实例
   * 适用于用户操作、业务流程触发等场景
   *
   * @param data - 创建实体所需的数据
   * @returns 新创建的实体实例
   *
   * @example
   * ```typescript
   * const user = factory.create({
   *   name: '张三',
   *   email: 'zhangsan@example.com',
   *   tenantId: TenantId.create('tenant-123')
   * });
   * ```
   */
  create(data: Record<string, unknown>): T;

  /**
   * 从持久化数据重建实体
   *
   * @description 从数据库或其他持久化存储重建实体实例
   * 适用于数据加载、缓存恢复等场景
   *
   * @param data - 持久化的数据
   * @returns 重建的实体实例
   *
   * @example
   * ```typescript
   * const user = factory.reconstitute({
   *   id: 'user-123',
   *   name: '张三',
   *   email: 'zhangsan@example.com',
   *   auditInfo: { ... },
   *   createdAt: '2024-01-01T00:00:00Z',
   *   updatedAt: '2024-01-01T00:00:00Z'
   * });
   * ```
   */
  reconstitute(data: Record<string, unknown>): T;
}
