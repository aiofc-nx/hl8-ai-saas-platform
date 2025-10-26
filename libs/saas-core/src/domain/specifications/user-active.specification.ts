import { BaseSpecification } from "@hl8/domain-kernel";
import { User } from "../aggregates/user.aggregate.js";

/**
 * 用户活跃状态规格
 * @description 检查用户是否处于活跃状态
 */
export class UserActiveSpecification extends BaseSpecification<User> {
  /**
   * 检查用户是否满足活跃状态
   * @param candidate - 候选用户
   * @returns 是否满足规格
   */
  isSatisfiedBy(candidate: User): boolean {
    return candidate.isActive();
  }

  /**
   * 获取规格描述
   * @returns 规格描述
   */
  getDescription(): string {
    return "检查用户是否处于活跃状态";
  }
}
