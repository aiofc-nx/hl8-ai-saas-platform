/**
 * 用户状态业务规则
 * @description 验证用户状态转换和状态一致性
 *
 * @since 1.0.0
 */

import {
  BusinessRuleValidator,
  BusinessRuleValidationResult,
} from "./business-rule-validator.js";
import type {
  BusinessRuleValidationError,
  BusinessRuleValidationWarning,
} from "./business-rule-validator.js";

/**
 * 用户状态业务规则验证器
 */
export interface UserStateContext {
  operation: "status_change" | "user_update" | string;
  userData?: {
    currentStatus?: string;
    newStatus?: string;
    status?: string;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

export class UserStateBusinessRule extends BusinessRuleValidator<UserStateContext> {
  validate(context: UserStateContext): BusinessRuleValidationResult {
    const errors: BusinessRuleValidationError[] = [];
    const warnings: BusinessRuleValidationWarning[] = [];

    const userData = context.userData;
    if (!userData) {
      errors.push({
        code: "MISSING_USER_DATA",
        message: "用户数据不能为空",
        field: "userData",
      });
      return { isValid: false, errors, warnings };
    }

    const currentStatus = userData.currentStatus;
    const newStatus = userData.newStatus;
    const operation = context.operation;

    // 验证状态转换
    if (operation === "status_change" && currentStatus && newStatus) {
      const isValidTransition = this.validateStatusTransition(
        currentStatus,
        newStatus,
      );
      if (!isValidTransition.isValid) {
        errors.push({
          code: "INVALID_STATUS_TRANSITION",
          message: isValidTransition.message,
          field: "status",
          context: {
            currentStatus,
            newStatus,
            allowedTransitions: isValidTransition.allowedTransitions,
          },
        });
      }
    }

    // 验证状态一致性
    if (userData.status && userData.isDeleted !== undefined) {
      if (userData.status === "ACTIVE" && userData.isDeleted === true) {
        errors.push({
          code: "INCONSISTENT_STATUS",
          message: "活跃用户不能同时被标记为已删除",
          field: "status",
          context: { status: userData.status, isDeleted: userData.isDeleted },
        });
      }
    }

    // 验证生命周期状态
    if (userData.createdAt && userData.updatedAt) {
      if (userData.updatedAt < userData.createdAt) {
        errors.push({
          code: "INVALID_LIFECYCLE",
          message: "更新时间不能早于创建时间",
          field: "updatedAt",
          context: {
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
          },
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  getRuleName(): string {
    return "UserStateBusinessRule";
  }

  getRuleDescription(): string {
    return "验证用户状态转换和状态一致性";
  }

  isApplicable(context: UserStateContext): boolean {
    return (
      context.operation === "status_change" ||
      context.operation === "user_update"
    );
  }

  private validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): {
    isValid: boolean;
    message: string;
    allowedTransitions: string[];
  } {
    const validTransitions: Record<string, string[]> = {
      PENDING: ["ACTIVE", "REJECTED"],
      ACTIVE: ["SUSPENDED", "INACTIVE"],
      SUSPENDED: ["ACTIVE", "INACTIVE"],
      INACTIVE: ["ACTIVE"],
      REJECTED: [], // 拒绝状态不能转换到其他状态
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      return {
        isValid: false,
        message: `不能从状态 ${currentStatus} 转换到 ${newStatus}`,
        allowedTransitions,
      };
    }

    return {
      isValid: true,
      message: "",
      allowedTransitions,
    };
  }
}
