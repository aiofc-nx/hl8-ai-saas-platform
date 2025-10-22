/**
 * 默认消息提供者
 *
 * @description 提供默认的异常消息实现，包含常见错误的中文消息
 *
 * ## 业务规则
 *
 * ### 支持的错误代码
 * - NOT_FOUND：404 未找到错误
 * - BAD_REQUEST：400 错误请求
 * - INTERNAL_SERVER_ERROR：500 服务器错误
 *
 * ### 参数替换
 * - 使用 `{{key}}` 作为占位符
 * - 支持嵌套对象参数（如：`{{user.id}}`）
 * - 不存在的参数保留占位符
 *
 * @example
 * ```typescript
 * const provider = new DefaultMessageProvider();
 *
 * // 使用默认消息
 * const title = provider.getMessage('NOT_FOUND', 'title');
 * // 返回: "资源未找到"
 *
 * // 使用参数替换
 * const detail = provider.getMessage('NOT_FOUND', 'detail', { resource: '用户' });
 * // 返回: "请求的用户不存在"
 * ```
 *
 * @since 0.1.0
 */

import { Injectable } from "@nestjs/common";
import { ExceptionMessageProvider } from "./exception-message.provider.js";

/**
 * 默认消息提供者
 *
 * @description 提供常见错误的默认中文消息
 */
@Injectable()
export class DefaultMessageProvider implements ExceptionMessageProvider {
  /**
   * 消息映射表
   *
   * @private
   */
  private readonly messages: Record<string, { title: string; detail: string }> =
    {
      // 通用异常
      NOT_FOUND: {
        title: "资源未找到",
        detail: "请求的{{resource}}不存在",
      },
      BAD_REQUEST: {
        title: "错误的请求",
        detail: "请求参数不符合要求",
      },
      INTERNAL_SERVER_ERROR: {
        title: "服务器内部错误",
        detail: "处理请求时发生未预期的错误",
      },

      // 认证授权异常
      AUTH_LOGIN_FAILED: {
        title: "认证失败",
        detail: "用户名或密码错误",
      },
      AUTH_UNAUTHORIZED: {
        title: "未授权访问",
        detail: "您没有权限访问此资源",
      },
      AUTH_TOKEN_EXPIRED: {
        title: "令牌已过期",
        detail: "访问令牌已过期，请重新登录",
      },
      AUTH_INVALID_TOKEN: {
        title: "无效令牌",
        detail: "提供的访问令牌无效",
      },
      AUTH_INSUFFICIENT_PERMISSIONS: {
        title: "权限不足",
        detail: "您没有执行此操作的权限",
      },

      // 用户管理异常
      USER_NOT_FOUND: {
        title: "用户未找到",
        detail: "ID 为 {{userId}} 的用户不存在",
      },
      USER_ALREADY_EXISTS: {
        title: "用户已存在",
        detail: "用户 {{identifier}} 已存在",
      },
      USER_INVALID_STATUS: {
        title: "用户状态无效",
        detail: "用户状态 {{status}} 无效",
      },
      USER_ACCOUNT_LOCKED: {
        title: "账户被锁定",
        detail: "用户账户已被锁定",
      },
      USER_ACCOUNT_DISABLED: {
        title: "账户已禁用",
        detail: "用户账户已被禁用",
      },

      // 多租户异常
      TENANT_NOT_FOUND: {
        title: "租户未找到",
        detail: "ID 为 {{tenantId}} 的租户不存在",
      },
      TENANT_CROSS_ACCESS_VIOLATION: {
        title: "跨租户访问违规",
        detail: "不允许跨租户访问资源",
      },
      TENANT_DATA_ISOLATION_VIOLATION: {
        title: "数据隔离违规",
        detail: "违反了数据隔离规则",
      },
      TENANT_INVALID_CONTEXT: {
        title: "无效的租户上下文",
        detail: "租户上下文信息无效",
      },

      // 数据验证异常
      VALIDATION_FAILED: {
        title: "数据验证失败",
        detail: "字段 {{field}} 验证失败: {{reason}}",
      },
      BUSINESS_RULE_VIOLATION: {
        title: "业务规则违规",
        detail: "业务规则 {{ruleName}} 被违反: {{violation}}",
      },
      CONSTRAINT_VIOLATION: {
        title: "约束违规",
        detail: "{{constraintType}} 约束被违反: {{violation}}",
      },

      // 系统资源异常
      SYSTEM_RATE_LIMIT_EXCEEDED: {
        title: "速率限制超出",
        detail: "请求频率超出限制，请稍后重试",
      },
      SYSTEM_SERVICE_UNAVAILABLE: {
        title: "服务不可用",
        detail: "服务暂时不可用，请稍后重试",
      },
      SYSTEM_RESOURCE_NOT_FOUND: {
        title: "资源未找到",
        detail: "系统资源 {{resourceType}} ({{resourceId}}) 不存在",
      },

      // 组织管理异常
      ORGANIZATION_NOT_FOUND: {
        title: "组织未找到",
        detail: "ID 为 {{organizationId}} 的组织不存在",
      },
      ORGANIZATION_UNAUTHORIZED: {
        title: "未授权组织访问",
        detail: "用户 {{userId}} 没有权限访问组织 {{organizationId}}",
      },

      // 部门管理异常
      DEPARTMENT_NOT_FOUND: {
        title: "部门未找到",
        detail: "ID 为 {{departmentId}} 的部门不存在",
      },
      DEPARTMENT_UNAUTHORIZED: {
        title: "未授权部门访问",
        detail: "用户 {{userId}} 没有权限访问部门 {{departmentId}}",
      },
      DEPARTMENT_INVALID_HIERARCHY: {
        title: "无效的部门层级",
        detail: "{{reason}}",
      },

      // 业务逻辑异常
      BUSINESS_OPERATION_FAILED: {
        title: "操作失败",
        detail: "操作 {{operation}} 失败: {{reason}}",
      },
      BUSINESS_INVALID_STATE_TRANSITION: {
        title: "无效状态转换",
        detail:
          "实体 {{entity}} 无法从状态 {{currentState}} 转换到 {{targetState}}",
      },
      BUSINESS_STEP_FAILED: {
        title: "步骤失败",
        detail: "工作流 {{workflowName}} 第 {{stepNumber}} 步失败: {{reason}}",
      },

      // 集成异常
      INTEGRATION_EXTERNAL_SERVICE_UNAVAILABLE: {
        title: "外部服务不可用",
        detail: "外部服务 {{serviceName}} 不可用: {{reason}}",
      },
      INTEGRATION_EXTERNAL_SERVICE_ERROR: {
        title: "外部服务错误",
        detail: "外部服务 {{serviceName}} 返回错误: {{errorMessage}}",
      },
      INTEGRATION_EXTERNAL_SERVICE_TIMEOUT: {
        title: "外部服务超时",
        detail: "外部服务 {{serviceName}} 调用超时 ({{timeoutMs}}ms)",
      },

      // 通用异常
      GENERAL_NOT_IMPLEMENTED: {
        title: "功能未实现",
        detail: "功能 {{feature}} 尚未实现",
      },
      GENERAL_MAINTENANCE_MODE: {
        title: "系统维护中",
        detail: "{{reason}}",
      },
    };

