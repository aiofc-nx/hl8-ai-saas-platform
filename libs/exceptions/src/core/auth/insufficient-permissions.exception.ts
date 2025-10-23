import { AuthException } from "./auth.exception.js";

/**
 * 权限不足异常
 *
 * @description 当用户没有足够的权限执行操作时抛出此异常
 * 通常用于细粒度权限控制
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new InsufficientPermissionsException('您没有执行此操作的权限');
 *
 * // 带上下文数据
 * throw new InsufficientPermissionsException('您没有执行此操作的权限', {
 *   operation: 'delete-user',
 *   requiredPermission: 'admin',
 *   userPermission: 'user',
 *   userId: 'user-123'
 * });
 * ```
 */
export class InsufficientPermissionsException extends AuthException {
  /**
   * 创建权限不足异常
   *
   * @param reason - 权限不足的原因
   * @param data - 附加数据，可包含操作信息、权限要求等
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "AUTH_INSUFFICIENT_PERMISSIONS",
      "权限不足",
      reason,
      403,
      data,
      "https://docs.hl8.com/errors#AUTH_INSUFFICIENT_PERMISSIONS",
    );
  }
}
