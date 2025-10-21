/**
 * 上下文安全验证器
 *
 * 提供上下文安全验证的专用工具
 * 支持安全策略、权限验证和威胁检测
 *
 * @since 1.0.0
 */
import { IUseCaseContext } from "./use-case-context.interface.js";
import { IsolationContext, IsolationLevel } from "@hl8/domain-kernel";

/**
 * 安全验证结果
 */
export interface SecurityValidationResult {
  /**
   * 是否安全
   */
  isSecure: boolean;

  /**
   * 安全威胁列表
   */
  threats: string[];

  /**
   * 安全警告列表
   */
  warnings: string[];

  /**
   * 安全建议列表
   */
  recommendations: string[];

  /**
   * 安全级别
   */
  securityLevel: "low" | "medium" | "high" | "critical";
}

/**
 * 上下文安全验证器
 *
 * 提供上下文安全验证的专用工具
 */
export class ContextSecurityValidator {
  /**
   * 全面安全验证
   *
   * @param context - 用例上下文
   * @param isolationContext - 隔离上下文
   * @returns 安全验证结果
   */
  static validateSecurity(
    context: IUseCaseContext,
    isolationContext?: IsolationContext,
  ): SecurityValidationResult {
    const threats: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // 验证敏感数据
    const sensitiveDataValidation = this.validateSensitiveData(context);
    threats.push(...sensitiveDataValidation.threats);
    warnings.push(...sensitiveDataValidation.warnings);
    recommendations.push(...sensitiveDataValidation.recommendations);

    // 验证权限安全
    const permissionSecurityValidation =
      this.validatePermissionSecurity(context);
    threats.push(...permissionSecurityValidation.threats);
    warnings.push(...permissionSecurityValidation.warnings);
    recommendations.push(...permissionSecurityValidation.recommendations);

    // 验证上下文完整性
    const contextIntegrityValidation = this.validateContextIntegrity(context);
    threats.push(...contextIntegrityValidation.threats);
    warnings.push(...contextIntegrityValidation.warnings);
    recommendations.push(...contextIntegrityValidation.recommendations);

    // 验证隔离安全
    if (isolationContext) {
      const isolationSecurityValidation =
        this.validateIsolationSecurity(isolationContext);
      threats.push(...isolationSecurityValidation.threats);
      warnings.push(...isolationSecurityValidation.warnings);
      recommendations.push(...isolationSecurityValidation.recommendations);
    }

    // 验证时间安全
    const timeSecurityValidation = this.validateTimeSecurity(context);
    threats.push(...timeSecurityValidation.threats);
    warnings.push(...timeSecurityValidation.warnings);
    recommendations.push(...timeSecurityValidation.recommendations);

    const securityLevel = this.calculateSecurityLevel(threats, warnings);

    return {
      isSecure: threats.length === 0,
      threats,
      warnings,
      recommendations,
      securityLevel,
    };
  }

  /**
   * 验证敏感数据
   *
   * @param context - 用例上下文
   * @returns 安全验证结果
   */
  private static validateSensitiveData(context: IUseCaseContext): {
    threats: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const threats: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // 检查元数据中的敏感信息
    if (context.metadata) {
      const sensitiveKeys = [
        "password",
        "token",
        "secret",
        "key",
        "auth",
        "credential",
      ];

      for (const [key, value] of Object.entries(context.metadata)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveKeys.some((sensitive) =>
          lowerKey.includes(sensitive),
        );

        if (isSensitive && typeof value === "string" && value.length > 0) {
          threats.push(`敏感数据泄露风险: ${key}`);
          recommendations.push(`移除或加密敏感字段: ${key}`);
        }
      }
    }

    // 检查用户信息中的敏感数据
    if (context.user) {
      if (context.user.username && context.user.username.includes("@")) {
        warnings.push("用户名包含邮箱信息，可能存在隐私风险");
        recommendations.push("考虑使用不包含邮箱的用户名");
      }
    }

    return { threats, warnings, recommendations };
  }

