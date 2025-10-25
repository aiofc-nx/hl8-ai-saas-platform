/**
 * 用户仓储接口
 *
 * @description 定义用户实体的持久化接口，遵循DDD仓储模式
 * @since 1.0.0
 */

import { User } from "../entities/user.entity.js";
import { UserId } from "../value-objects/user-id.vo.js";
import { IsolationContext } from "../value-objects/isolation-context.vo.js";

/**
 * 用户仓储接口
 *
 * 定义用户实体的持久化操作。
 */
export interface IUserRepository {
  /**
   * 根据ID查找用户
   */
  findById(id: UserId, context?: IsolationContext): Promise<User | null>;

  /**
   * 根据邮箱查找用户
   */
  findByEmail(email: string, context?: IsolationContext): Promise<User | null>;

  /**
   * 检查用户邮箱是否存在
   */
  existsByEmail(
    email: string,
    excludeId?: UserId,
    context?: IsolationContext,
  ): Promise<boolean>;

  /**
   * 查找所有用户
   */
  findAll(context?: IsolationContext): Promise<User[]>;

  /**
   * 保存用户
   */
  save(user: User, context?: IsolationContext): Promise<void>;

  /**
   * 删除用户
   */
  delete(id: UserId, context?: IsolationContext): Promise<void>;
}
