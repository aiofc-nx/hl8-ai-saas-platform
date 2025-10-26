import { BaseSpecification } from "@hl8/domain-kernel";
import { Tenant } from "../aggregates/tenant.aggregate.js";
import { getResourceLimits } from "../value-objects/tenant-type.vo.js";

/**
 * 租户资源限制上下文
 */
export interface TenantResourceLimitContext {
  tenant: Tenant;
  requestedResource: {
    organizationCount?: number;
    departmentCount?: number;
    userCount?: number;
  };
  currentCounts?: {
    organizationCount: number;
    departmentCount: number;
    userCount: number;
  };
}

/**
 * 租户资源限制规格
 * @description 检查租户是否满足资源使用限制
 */
export class TenantResourceLimitSpecification extends BaseSpecification<TenantResourceLimitContext> {
  /**
   * 检查租户是否满足资源限制
   * @param candidate - 候选对象（包含租户和请求的资源）
   * @returns 是否满足规格
   */
  isSatisfiedBy(candidate: TenantResourceLimitContext): boolean {
    const { tenant, requestedResource, currentCounts = { organizationCount: 0, departmentCount: 0, userCount: 0 } } = candidate;
    const limits = getResourceLimits(tenant.getType());

    // 检查组织数量限制
    if (
      requestedResource.organizationCount !== undefined &&
      limits.maxOrganizations > 0
    ) {
      if (currentCounts.organizationCount + requestedResource.organizationCount > limits.maxOrganizations) {
        return false;
      }
    }

    // 检查部门数量限制
    if (
      requestedResource.departmentCount !== undefined &&
      limits.maxDepartments > 0
    ) {
      if (currentCounts.departmentCount + requestedResource.departmentCount > limits.maxDepartments) {
        return false;
      }
    }

    // 检查用户数量限制
    if (
      requestedResource.userCount !== undefined &&
      limits.maxUsers > 0
    ) {
      if (currentCounts.userCount + requestedResource.userCount > limits.maxUsers) {
        return false;
      }
    }

    return true;
  }

  /**
   * 获取规格描述
   * @returns 规格描述
   */
  getDescription(): string {
    return "检查租户是否满足资源使用限制（组织、部门、用户数量）";
  }
}
