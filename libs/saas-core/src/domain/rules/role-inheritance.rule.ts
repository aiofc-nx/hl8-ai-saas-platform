import {
  BusinessRuleValidator,
  BusinessRuleValidationResult,
  BusinessRuleValidationError,
  BusinessRuleValidationWarning,
} from "@hl8/domain-kernel";
import { RoleType } from "../value-objects/role-type.vo.js";
import { GenericEntityId } from "@hl8/domain-kernel";

/**
 * 角色继承上下文
 */
export interface RoleInheritanceContext {
  operation:
    | "role_assignment"
    | "role_revocation"
    | "role_creation"
    | string;
  roleData?: {
    userId: GenericEntityId;
    roleType: RoleType;
    parentRoleId?: GenericEntityId;
  };
}

/**
 * 角色继承业务规则
 * @description 验证角色分配和继承的业务规则
 *
 * @example
 * ```typescript
 * const rule = new RoleInheritanceBusinessRule();
 * const result = rule.validate({
 *   operation: "role_assignment",
 *   roleData: {
 *     userId: UserId.create('user-123'),
 *     roleType: RoleType.TENANT_ADMIN
 *   }
 * });
 * ```
 */
export class RoleInheritanceBusinessRule extends BusinessRuleValidator<RoleInheritanceContext> {
  /**
   * 角色层级优先级映射（数字越小优先级越高）
   */
  private static readonly ROLE_HIERARCHY = new Map<RoleType, number>([
    [RoleType.PLATFORM_ADMIN, 1],
    [RoleType.TENANT_ADMIN, 2],
    [RoleType.ORGANIZATION_ADMIN, 3],
    [RoleType.DEPARTMENT_ADMIN, 4],
    [RoleType.REGULAR_USER, 5],
    [RoleType.CUSTOM, 6],
  ]);

  /**
   * 验证角色继承规则
   * @param context - 验证上下文
   * @returns 验证结果
   */
  validate(context: RoleInheritanceContext): BusinessRuleValidationResult {
    const errors: BusinessRuleValidationError[] = [];
    const warnings: BusinessRuleValidationWarning[] = [];

    const roleData = context.roleData;
    if (!roleData) {
      errors.push({
        code: "MISSING_ROLE_DATA",
        message: "角色数据不能为空",
        field: "roleData",
      });
      return { isValid: false, errors, warnings };
    }

    // 验证用户ID
    if (!roleData.userId) {
      errors.push({
        code: "INVALID_USER_ID",
        message: "用户ID不能为空",
        field: "userId",
      });
    }

    // 验证角色类型
    if (!roleData.roleType) {
      errors.push({
        code: "INVALID_ROLE_TYPE",
        message: "角色类型不能为空",
        field: "roleType",
      });
    } else {
      // 验证角色类型是否有效
      this.validateRoleType(roleData.roleType, errors);
    }

    // 验证角色层级
    if (roleData.roleType && roleData.parentRoleId) {
      this.validateRoleHierarchy(
        roleData.roleType,
        roleData.parentRoleId,
        errors,
        warnings,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证角色类型
   * @param roleType - 角色类型
   * @param errors - 错误列表
   */
  private validateRoleType(
    roleType: RoleType,
    errors: BusinessRuleValidationError[],
  ): void {
    const validRoleTypes = [
      RoleType.PLATFORM_ADMIN,
      RoleType.TENANT_ADMIN,
      RoleType.ORGANIZATION_ADMIN,
      RoleType.DEPARTMENT_ADMIN,
      RoleType.REGULAR_USER,
      RoleType.CUSTOM,
    ];

    if (!validRoleTypes.includes(roleType)) {
      errors.push({
        code: "INVALID_ROLE_TYPE_VALUE",
        message: `无效的角色类型: ${roleType}`,
        field: "roleType",
        context: { roleType },
      });
    }
  }

  /**
   * 验证角色层级
   * @param roleType - 角色类型
   * @param parentRoleId - 父角色ID
   * @param errors - 错误列表
   * @param warnings - 警告列表
   */
  private validateRoleHierarchy(
    roleType: RoleType,
    parentRoleId: GenericEntityId,
    errors: BusinessRuleValidationError[],
    warnings: BusinessRuleValidationWarning[],
  ): void {
    // TODO: 加载父角色信息并验证层级
    // 角色层级规则：
    // 1. 只能从高层级角色继承到低层级角色
    // 2. 不能从低层级角色继承到高层级角色
    // 3. 同层级角色不能互相继承

    const currentPriority = this.getRolePriority(roleType);
    if (currentPriority === null) {
      errors.push({
        code: "UNKNOWN_ROLE_TYPE",
        message: `未知的角色类型: ${roleType}`,
        field: "roleType",
        context: { roleType },
      });
    }
  }

  /**
   * 获取角色优先级
   * @param roleType - 角色类型
   * @returns 优先级（数字越小优先级越高）
   */
  private getRolePriority(roleType: RoleType): number | null {
    return RoleInheritanceBusinessRule.ROLE_HIERARCHY.get(roleType) ?? null;
  }

  /**
   * 获取规则名称
   * @returns 规则名称
   */
  getRuleName(): string {
    return "RoleInheritanceBusinessRule";
  }

  /**
   * 获取规则描述
   * @returns 规则描述
   */
  getRuleDescription(): string {
    return "验证角色分配和继承的业务规则";
  }

  /**
   * 获取规则优先级
   * @returns 规则优先级
   */
  getPriority(): number {
    return 10; // 高优先级
  }
}
