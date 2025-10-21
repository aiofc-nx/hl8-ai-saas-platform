/**
 * 租户上下文验证器
 *
 * 提供租户上下文验证的专用工具
 * 支持租户隔离、权限验证和安全检查
 *
 * @since 1.0.0
 */
import { IsolationContext, IsolationLevel } from "@hl8/domain-kernel";
import { IUseCaseContext } from "./use-case-context.interface.js";

/**
 * 租户上下文验证结果
 */
export interface TenantContextValidationResult {
  /**
   * 是否有效
   */
  isValid: boolean;

  /**
   * 验证错误列表
   */
  errors: string[];

  /**
   * 警告列表
   */
  warnings: string[];

  /**
   * 建议改进项
   */
  suggestions: string[];

  /**
   * 租户信息
   */
  tenantInfo?: {
    id: string;
    name: string;
    isolationLevel: string;
  };
}

/**
 * 租户上下文验证器
 *
 * 提供租户上下文验证的专用工具
 */
export class TenantContextValidator {
  /**
   * 验证租户上下文
   *
   * @param context - 用例上下文
   * @param isolationContext - 隔离上下文
   * @returns 验证结果
   */
  static validateTenantContext(
    context: IUseCaseContext,
    isolationContext?: IsolationContext,
  ): TenantContextValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 验证租户信息
    if (!context.tenant) {
      errors.push("租户上下文缺失");
      suggestions.push("提供租户信息以支持多租户隔离");
    } else {
      // 验证租户ID
      if (!context.tenant.id || context.tenant.id.trim() === "") {
        errors.push("租户ID不能为空");
      } else if (!this.isValidTenantId(context.tenant.id)) {
        errors.push("租户ID格式无效");
        suggestions.push("使用有效的租户ID格式");
      }

      // 验证租户名称
      if (!context.tenant.name || context.tenant.name.trim() === "") {
        warnings.push("租户名称缺失");
        suggestions.push("提供租户名称以改善用户体验");
      }
    }

    // 验证隔离上下文
    if (isolationContext) {
      const isolationValidation =
        this.validateIsolationContext(isolationContext);
      errors.push(...isolationValidation.errors);
      warnings.push(...isolationValidation.warnings);
      suggestions.push(...isolationValidation.suggestions);
    }

    // 验证租户权限
    if (context.tenant) {
      const permissionValidation = this.validateTenantPermissions(context);
      errors.push(...permissionValidation.errors);
      warnings.push(...permissionValidation.warnings);
      suggestions.push(...permissionValidation.suggestions);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      tenantInfo: context.tenant
        ? {
            id: context.tenant.id,
            name: context.tenant.name,
            isolationLevel: isolationContext?.getIsolationLevel() || "unknown",
          }
        : undefined,
    };
  }

  /**
   * 验证租户隔离
   *
   * @param context - 用例上下文
   * @param targetTenantId - 目标租户ID
   * @returns 验证结果
   */
  static validateTenantIsolation(
    context: IUseCaseContext,
    targetTenantId: string,
  ): TenantContextValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!context.tenant) {
      errors.push("租户上下文缺失，无法验证隔离");
      suggestions.push("提供租户信息以支持多租户隔离");
    } else if (context.tenant.id !== targetTenantId) {
      errors.push(
        `租户隔离违规：当前租户 ${context.tenant.id} 尝试访问租户 ${targetTenantId}`,
      );
      suggestions.push("确保用户只能访问其所属租户的数据");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      tenantInfo: context.tenant
        ? {
            id: context.tenant.id,
            name: context.tenant.name,
            isolationLevel: "tenant",
          }
        : undefined,
    };
  }

  /**
   * 验证租户权限
   *
   * @param context - 用例上下文
   * @param requiredPermission - 所需权限
   * @returns 验证结果
   */
  static validateTenantPermission(
    context: IUseCaseContext,
    requiredPermission: string,
  ): TenantContextValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!context.tenant) {
      errors.push("租户上下文缺失，无法验证权限");
      suggestions.push("提供租户信息以支持权限验证");
    } else {
      const permissions = (context.metadata?.permissions as string[]) || [];
      const hasPermission =
        permissions.includes(requiredPermission) || permissions.includes("*");

      if (!hasPermission) {
        errors.push(`缺少所需权限: ${requiredPermission}`);
        suggestions.push(`为用户分配 ${requiredPermission} 权限`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      tenantInfo: context.tenant
        ? {
            id: context.tenant.id,
            name: context.tenant.name,
            isolationLevel: "tenant",
          }
        : undefined,
    };
  }

  /**
   * 验证租户数据访问
   *
   * @param context - 用例上下文
   * @param dataTenantId - 数据所属租户ID
   * @returns 验证结果
   */
  static validateTenantDataAccess(
    context: IUseCaseContext,
    dataTenantId: string,
  ): TenantContextValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!context.tenant) {
      errors.push("租户上下文缺失，无法验证数据访问");
      suggestions.push("提供租户信息以支持数据访问验证");
    } else if (context.tenant.id !== dataTenantId) {
      errors.push(
        `数据访问违规：租户 ${context.tenant.id} 尝试访问租户 ${dataTenantId} 的数据`,
      );
      suggestions.push("确保用户只能访问其所属租户的数据");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      tenantInfo: context.tenant
        ? {
            id: context.tenant.id,
            name: context.tenant.name,
            isolationLevel: "tenant",
          }
        : undefined,
    };
  }

  /**
   * 验证隔离上下文
   *
   * @param isolationContext - 隔离上下文
   * @returns 验证结果
   */
  private static validateIsolationContext(isolationContext: IsolationContext): {
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (isolationContext.isEmpty()) {
      errors.push("隔离上下文不能为空");
      suggestions.push("提供有效的隔离上下文以支持多租户隔离");
    } else {
      const level = isolationContext.getIsolationLevel();

      if (level === IsolationLevel.PLATFORM) {
        warnings.push("使用平台级隔离上下文，请确保有足够的权限");
      } else if (level === IsolationLevel.TENANT) {
        // 租户级隔离是正常的
      } else if (level === IsolationLevel.ORGANIZATION) {
        // 组织级隔离是正常的
      } else if (level === IsolationLevel.DEPARTMENT) {
        // 部门级隔离是正常的
      } else if (level === IsolationLevel.USER) {
        // 用户级隔离是正常的
      }
    }

    return { errors, warnings, suggestions };
  }

  /**
   * 验证租户权限
   *
   * @param context - 用例上下文
   * @returns 验证结果
   */
  private static validateTenantPermissions(context: IUseCaseContext): {
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const permissions = (context.metadata?.permissions as string[]) || [];
    const roles = (context.metadata?.roles as string[]) || [];
    const level = (context.metadata?.level as string) || "read";

    if (permissions.length === 0) {
      warnings.push("用户没有分配任何权限");
      suggestions.push("为用户分配适当的权限");
    }

    if (roles.length === 0) {
      warnings.push("用户没有分配任何角色");
      suggestions.push("为用户分配适当的角色");
    }

    if (level === "read" && permissions.some((p) => p.includes("write"))) {
      warnings.push("权限级别与权限不匹配");
      suggestions.push("调整权限级别或权限配置");
    }

    return { errors, warnings, suggestions };
  }

  /**
   * 验证租户ID格式
   *
   * @param tenantId - 租户ID
   * @returns 是否有效
   */
  private static isValidTenantId(tenantId: string): boolean {
    // 简单的租户ID格式验证
    return (
      /^[a-zA-Z0-9_-]+$/.test(tenantId) &&
      tenantId.length >= 3 &&
      tenantId.length <= 50
    );
  }
}
