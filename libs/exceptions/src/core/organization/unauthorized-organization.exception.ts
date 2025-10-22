import { OrganizationException } from "./organization.exception.js";

/**
 * 未授权组织访问异常
 *
 * @description 当用户没有权限访问组织时抛出此异常
 * 通常用于组织权限验证、跨组织访问控制等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new UnauthorizedOrganizationException('user-123', 'org-456');
 *
 * // 带上下文数据
 * throw new UnauthorizedOrganizationException('user-123', 'org-456', {
 *   operation: 'read',
 *   requiredRole: 'admin',
 *   userRole: 'member'
 * });
 * ```
 */
export class UnauthorizedOrganizationException extends OrganizationException {
  /**
   * 创建未授权组织访问异常
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param data - 附加数据，可包含操作信息、角色信息等
   */
  constructor(
    userId: string,
    organizationId: string,
    data?: Record<string, unknown>,
  ) {
    super(
      "ORGANIZATION_UNAUTHORIZED",
      "未授权组织访问",
      `用户 "${userId}" 没有权限访问组织 "${organizationId}"`,
      403,
      { userId, organizationId, ...data },
      "https://docs.hl8.com/errors#ORGANIZATION_UNAUTHORIZED",
    );
  }
}
