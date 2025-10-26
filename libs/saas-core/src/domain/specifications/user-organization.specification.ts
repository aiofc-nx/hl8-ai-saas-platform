import { BaseSpecification } from "@hl8/domain-kernel";
import { User } from "../aggregates/user.aggregate.js";
import { OrganizationId } from "@hl8/domain-kernel";

/**
 * 用户组织归属上下文
 */
export interface UserOrganizationContext {
  user: User;
  organizationId: OrganizationId;
}

/**
 * 用户组织归属规格
 * @description 检查用户是否属于指定的组织
 */
export class UserOrganizationSpecification extends BaseSpecification<UserOrganizationContext> {
  /**
   * 检查用户是否属于指定的组织
   * @param candidate - 候选对象（包含用户和组织ID）
   * @returns 是否满足规格
   */
  isSatisfiedBy(candidate: UserOrganizationContext): boolean {
    const { user, organizationId } = candidate;
    return user.belongsToOrganization(organizationId);
  }

  /**
   * 获取规格描述
   * @returns 规格描述
   */
  getDescription(): string {
    return "检查用户是否属于指定的组织";
  }
}
