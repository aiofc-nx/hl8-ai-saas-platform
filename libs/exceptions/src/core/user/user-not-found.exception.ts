import { UserException } from "./user.exception.js";

/**
 * 用户未找到异常
 *
 * @description 当指定的用户不存在时抛出此异常
 * 通常用于用户查询、更新、删除等操作
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new UserNotFoundException('user-123');
 *
 * // 带上下文数据
 * throw new UserNotFoundException('user-123', {
 *   searchField: 'id',
 *   requestId: 'req-456',
 *   timestamp: new Date().toISOString()
 * });
 * ```
 */
export class UserNotFoundException extends UserException {
  /**
   * 创建用户未找到异常
   *
   * @param userId - 用户ID
   * @param data - 附加数据，可包含搜索字段、请求ID等信息
   */
  constructor(userId: string, data?: Record<string, unknown>) {
    super(
      "USER_NOT_FOUND",
      "用户未找到",
      `ID 为 "${userId}" 的用户不存在`,
      404,
      { userId, ...data },
      "https://docs.hl8.com/errors#USER_NOT_FOUND",
    );
  }
}
