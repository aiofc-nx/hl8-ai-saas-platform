import { AuthException } from "./auth.exception.js";

/**
 * 未授权异常
 *
 * @description 当用户没有权限访问资源时抛出此异常
 * 通常用于权限验证失败的情况
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new UnauthorizedException('您没有权限访问此资源');
 *
 * // 带上下文数据
 * throw new UnauthorizedException('您没有权限访问此资源', {
 *   resource: 'user-profile',
 *   requiredPermission: 'read',
 *   userId: 'user-123'
 * });
 * ```
 */
export class UnauthorizedException extends AuthException {
  /**
   * 创建未授权异常
   *
   * @param reason - 未授权的原因
   * @param data - 附加数据，可包含资源信息、权限要求等
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "AUTH_UNAUTHORIZED",
      "未授权访问",
      reason,
      403,
      data,
      "https://docs.hl8.com/errors#AUTH_UNAUTHORIZED",
    );
  }
}
