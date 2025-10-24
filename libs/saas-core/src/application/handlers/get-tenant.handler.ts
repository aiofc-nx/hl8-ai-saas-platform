import { QueryHandler } from "@hl8/application-kernel";
import { GetTenantQuery } from "../queries/get-tenant.query.js";
import { TenantAggregate } from "../../domain/aggregates/tenant.aggregate.js";

/**
 * 获取租户查询处理器
 *
 * @description 处理获取租户查询的业务逻辑
 * @since 1.0.0
 */
export class GetTenantHandler
  implements QueryHandler<GetTenantQuery, TenantAggregate | null>
{
  /**
   * 处理获取租户查询
   *
   * @param query - 获取租户查询
   * @returns 租户聚合根或null
   * @throws {Error} 当查询处理失败时抛出错误
   */
  async handle(query: GetTenantQuery): Promise<TenantAggregate | null> {
    // 验证查询
    query.validate();

    try {
      // 这里应该从仓储中获取租户
      // 目前返回null，实际实现中需要注入仓储依赖
      // TODO: 实现从仓储获取租户的逻辑
      return null;
    } catch (error) {
      throw new Error(
        `获取租户失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 获取处理器类型
   *
   * @returns 处理器类型
   */
  getHandlerType(): string {
    return "GetTenantHandler";
  }
}
