import { BaseQuery } from "@hl8/application-kernel";
import { IsolationContext } from "@hl8/domain-kernel";
import { UserId } from "@hl8/domain-kernel"";

/**
 * 权限检查查询参数
 *
 * @description 权限检查查询的参数配置
 * @since 1.0.0
 */
export interface CheckPermissionQueryParams {
  subject: string;
  action: string;
  resource?: string;
  conditions?: Record<string, unknown>;
}

/**
 * 权限检查查询
 *
 * @description 用于检查用户权限的查询对象
 * @since 1.0.0
 */
export class CheckPermissionQuery extends BaseQuery {
  /**
   * 创建权限检查查询
   *
   * @param userId - 用户ID
   * @param params - 查询参数
   * @param context - 隔离上下文
   * @param requestedBy - 请求者ID（可选）
   */
  constructor(
    public readonly userId: UserId,
    public readonly params: CheckPermissionQueryParams,
    public readonly context: IsolationContext,
    public readonly requestedBy?: string,
  ) {
    super("CheckPermissionQuery", "权限检查查询", context);
  }
}
