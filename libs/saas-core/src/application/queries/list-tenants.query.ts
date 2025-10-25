import { BaseQuery } from "@hl8/application-kernel";
import { IsolationContext } from "@hl8/domain-kernel";

/**
 * 租户列表查询参数
 *
 * @description 租户列表查询的参数配置
 * @since 1.0.0
 */
export interface ListTenantsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: {
    type?: string;
    status?: string;
    search?: string;
  };
}

/**
 * 列表租户查询
 *
 * @description 用于获取租户列表的查询对象
 * @since 1.0.0
 */
export class ListTenantsQuery extends BaseQuery {
  /**
   * 创建列表租户查询
   *
   * @param params - 查询参数
   * @param requestedBy - 请求者ID（可选）
   * @param isolationContext - 隔离上下文（可选）
   */
  constructor(
    public readonly params: ListTenantsQueryParams = {},
    public readonly requestedBy?: string,
    isolationContext?: IsolationContext,
  ) {
    super("ListTenantsQuery", "列表租户查询", isolationContext);
  }
}
