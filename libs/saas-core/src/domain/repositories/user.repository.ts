/**
 * 用户仓储接口
 * @description 定义用户聚合根的持久化契约
 *
 * @remarks
 * 仓储接口属于领域层，定义业务操作契约
 * 具体实现在基础设施层实现
 *
 * @since 1.0.0
 */
import { UserId, GenericEntityId } from "@hl8/domain-kernel";
import { User } from "../aggregates/user.aggregate.js";
import { UserSource } from "../value-objects/user-source.vo.js";
import { UserStatus } from "../value-objects/user-status.vo.js";

/**
 * 用户仓储接口
 */
export interface IUserRepository {
  /**
   * 保存用户
   * @description 创建或更新用户聚合根
   * @param user - 用户聚合根
   * @returns Promise<void>
   */
  save(user: User): Promise<void>;

  /**
   * 根据ID查找用户
   * @description 通过用户ID查找用户聚合根
   * @param id - 用户ID
   * @returns 用户聚合根或null
   */
  findById(id: UserId): Promise<User | null>;

  /**
   * 根据邮箱和租户查找用户
   * @description 通过邮箱和租户ID查找用户
   * @param email - 用户邮箱
   * @param tenantId - 租户ID
   * @returns 用户聚合根或null
   */
  findByEmailAndTenant(
    email: string,
    tenantId: GenericEntityId,
  ): Promise<User | null>;

  /**
   * 根据用户名和租户查找用户
   * @description 通过用户名和租户ID查找用户
   * @param username - 用户名
   * @param tenantId - 租户ID
   * @returns 用户聚合根或null
   */
  findByUsernameAndTenant(
    username: string,
    tenantId: GenericEntityId,
  ): Promise<User | null>;

  /**
   * 根据状态查找用户列表
   * @description 查找指定租户下指定状态的用户
   * @param tenantId - 租户ID
   * @param status - 用户状态
   * @param offset - 偏移量
   * @param limit - 限制数量
   * @returns 用户列表和总数
   */
  findByStatus(
    tenantId: GenericEntityId,
    status: UserStatus,
    offset?: number,
    limit?: number,
  ): Promise<{ users: User[]; total: number }>;

  /**
   * 根据来源查找用户列表
   * @description 查找指定租户下指定来源的用户
   * @param tenantId - 租户ID
   * @param source - 用户来源
   * @param offset - 偏移量
   * @param limit - 限制数量
   * @returns 用户列表和总数
   */
  findBySource(
    tenantId: GenericEntityId,
    source: UserSource,
    offset?: number,
    limit?: number,
  ): Promise<{ users: User[]; total: number }>;

  /**
   * 删除用户
   * @description 软删除用户（标记为已删除）
   * @param id - 用户ID
   * @returns Promise<void>
   */
  delete(id: UserId): Promise<void>;

  /**
   * 检查用户是否存在
   * @description 检查指定邮箱或用户名是否已存在
   * @param email - 邮箱
   * @param username - 用户名
   * @param tenantId - 租户ID
   * @returns 是否存在
   */
  exists(
    email: string,
    username: string,
    tenantId: GenericEntityId,
  ): Promise<boolean>;
}
