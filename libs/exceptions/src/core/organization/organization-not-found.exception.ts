import { OrganizationException } from "./organization.exception.js";

/**
 * 组织未找到异常
 *
 * @description 当指定的组织不存在时抛出此异常
 * 通常用于组织查询、更新、删除等操作
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new OrganizationNotFoundException('org-123');
 *
 * // 带上下文数据
 * throw new OrganizationNotFoundException('org-123', {
 *   searchField: 'id',
 *   requestId: 'req-456'
 * });
 * ```
 */
export class OrganizationNotFoundException extends OrganizationException {
  /**
   * 创建组织未找到异常
   *
   * @param organizationId - 组织ID
   * @param data - 附加数据，可包含搜索字段、请求ID等信息
   */
  constructor(organizationId: string, data?: Record<string, unknown>) {
    super(
      "ORGANIZATION_NOT_FOUND",
      "组织未找到",
      `ID 为 "${organizationId}" 的组织不存在`,
      404,
      { organizationId, ...data },
      "https://docs.hl8.com/errors#ORGANIZATION_NOT_FOUND",
    );
  }
}
