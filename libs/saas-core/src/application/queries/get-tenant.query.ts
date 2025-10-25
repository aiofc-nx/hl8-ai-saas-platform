import { BaseQuery } from "@hl8/application-kernel";
import { IsolationContext } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel"";

/**
 * 获取租户查询
 *
 * @description 用于获取单个租户信息的查询对象
 * @since 1.0.0
 */
export class GetTenantQuery extends BaseQuery {
  /**
   * 创建获取租户查询
   *
   * @param tenantId - 租户ID
   * @param requestedBy - 请求者ID（可选）
   * @param isolationContext - 隔离上下文（可选）
   */
  constructor(
    public readonly tenantId: TenantId,
    public readonly requestedBy?: string,
    isolationContext?: IsolationContext,
  ) {
    super("GetTenantQuery", "获取租户查询", isolationContext);
  }
}
