/**
 * 租户仓储接口
 * @description 定义租户聚合根的持久化契约
 *
 * @since 1.0.0
 */
import { TenantId } from "@hl8/domain-kernel";
import { Tenant } from "../aggregates/tenant.aggregate.js";
import { TenantStatus } from "../value-objects/tenant-status.vo.js";
import { TenantType } from "../value-objects/tenant-type.vo.js";

/**
 * 租户仓储接口
 */
export interface ITenantRepository {
  /**
   * 保存租户
   * @param tenant - 租户聚合根
   * @returns Promise<void>
   */
  save(tenant: Tenant): Promise<void>;

  /**
   * 根据ID查找租户
   * @param id - 租户ID
   * @returns 租户聚合根或null
   */
  findById(id: TenantId): Promise<Tenant | null>;

  /**
   * 根据代码查找租户
   * @param code - 租户代码
   * @returns 租户聚合根或null
   */
  findByCode(code: string): Promise<Tenant | null>;

  /**
   * 根据状态查找租户列表
   * @param status - 租户状态
   * @param offset - 偏移量
   * @param limit - 限制数量
   * @returns 租户列表和总数
   */
  findByStatus(
    status: TenantStatus,
    offset?: number,
    limit?: number,
  ): Promise<{ tenants: Tenant[]; total: number }>;

  /**
   * 根据类型查找租户列表
   * @param type - 租户类型
   * @param offset - 偏移量
   * @param limit - 限制数量
   * @returns 租户列表和总数
   */
  findByType(
    type: TenantType,
    offset?: number,
    limit?: number,
  ): Promise<{ tenants: Tenant[]; total: number }>;

  /**
   * 删除租户
   * @param id - 租户ID
   * @returns Promise<void>
   */
  delete(id: TenantId): Promise<void>;
}
