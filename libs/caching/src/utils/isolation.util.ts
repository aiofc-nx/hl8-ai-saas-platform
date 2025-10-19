/**
 * 简化的隔离工具
 *
 * @description 提供简单直接的隔离上下文处理，替代复杂的 DDD 实现
 *
 * @since 1.0.0
 */

import type { IsolationContext } from "@hl8/isolation-model";

/**
 * 获取隔离级别
 *
 * @description 从隔离上下文中获取隔离级别
 *
 * @param context - 隔离上下文
 * @returns 隔离级别字符串
 *
 * @example
 * ```typescript
 * const level = getIsolationLevel(context);
 * console.log(`当前隔离级别: ${level}`);
 * ```
 */
export function getIsolationLevel(context?: IsolationContext): string {
  if (!context) {
    return "platform";
  }

  // 检查用户级隔离
  if (context.userId) {
    return "user";
  }

  // 检查部门级隔离
  if (context.departmentId) {
    return "department";
  }

  // 检查组织级隔离
  if (context.organizationId) {
    return "organization";
  }

  // 检查租户级隔离
  if (context.tenantId) {
    return "tenant";
  }

  // 默认平台级
  return "platform";
}

/**
 * 检查隔离级别
 *
 * @description 检查当前隔离级别是否满足要求
 *
 * @param context - 隔离上下文
 * @param requiredLevel - 要求的隔离级别
 * @returns 如果满足要求返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * if (hasIsolationLevel(context, 'tenant')) {
 *   // 有租户级或更高级别的隔离
 * }
 * ```
 */
export function hasIsolationLevel(
  requiredLevel: string,
  context?: IsolationContext,
): boolean {
  const currentLevel = getIsolationLevel(context);
  const levelHierarchy = [
    "platform",
    "tenant",
    "organization",
    "department",
    "user",
  ];

  const currentIndex = levelHierarchy.indexOf(currentLevel);
  const requiredIndex = levelHierarchy.indexOf(requiredLevel);

  return currentIndex >= requiredIndex;
}

/**
 * 获取隔离标识符
 *
 * @description 从隔离上下文中获取标识符字符串
 *
 * @param context - 隔离上下文
 * @returns 隔离标识符字符串
 *
 * @example
 * ```typescript
 * const identifier = getIsolationIdentifier(context);
 * console.log(`隔离标识符: ${identifier}`);
 * ```
 */
export function getIsolationIdentifier(context?: IsolationContext): string {
  if (!context) {
    return "platform";
  }

  const parts: string[] = [];

  if (context.tenantId) {
    parts.push(`tenant:${context.tenantId.toString()}`);
  }

  if (context.organizationId) {
    parts.push(`org:${context.organizationId.toString()}`);
  }

  if (context.departmentId) {
    parts.push(`dept:${context.departmentId.toString()}`);
  }

  if (context.userId) {
    parts.push(`user:${context.userId.toString()}`);
  }

  return parts.length > 0 ? parts.join(":") : "platform";
}

/**
 * 验证隔离上下文
 *
 * @description 验证隔离上下文是否有效
 *
 * @param context - 隔离上下文
 * @returns 如果上下文有效返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * if (validateIsolationContext(context)) {
 *   // 上下文有效，可以安全使用
 * }
 * ```
 */
export function validateIsolationContext(context?: IsolationContext): boolean {
  if (!context) {
    return true; // 平台级上下文总是有效的
  }

  // 检查必要的字段
  if (context.tenantId && !context.tenantId.toString()) {
    return false;
  }

  if (context.organizationId && !context.organizationId.toString()) {
    return false;
  }

  if (context.departmentId && !context.departmentId.toString()) {
    return false;
  }

  if (context.userId && !context.userId.toString()) {
    return false;
  }

  return true;
}

/**
 * 创建隔离键前缀
 *
 * @description 根据隔离上下文创建键前缀
 *
 * @param context - 隔离上下文
 * @param basePrefix - 基础前缀
 * @returns 完整的键前缀
 *
 * @example
 * ```typescript
 * const prefix = createIsolationPrefix(context, 'hl8:cache:');
 * // 输出: hl8:cache:tenant:tenant-123:org:org-456:
 * ```
 */
export function createIsolationPrefix(
  context?: IsolationContext,
  basePrefix: string = "",
): string {
  if (!context) {
    return `${basePrefix}platform:`;
  }

  const identifier = getIsolationIdentifier(context);
  return `${basePrefix}${identifier}:`;
}

/**
 * 检查隔离上下文是否匹配
 *
 * @description 检查两个隔离上下文是否匹配
 *
 * @param context1 - 第一个隔离上下文
 * @param context2 - 第二个隔离上下文
 * @returns 如果匹配返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * if (isIsolationContextMatch(context1, context2)) {
 *   // 两个上下文匹配，可以共享缓存
 * }
 * ```
 */
export function isIsolationContextMatch(
  context1?: IsolationContext,
  context2?: IsolationContext,
): boolean {
  if (!context1 && !context2) {
    return true; // 都是平台级
  }

  if (!context1 || !context2) {
    return false; // 一个平台级，一个不是
  }

  // 比较租户 ID
  if (context1.tenantId?.toString() !== context2.tenantId?.toString()) {
    return false;
  }

  // 比较组织 ID
  if (
    context1.organizationId?.toString() !== context2.organizationId?.toString()
  ) {
    return false;
  }

  // 比较部门 ID
  if (context1.departmentId?.toString() !== context2.departmentId?.toString()) {
    return false;
  }

  // 比较用户 ID
  if (context1.userId?.toString() !== context2.userId?.toString()) {
    return false;
  }

  return true;
}

/**
 * 获取隔离上下文摘要
 *
 * @description 获取隔离上下文的摘要信息
 *
 * @param context - 隔离上下文
 * @returns 隔离上下文摘要
 *
 * @example
 * ```typescript
 * const summary = getIsolationContextSummary(context);
 * console.log(`隔离上下文: ${summary.level} - ${summary.identifier}`);
 * ```
 */
export function getIsolationContextSummary(context?: IsolationContext): {
  level: string;
  identifier: string;
  isValid: boolean;
} {
  return {
    level: getIsolationLevel(context),
    identifier: getIsolationIdentifier(context),
    isValid: validateIsolationContext(context),
  };
}
