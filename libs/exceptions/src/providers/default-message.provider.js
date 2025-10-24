var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
import { Injectable } from "@nestjs/common";
let DefaultMessageProvider = class DefaultMessageProvider {
  messages = {
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
    TENANT_DATA_ISOLATION_FAILED: {
      title: "租户数据隔离失败",
      detail: "租户数据隔离验证失败: {{reason}}",
    },
    ORGANIZATION_ISOLATION_VIOLATION: {
      title: "组织隔离违规",
      detail: "违反了组织级别的数据隔离规则: {{reason}}",
    },
    DEPARTMENT_ISOLATION_VIOLATION: {
      title: "部门隔离违规",
      detail: "违反了部门级别的数据隔离规则: {{reason}}",
    },
    TENANT_CONTEXT_VIOLATION: {
      title: "租户上下文违规",
      detail: "租户上下文验证失败: {{reason}}",
    },
    TENANT_PERMISSION_VIOLATION: {
      title: "租户权限违规",
      detail: "租户权限验证失败: {{reason}}",
    },
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
    ORGANIZATION_NOT_FOUND: {
      title: "组织未找到",
      detail: "ID 为 {{organizationId}} 的组织不存在",
    },
    ORGANIZATION_UNAUTHORIZED: {
      title: "未授权组织访问",
      detail: "用户 {{userId}} 没有权限访问组织 {{organizationId}}",
    },
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
    GENERAL_NOT_IMPLEMENTED: {
      title: "功能未实现",
      detail: "功能 {{feature}} 尚未实现",
    },
    GENERAL_MAINTENANCE_MODE: {
      title: "系统维护中",
      detail: "{{reason}}",
    },
  };
  getMessage(errorCode, messageType, params) {
    const message = this.messages[errorCode]?.[messageType];
    if (!message) {
      return undefined;
    }
    return this.replaceParams(message, params);
  }
  hasMessage(errorCode, messageType) {
    return this.messages[errorCode]?.[messageType] !== undefined;
  }
  getAvailableErrorCodes() {
    return Object.keys(this.messages);
  }
  replaceParams(template, params) {
    if (!params) {
      return template;
    }
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getNestedValue(params, path);
      return value !== undefined ? String(value) : match;
    });
  }
  getNestedValue(obj, path) {
    const keys = path.split(".");
    let value = obj;
    for (const key of keys) {
      if (value === null || value === undefined || typeof value !== "object") {
        return undefined;
      }
      value = value[key];
    }
    return value;
  }
};
DefaultMessageProvider = __decorate([Injectable()], DefaultMessageProvider);
export { DefaultMessageProvider };
//# sourceMappingURL=default-message.provider.js.map
