import { QueryHandler } from "@hl8/application-kernel";
import { ListTenantsQuery } from "../queries/list-tenants.query.js";
import { TenantAggregate } from "../../domain/aggregates/tenant.aggregate.js";

/**
 * 租户列表查询结果
 *
 * @description 租户列表查询的结果对象
 * @since 1.0.0
 */
export interface ListTenantsResult {
  tenants: TenantAggregate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 列表租户查询处理器
 *
 * @description 处理列表租户查询的业务逻辑
 * @since 1.0.0
 */
export class ListTenantsHandler
  implements QueryHandler<ListTenantsQuery, ListTenantsResult>
{
  /**
   * 处理列表租户查询
   *
   * @param query - 列表租户查询
   * @returns 租户列表查询结果
   * @throws {Error} 当查询处理失败时抛出错误
   */
  async handle(query: ListTenantsQuery): Promise<ListTenantsResult> {
    // 验证查询
    query.validate();

    try {
      // 设置默认参数
      const page = query.params.page || 1;
      const limit = query.params.limit || 10;

      // 这里应该从仓储中获取租户列表
      // 目前返回空结果，实际实现中需要注入仓储依赖
      // TODO: 实现从仓储获取租户列表的逻辑
      const result: ListTenantsResult = {
        tenants: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };

      return result;
    } catch (error) {
      throw new Error(
        `获取租户列表失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 获取处理器类型
   *
   * @returns 处理器类型
   */
  getHandlerType(): string {
    return "ListTenantsHandler";
  }
}
