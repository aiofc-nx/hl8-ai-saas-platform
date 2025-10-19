import { BaseValueObject } from "../base-value-object.js";
import { BusinessRuleException } from "../../exceptions/base/base-domain-exception.js";
import { ErrorCodes } from "../../../common/constants/index.js";
import {
  OrganizationType as OrganizationTypeEnum,
  OrganizationTypeUtils,
} from "../../../common/enums/index.js";

/**
 * 组织类型值对象
 *
 * @description 定义组织类型的枚举和业务规则，支持多种组织类型的管理。
 * 组织类型决定了组织的功能范围、权限级别和业务规则。
 *
 * ## 业务规则
 *
 * ### 组织类型定义
 * - 委员会：决策型组织，负责重大决策和战略规划
 * - 项目组：执行型组织，负责具体项目执行和交付
 * - 质量组：质量型组织，负责质量管理和标准制定
 * - 绩效组：绩效型组织，负责绩效评估和激励管理
 *
 * ### 类型转换规则
 * - 组织类型在创建后可以变更
 * - 类型变更需要相应的权限验证
 * - 类型变更会影响组织的功能范围
 * - 类型变更需要通知相关用户
 *
 * ### 权限规则
 * - 不同组织类型具有不同的默认权限
 * - 委员会类型具有最高权限级别
 * - 项目组类型具有执行权限
 * - 质量组和绩效组具有专业权限
 *
 * @example
 * ```typescript
 * // 创建委员会类型
 * const committeeType = OrganizationType.create("COMMITTEE");
 * console.log(committeeType.value); // "COMMITTEE"
 *
 * // 验证组织类型
 * const isValid = OrganizationType.isValid("COMMITTEE");
 * console.log(isValid); // true
 *
 * // 获取所有类型
 * const allTypes = OrganizationType.getAllTypes();
 * console.log(allTypes); // ["COMMITTEE", "PROJECT_TEAM", "QUALITY_GROUP", "PERFORMANCE_GROUP"]
 * ```
 *
 * @since 1.0.0
 */
export class OrganizationType extends BaseValueObject<string> {
  /** 企业组织 - 商业型组织 */
  static readonly ENTERPRISE = OrganizationTypeEnum.ENTERPRISE;

  /** 非营利组织 - 公益型组织 */
  static readonly NON_PROFIT = OrganizationTypeEnum.NON_PROFIT;

  /** 政府组织 - 公共型组织 */
  static readonly GOVERNMENT = OrganizationTypeEnum.GOVERNMENT;

  /** 教育组织 - 教育型组织 */
  static readonly EDUCATION = OrganizationTypeEnum.EDUCATION;

  /** 其他组织 - 其他型组织 */
  static readonly OTHER = OrganizationTypeEnum.OTHER;

  /**
   * 验证组织类型
   *
   * @protected
   * @override
   */
  protected override validate(value: string): void {
    this.validateNotEmpty(value, "组织类型");
    const validTypes = OrganizationTypeUtils.getAllTypes();
    if (!validTypes.includes(value as OrganizationTypeEnum)) {
      throw new BusinessRuleException(
        `无效的组织类型: ${value}`,
        ErrorCodes.VALIDATION_FAILED,
      );
    }
  }

  /**
   * 转换组织类型
   *
   * @protected
   * @override
   */
  protected override transform(value: string): string {
    return value.toUpperCase();
  }

  /**
   * 获取组织类型描述
   *
   * @description 根据组织类型返回对应的中文描述
   *
   * @returns 组织类型描述
   *
   * @example
   * ```typescript
   * const type = OrganizationType.create("COMMITTEE");
   * console.log(type.getDescription()); // "委员会"
   * ```
   */
  getDescription(): string {
    const descriptions: Record<string, string> = {
      [OrganizationType.ENTERPRISE]: "企业组织",
      [OrganizationType.NON_PROFIT]: "非营利组织",
      [OrganizationType.GOVERNMENT]: "政府组织",
      [OrganizationType.EDUCATION]: "教育组织",
      [OrganizationType.OTHER]: "其他组织",
    };

    return descriptions[this.value] || "未知类型";
  }

  /**
   * 获取组织类型权限级别
   *
   * @description 根据组织类型返回对应的权限级别
   *
   * @returns 权限级别（1-4，数字越大权限越高）
   *
   * @example
   * ```typescript
   * const type = OrganizationType.create("COMMITTEE");
   * console.log(type.getPermissionLevel()); // 4
   * ```
   */
  getPermissionLevel(): number {
    const levels: Record<string, number> = {
      [OrganizationType.GOVERNMENT]: 5, // 最高权限
      [OrganizationType.EDUCATION]: 4, // 高权限
      [OrganizationType.ENTERPRISE]: 3, // 中等权限
      [OrganizationType.NON_PROFIT]: 2, // 低权限
      [OrganizationType.OTHER]: 1, // 最低权限
    };

    return levels[this.value] || 1;
  }

