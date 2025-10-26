import { BaseSpecification } from "@hl8/domain-kernel";
import { Tenant } from "../aggregates/tenant.aggregate.js";

/**
 * 租户活跃状态规格
 * @description 检查租户是否处于活跃状态
 */
export class TenantActiveSpecification extends BaseSpecification<Tenant> {
  /**
   * 检查租户是否满足活跃状态
   * @param candidate - 候选租户
   * @returns 是否满足规格
   */
  isSatisfiedBy(candidate: Tenant): boolean {
    return candidate.isActive() && !candidate.isDeletedTenant();
  }

  /**
   * 获取规格描述
   * @returns 规格描述
   */
  getDescription(): string {
    return "检查租户是否处于活跃状态（启用且非删除、非暂停）";
  }
}
