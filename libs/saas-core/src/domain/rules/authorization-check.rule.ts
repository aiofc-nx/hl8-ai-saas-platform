import {
  BusinessRuleValidator,
  BusinessRuleValidationResult,
  BusinessRuleValidationError,
  BusinessRuleValidationWarning,
} from "@hl8/domain-kernel";
import { PermissionAction } from "../value-objects/permission-action.vo.js";
import { PermissionScope } from "../value-objects/permission-scope.vo.js";
import { GenericEntityId } from "@hl8/domain-kernel";

/**
 * 授权检查上下文
 */
export interface AuthorizationCheckContext {
  operation: "authorization_check" | "permission_request" | string;
  authorizationData?: {
    userId: GenericEntityId;
    action: PermissionAction;
    scope: PermissionScope;
    targetResourceId?: GenericEntityId;
  };
}

/**
 * 授权检查业务规则
 * @description 验证授权检查和权限请求的业务规则
 *
 * @example
 * ```typescript
 * const rule = new AuthorizationCheckBusinessRule();
 * const result = rule.validate({
 *   operation: "authorization_check",
 *   authorizationData: {
 *     userId: UserId.create('user-123'),
 *     action: PermissionAction.CREATE,
 *     scope: PermissionScope.TENANT
 *   }
 * });
 * ```
 */
export class AuthorizationCheckBusinessRule extends BusinessRuleValidator<AuthorizationCheckContext> {
  /**
   * 权限层级映射（数字越小权限越高）
   */
  private static readonly PERMISSION_HIERARCHY = new Map<
    PermissionScope,
    number
  >([
    [PermissionScope.PLATFORM, 1],
    [PermissionScope.TENANT, 2],
    [PermissionScope.ORGANIZATION, 3],
    [PermissionScope.DEPARTMENT, 4],
    [PermissionScope.USER, 5],
  ]);

  /**
   * 验证授权检查规则
   * @param context - 验证上下文
   * @returns 验证结果
   */
  validate(context: AuthorizationCheckContext): BusinessRuleValidationResult {
    const errors: BusinessRuleValidationError[] = [];
    const warnings: BusinessRuleValidationWarning[] = [];

    const authorizationData = context.authorizationData;
    if (!authorizationData) {
      errors.push({
        code: "MISSING_AUTHORIZATION_DATA",
        message: "授权数据不能为空",
        field: "authorizationData",
      });
      return { isValid: false, errors, warnings };
    }

    // 验证用户ID
    if (!authorizationData.userId) {
      errors.push({
        code: "INVALID_USER_ID",
        message: "用户ID不能为空",
        field: "userId",
      });
    }

    // 验证权限操作
    if (!authorizationData.action) {
      errors.push({
        code: "INVALID_PERMISSION_ACTION",
        message: "权限操作不能为空",
        field: "action",
      });
    } else {
      // 验证权限操作是否有效
      this.validatePermissionAction(authorizationData.action, errors);
    }

    // 验证权限范围
    if (!authorizationData.scope) {
      errors.push({
        code: "INVALID_PERMISSION_SCOPE",
        message: "权限范围不能为空",
        field: "scope",
      });
    } else {
      // 验证权限范围是否有效
      this.validatePermissionScope(authorizationData.scope, errors);
    }

    // 验证目标资源ID（如果提供）
    if (authorizationData.scope) {
      this.validateTargetResource(
        authorizationData.scope,
        authorizationData.targetResourceId,
        errors,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证权限操作
   * @param action - 权限操作
   * @param errors - 错误列表
   */
  private validatePermissionAction(
    action: PermissionAction,
    errors: BusinessRuleValidationError[],
  ): void {
    const validActions = [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
      PermissionAction.EXECUTE,
      PermissionAction.MANAGE,
    ];

    if (!validActions.includes(action)) {
      errors.push({
        code: "INVALID_PERMISSION_ACTION_VALUE",
        message: `无效的权限操作: ${action}`,
        field: "action",
        context: { action },
      });
    }
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
   * 验证目标资源
   * @param scope - 权限范围
   * @param targetResourceId - 目标资源ID
   * @param errors - 错误列表
   */
  private validateTargetResource(
    scope: PermissionScope,
    targetResourceId: GenericEntityId | undefined,
    errors: BusinessRuleValidationError[],
  ): void {
    // 组织级、部门级、用户级权限必须指定目标资源ID
    if (
      (scope === PermissionScope.ORGANIZATION ||
        scope === PermissionScope.DEPARTMENT ||
        scope === PermissionScope.USER) &&
      !targetResourceId
    ) {
      errors.push({
        code: "MISSING_TARGET_RESOURCE_ID",
        message: `${scope} 级权限必须指定目标资源ID`,
        field: "targetResourceId",
      });
    }
  }

  /**
   * 获取规则名称
   * @returns 规则名称
   */
  getRuleName(): string {
    return "AuthorizationCheckBusinessRule";
  }

  /**
   * 获取规则描述
   * @returns 规则描述
   */
  getRuleDescription(): string {
    return "验证授权检查和权限请求的业务规则";
  }

  /**
   * 获取规则优先级
   * @returns 规则优先级
   */
  getPriority(): number {
    return 10; // 高优先级
  }
}
