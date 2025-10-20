/**
 * 业务工具类定义
 *
 * @description 定义业务相关的工具函数
 * @since 1.0.0
 */

import { EntityId } from "@hl8/isolation-model";
import { StringUtils } from "./basic.utils.js";

/**
 * 分页工具类
 */
export class PaginationUtils {
  /**
   * 计算分页信息
   */
  static calculatePagination(
    total: number,
    page: number,
    pageSize: number,
  ): {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } {
    const totalPages = Math.ceil(total / pageSize);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      total,
      page,
      pageSize,
      totalPages,
      hasNext,
      hasPrevious,
    };
  }

  /**
   * 验证分页参数
   */
  static validatePaginationParams(
    page: number,
    pageSize: number,
    maxPageSize: number = 100,
  ): {
    isValid: boolean;
    page: number;
    pageSize: number;
    errors: string[];
  } {
    const errors: string[] = [];
    let validPage = page;
    let validPageSize = pageSize;

    if (page < 1) {
      errors.push("页码必须大于0");
      validPage = 1;
    }

    if (pageSize < 1) {
      errors.push("每页大小必须大于0");
      validPageSize = 20;
    }

    if (pageSize > maxPageSize) {
      errors.push(`每页大小不能超过${maxPageSize}`);
      validPageSize = maxPageSize;
    }

    return {
      isValid: errors.length === 0,
      page: validPage,
      pageSize: validPageSize,
      errors,
    };
  }

  /**
   * 计算偏移量
   */
  static calculateOffset(page: number, pageSize: number): number {
    return (page - 1) * pageSize;
  }

  /**
   * 计算分页范围
   */
  static calculateRange(
    page: number,
    pageSize: number,
    total: number,
  ): {
    start: number;
    end: number;
    hasMore: boolean;
  } {
    const start = this.calculateOffset(page, pageSize);
    const end = Math.min(start + pageSize, total);
    const hasMore = end < total;

    return { start, end, hasMore };
  }
}

/**
 * 实体工具类
 */
export class EntityUtils {
  /**
   * 检查实体ID是否有效
   */
  static isValidEntityId(id: EntityId | string | null | undefined): boolean {
    if (!id) return false;
    try {
      if (typeof id === "string") {
        return id.length > 0;
      }
      return id instanceof EntityId && id.toString().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * 比较两个实体ID是否相等
   */
  static areEntityIdsEqual(
    id1: EntityId | string | null | undefined,
    id2: EntityId | string | null | undefined,
  ): boolean {
    if (!id1 || !id2) return false;
    const str1 = typeof id1 === "string" ? id1 : id1.toString();
    const str2 = typeof id2 === "string" ? id2 : id2.toString();
    return str1 === str2;
  }

  /**
   * 从字符串创建实体ID
   */
  static createEntityIdFromString(id: string): EntityId {
    // 注意：这里需要根据实际的EntityId实现来调整
    return id as unknown as EntityId;
  }

  /**
   * 生成新的实体ID
   */
  static generateEntityId(): EntityId {
    // 注意：这里需要根据实际的EntityId实现来调整
    return StringUtils.generateUUID() as unknown as EntityId;
  }

  /**
   * 批量生成实体ID
   */
  static generateEntityIds(count: number): EntityId[] {
    return Array.from({ length: count }, () => this.generateEntityId());
  }

  /**
   * 提取实体ID字符串
   */
  static extractEntityIdString(id: EntityId | string): string {
    return typeof id === "string" ? id : id.toString();
  }

  /**
   * 检查实体ID数组是否有效
   */
  static areValidEntityIds(
    ids: (EntityId | string | null | undefined)[],
  ): boolean {
    return ids.every((id) => this.isValidEntityId(id));
  }

  /**
   * 过滤有效的实体ID
   */
  static filterValidEntityIds(
    ids: (EntityId | string | null | undefined)[],
  ): (EntityId | string)[] {
    return ids.filter((id): id is EntityId | string =>
      this.isValidEntityId(id),
    );
  }
}

/**
 * 业务规则工具类
 */
export class BusinessRuleUtils {
  /**
   * 验证租户名称
   */
  static validateTenantName(name: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push("租户名称不能为空");
    } else {
      if (name.trim().length < 3) {
        errors.push("租户名称长度不能少于3个字符");
      }
      if (name.trim().length > 100) {
        errors.push("租户名称长度不能超过100个字符");
      }
      if (!/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_]+$/.test(name.trim())) {
        errors.push("租户名称只能包含中文、英文、数字、空格、短横线和下划线");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证用户名
   */
  static validateUsername(username: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!username || username.trim().length === 0) {
      errors.push("用户名不能为空");
    } else {
      if (username.trim().length < 3) {
        errors.push("用户名长度不能少于3个字符");
      }
      if (username.trim().length > 50) {
        errors.push("用户名长度不能超过50个字符");
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        errors.push("用户名只能包含字母、数字和下划线");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证邮箱
   */
  static validateEmail(email: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!email || email.trim().length === 0) {
      errors.push("邮箱不能为空");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push("邮箱格式不正确");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证手机号
   */
  static validatePhone(phone: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!phone || phone.trim().length === 0) {
      errors.push("手机号不能为空");
    } else {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone.trim())) {
        errors.push("手机号格式不正确");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证密码
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!password || password.length === 0) {
      errors.push("密码不能为空");
    } else {
      if (password.length < 8) {
        errors.push("密码长度不能少于8个字符");
      }
      if (password.length > 128) {
        errors.push("密码长度不能超过128个字符");
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push("密码必须包含小写字母");
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push("密码必须包含大写字母");
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push("密码必须包含数字");
      }
      if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push("密码必须包含特殊字符");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证组织名称
   */
  static validateOrganizationName(name: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push("组织名称不能为空");
    } else {
      if (name.trim().length < 2) {
        errors.push("组织名称长度不能少于2个字符");
      }
      if (name.trim().length > 100) {
        errors.push("组织名称长度不能超过100个字符");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证部门名称
   */
  static validateDepartmentName(name: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push("部门名称不能为空");
    } else {
      if (name.trim().length < 2) {
        errors.push("部门名称长度不能少于2个字符");
      }
      if (name.trim().length > 100) {
        errors.push("部门名称长度不能超过100个字符");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证角色名称
   */
  static validateRoleName(name: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push("角色名称不能为空");
    } else {
      if (name.trim().length < 2) {
        errors.push("角色名称长度不能少于2个字符");
      }
      if (name.trim().length > 50) {
        errors.push("角色名称长度不能超过50个字符");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证权限名称
   */
  static validatePermissionName(name: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push("权限名称不能为空");
    } else {
      if (name.trim().length < 2) {
        errors.push("权限名称长度不能少于2个字符");
      }
      if (name.trim().length > 100) {
        errors.push("权限名称长度不能超过100个字符");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
