import { BaseQuery } from "@hl8/application-kernel";

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
   * @param requestedBy - 请求者ID
   */
  constructor(
    public readonly params: ListTenantsQueryParams = {},
    public readonly requestedBy?: string,
  ) {
    super();
  }

  /**
   * 获取查询类型
   *
   * @returns 查询类型
   */
  getQueryType(): string {
    return "ListTenants";
  }

  /**
   * 获取查询数据
   *
   * @returns 查询数据
   */
  getQueryData(): Record<string, unknown> {
    return {
      params: this.params,
      requestedBy: this.requestedBy,
    };
  }

  /**
   * 验证查询
   *
   * @throws {Error} 当查询无效时抛出错误
   */
  validate(): void {
    if (this.params.page && this.params.page < 1) {
      throw new Error("页码必须大于0");
    }

    if (
      this.params.limit &&
      (this.params.limit < 1 || this.params.limit > 100)
    ) {
      throw new Error("每页数量必须在1-100之间");
    }

    if (
      this.params.sortOrder &&
      !["asc", "desc"].includes(this.params.sortOrder)
    ) {
      throw new Error("排序顺序必须是asc或desc");
    }
  }
}