  /**
   * 验证权限安全
   *
   * @param context - 用例上下文
   * @returns 安全验证结果
   */
  private static validatePermissionSecurity(context: IUseCaseContext): {
    threats: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const threats: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const permissions = (context.metadata?.permissions as string[]) || [];
    const roles = (context.metadata?.roles as string[]) || [];
    const level = (context.metadata?.level as string) || "read";

    // 检查过度权限
    if (permissions.includes("*")) {
      threats.push("用户具有通配符权限，存在安全风险");
      recommendations.push("使用具体的权限而不是通配符");
    }

    // 检查管理员权限
    if (roles.includes("admin") || level === "admin" || level === "super") {
      warnings.push("用户具有管理员权限，请谨慎操作");
      recommendations.push("确保管理员权限的必要性和安全性");
    }

    // 检查权限级别不匹配
    if (level === "read" && permissions.some((p) => p.includes("write"))) {
      threats.push("权限级别与权限不匹配，可能存在权限提升风险");
      recommendations.push("调整权限级别或权限配置");
    }

    return { threats, warnings, recommendations };
  }

  /**
   * 验证上下文完整性
   *
   * @param context - 用例上下文
   * @returns 安全验证结果
   */
  private static validateContextIntegrity(context: IUseCaseContext): {
    threats: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const threats: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // 检查请求标识符
    if (!context.requestId || context.requestId.trim() === "") {
      threats.push("请求标识符缺失，无法追踪请求");
      recommendations.push("提供有效的请求标识符");
    } else if (!/^req_\d+_[a-z0-9]+$/i.test(context.requestId)) {
      warnings.push("请求标识符格式不符合规范");
      recommendations.push("使用标准格式的请求标识符");
    }

    // 检查时间戳
    if (!context.timestamp || !(context.timestamp instanceof Date)) {
      threats.push("时间戳无效，无法验证上下文时效性");
      recommendations.push("提供有效的时间戳");
    } else {
      const now = new Date();
      const age = now.getTime() - context.timestamp.getTime();

      if (age < 0) {
        threats.push("时间戳是未来时间，可能存在时间攻击");
        recommendations.push("确保时间戳的准确性");
      } else if (age > 3600000) {
        // 1小时
        warnings.push("上下文可能已过期");
        recommendations.push("考虑刷新上下文");
      }
    }

    return { threats, warnings, recommendations };
  }

  /**
   * 验证隔离安全
   *
   * @param isolationContext - 隔离上下文
   * @returns 安全验证结果
   */
  private static validateIsolationSecurity(
    isolationContext: IsolationContext,
  ): {
    threats: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const threats: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (isolationContext.isEmpty()) {
      threats.push("隔离上下文为空，存在数据泄露风险");
      recommendations.push("提供有效的隔离上下文");
    } else {
      const level = isolationContext.getIsolationLevel();

      if (level === IsolationLevel.PLATFORM) {
        threats.push("使用平台级隔离，存在权限提升风险");
        recommendations.push("确保平台级隔离的必要性和安全性");
      }
    }

    return { threats, warnings, recommendations };
  }

  /**
   * 验证时间安全
   *
   * @param context - 用例上下文
   * @returns 安全验证结果
   */
  private static validateTimeSecurity(context: IUseCaseContext): {
    threats: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const threats: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const now = new Date();
    const contextTime = context.timestamp;

    if (contextTime) {
      const timeDiff = Math.abs(now.getTime() - contextTime.getTime());

      // 检查时间同步
      if (timeDiff > 300000) {
        // 5分钟
        warnings.push("上下文时间与系统时间差异较大");
        recommendations.push("检查时间同步设置");
      }

      // 检查时间回退
      if (contextTime.getTime() > now.getTime()) {
        threats.push("上下文时间戳是未来时间，可能存在时间攻击");
        recommendations.push("确保时间戳的准确性");
      }
    }

    return { threats, warnings, recommendations };
  }

  /**
   * 计算安全级别
   *
   * @param threats - 威胁列表
   * @param warnings - 警告列表
   * @returns 安全级别
   */
  private static calculateSecurityLevel(
    threats: string[],
    warnings: string[],
  ): "low" | "medium" | "high" | "critical" {
    if (threats.length === 0 && warnings.length === 0) {
      return "low";
    } else if (threats.length === 0 && warnings.length <= 2) {
      return "medium";
    } else if (threats.length <= 2) {
      return "high";
    } else {
      return "critical";
    }
  }
}