  /**
   * 获取组织类型功能范围
   *
   * @description 根据组织类型返回对应的功能范围
   *
   * @returns 功能范围描述
   *
   * @example
   * ```typescript
   * const type = OrganizationType.create("COMMITTEE");
   * console.log(type.getFunctionScope()); // "决策管理、战略规划、重大事项审批"
   * ```
   */
  getFunctionScope(): string {
    const scopes: Record<string, string> = {
      [OrganizationType.ENTERPRISE]: "商业管理、盈利运营、市场拓展",
      [OrganizationType.GOVERNMENT]: "公共服务、政策制定、社会治理",
      [OrganizationType.EDUCATION]: "教育服务、人才培养、学术研究",
      [OrganizationType.NON_PROFIT]: "公益服务、社会救助、慈善活动",
      [OrganizationType.OTHER]: "基础管理功能",
    };

    return scopes[this.value] || "基础管理功能";
  }

  /**
   * 检查组织类型是否为决策型
   *
   * @description 判断组织类型是否具有决策权限
   *
   * @returns 是否为决策型组织
   *
   * @example
   * ```typescript
   * const type = OrganizationType.create("COMMITTEE");
   * console.log(type.isDecisionType()); // true
   * ```
   */
  isDecisionType(): boolean {
    return this.value === OrganizationType.GOVERNMENT || this.value === OrganizationType.ENTERPRISE;
  }

  /**
   * 检查组织类型是否为执行型
   *
   * @description 判断组织类型是否具有执行权限
   *
   * @returns 是否为执行型组织
   *
   * @example
   * ```typescript
   * const type = OrganizationType.create("PROJECT_TEAM");
   * console.log(type.isExecutionType()); // true
   * ```
   */
  isExecutionType(): boolean {
    return this.value === OrganizationType.EDUCATION || this.value === OrganizationType.NON_PROFIT;
  }

  /**
   * 检查组织类型是否为专业型
   *
   * @description 判断组织类型是否具有专业权限
   *
   * @returns 是否为专业型组织
   *
   * @example
   * ```typescript
   * const type = OrganizationType.create("QUALITY_GROUP");
   * console.log(type.isProfessionalType()); // true
   * ```
   */
  isProfessionalType(): boolean {
    return this.value === OrganizationType.EDUCATION || this.value === OrganizationType.GOVERNMENT;
  }

  /**
   * 验证组织类型是否有效
   *
   * @description 检查给定的字符串是否为有效的组织类型
   *
   * @param type - 要验证的类型字符串
   * @returns 是否为有效类型
   *
   * @example
   * ```typescript
   * const isValid = OrganizationType.isValid("COMMITTEE");
   * console.log(isValid); // true
   *
   * const isInvalid = OrganizationType.isValid("INVALID");
   * console.log(isInvalid); // false
   * ```
   */
  static isValid(type: string): boolean {
    const validTypes = [
      OrganizationType.ENTERPRISE,
      OrganizationType.NON_PROFIT,
      OrganizationType.GOVERNMENT,
      OrganizationType.EDUCATION,
      OrganizationType.OTHER,
    ];
    return validTypes.includes(type as any);
  }

  /**
   * 获取所有组织类型
   *
   * @description 返回所有支持的组织类型列表
   *
   * @returns 所有组织类型数组
   *
   * @example
   * ```typescript
   * const allTypes = OrganizationType.getAllTypes();
   * console.log(allTypes); // ["COMMITTEE", "PROJECT_TEAM", "QUALITY_GROUP", "PERFORMANCE_GROUP"]
   * ```
   */
  static getAllTypes(): string[] {
    return OrganizationTypeUtils.getAllTypes();
  }

  /**
   * 比较组织类型权限级别
   *
   * @description 比较两个组织类型的权限级别
   *
   * @param other - 另一个组织类型
   * @returns 比较结果（-1: 当前权限更低, 0: 权限相等, 1: 当前权限更高）
   *
   * @example
   * ```typescript
   * const type1 = OrganizationType.create("COMMITTEE");
   * const type2 = OrganizationType.create("PROJECT_TEAM");
   * const result = type1.comparePermissionLevel(type2);
   * console.log(result); // 1 (委员会权限更高)
   * ```
   */
  comparePermissionLevel(other: OrganizationType): number {
    const level1 = this.getPermissionLevel();
    const level2 = other.getPermissionLevel();

    if (level1 < level2) return -1;
    if (level1 > level2) return 1;
    return 0;
  }
}