  /**
   * 获取消息
   *
   * @param errorCode - 错误代码
   * @param messageType - 消息类型（title 或 detail）
   * @param params - 消息参数
   * @returns 消息字符串，如果不存在则返回 undefined
   */
  getMessage(
    errorCode: string,
    messageType: "title" | "detail",
    params?: Record<string, unknown>,
  ): string | undefined {
    const message = this.messages[errorCode]?.[messageType];
    if (!message) {
      return undefined;
    }

    return this.replaceParams(message, params);
  }

  /**
   * 检查是否有消息
   *
   * @param errorCode - 错误代码
   * @param messageType - 消息类型
   * @returns 如果有消息则返回 true
   */
  hasMessage(errorCode: string, messageType: "title" | "detail"): boolean {
    return this.messages[errorCode]?.[messageType] !== undefined;
  }

  /**
   * 获取所有可用的错误代码列表
   *
   * @returns 错误代码数组
   */
  getAvailableErrorCodes(): string[] {
    return Object.keys(this.messages);
  }

  /**
   * 替换消息中的参数占位符
   *
   * @param template - 消息模板
   * @param params - 参数对象
   * @returns 替换后的消息
   *
   * @private
   * @example
   * ```typescript
   * replaceParams('Hello {{name}}', { name: 'World' });
   * // 返回: "Hello World"
   *
   * replaceParams('User {{user.id}}', { user: { id: '123' } });
   * // 返回: "User 123"
   * ```
   */
  private replaceParams(
    template: string,
    params?: Record<string, unknown>,
  ): string {
    if (!params) {
      return template;
    }

    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getNestedValue(params, path);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * 获取嵌套对象的值
   *
   * @param obj - 对象
   * @param path - 路径（如：'user.id'）
   * @returns 值，如果不存在则返回 undefined
   *
   * @private
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split(".");
    let value: unknown = obj;

    for (const key of keys) {
      if (value === null || value === undefined || typeof value !== "object") {
        return undefined;
      }
      value = (value as Record<string, unknown>)[key];
    }

    return value;
  }
}
