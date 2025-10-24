import { BaseQuery } from "@hl8/application-kernel";
import { TenantId } from "../../domain/value-objects/tenant-id.vo.js";

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
   * @param requestedBy - 请求者ID
   */
  constructor(
    public readonly tenantId: TenantId,
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
    return "GetTenant";
  }

  /**
   * 获取查询数据
   *
   * @returns 查询数据
   */
  getQueryData(): Record<string, unknown> {
    return {
      tenantId: this.tenantId.getValue(),
      requestedBy: this.requestedBy,
    };
  }

  /**
   * 验证查询
   *
   * @throws {Error} 当查询无效时抛出错误
   */
  validate(): void {
    if (!this.tenantId) {
      throw new Error("租户ID不能为空");
    }
  }
}
