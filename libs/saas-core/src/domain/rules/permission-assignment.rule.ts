import {
  BusinessRuleValidator,
  BusinessRuleValidationResult,
  BusinessRuleValidationError,
  BusinessRuleValidationWarning,
} from "@hl8/domain-kernel";
import { PermissionScope } from "../value-objects/permission-scope.vo.js";
import { GenericEntityId } from "@hl8/domain-kernel";

/**
 * 权限分配上下文
 */
export interface PermissionAssignmentContext {
  operation: "permission_assignment" | "permission_revocation" | string;
  permissionData?: {
    userId: GenericEntityId;
    permissionId: GenericEntityId;
    scope: PermissionScope;
    targetResourceId?: GenericEntityId;
  };
}

/**
 * 权限分配业务规则
 * @description 验证权限分配的业务规则和约束条件
 *
 * @example
 * ```typescript
 * const rule = new PermissionAssignmentBusinessRule();
 * const result = rule.validate({
 *   operation: "permission_assignment",
 *   permissionData: {
 *     userId: UserId.create('user-123'),
 *     permissionId: PermissionId.create('perm-456'),
 *     scope: PermissionScope.TENANT
 *   }
 * });
 * ```
 */
export class PermissionAssignmentBusinessRule extends BusinessRuleValidator<PermissionAssignmentContext> {
  /**
   * 验证权限分配规则
   * @param context - 验证上下文
   * @returns 验证结果
   */
  validate(context: PermissionAssignmentContext): BusinessRuleValidationResult {
    const errors: BusinessRuleValidationError[] = [];
    const warnings: BusinessRuleValidationWarning[] = [];

    const permissionData = context.permissionData;
    if (!permissionData) {
      errors.push({
        code: "MISSING_PERMISSION_DATA",
        message: "权限数据不能为空",
        field: "permissionData",
      });
      return { isValid: false, errors, warnings };
    }

    // 验证用户ID
    if (!permissionData.userId) {
      errors.push({
        code: "INVALID_USER_ID",
        message: "用户ID不能为空",
        field: "userId",
      });
    }

    // 验证权限ID
    if (!permissionData.permissionId) {
      errors.push({
        code: "INVALID_PERMISSION_ID",
        message: "权限ID不能为空",
        field: "permissionId",
      });
    }

    // 验证权限范围
    if (!permissionData.scope) {
      errors.push({
        code: "INVALID_PERMISSION_SCOPE",
        message: "权限范围不能为空",
        field: "scope",
      });
    } else {
      // 验证权限层级
      this.validatePermissionScope(permissionData.scope, errors);
    }

    // 验证目标资源ID（如果提供）
    if (permissionData.targetResourceId) {
      if (
        permissionData.scope === PermissionScope.ORGANIZATION ||
        permissionData.scope === PermissionScope.DEPARTMENT ||
        permissionData.scope === PermissionScope.USER
      ) {
        // 组织级、部门级、用户级权限必须指定目标资源ID
        if (!permissionData.targetResourceId) {
          errors.push({
            code: "MISSING_TARGET_RESOURCE_ID",
            message: `${permissionData.scope} 级权限必须指定目标资源ID`,
            field: "targetResourceId",
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证权限范围
   * @param scope - 权限范围
   * @param errors - 错误列表
   */
  private validatePermissionScope(
    scope: PermissionScope,
    errors: BusinessRuleValidationError[],
  ): void {
    // 验证权限层级
    const validScopes = [
      PermissionScope.PLATFORM,
      PermissionScope.TENANT,
      PermissionScope.ORGANIZATION,
      PermissionScope.DEPARTMENT,
      PermissionScope.USER,
    ];

    if (!validScopes.includes(scope)) {
      errors.push({
        code: "INVALID_PERMISSION_SCOPE_VALUE",
        message: `无效的权限范围: ${scope}`,
        field: "scope",
        context: { scope },
      });
    }
  }

  /**
   * 获取规则名称
   * @returns 规则名称
   */
  getRuleName(): string {
    return "PermissionAssignmentBusinessRule";
  }

  /**
   * 获取规则描述
   * @returns 规则描述
   */
  getRuleDescription(): string {
    return "验证权限分配的业务规则和约束条件";
  }

  /**
   * 获取规则优先级
   * @returns 规则优先级
   */
  getPriority(): number {
    return 10; // 高优先级
  }
}
