/**
 * 访问控制服务
 *
 * @description 实现基于隔离上下文的访问控制
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type {
  IAccessControlService,
  AccessRule,
  PermissionSummary,
} from "../../interfaces/isolation-service.interface.js";

/**
 * 访问控制服务
 */
@Injectable()
export class AccessControlService implements IAccessControlService {
  private accessRules = new Map<string, AccessRule[]>();
  private ruleIdCounter = 0;

  constructor() {}

  /**
   * 验证访问权限
   */
  async validateAccess(context: unknown, resource: unknown): Promise<boolean> {
    try {
      if (!context || !resource) {
        return false;
      }

      // 使用领域模型的权限检查逻辑
      // 这里需要根据实际的资源隔离上下文来检查权限
      const resourceContext = this.extractResourceContext(resource);
      if (!resourceContext) {
        return false;
      }

      // 简化的权限检查逻辑
      return true;
    } catch (_error) {
      console.error("访问权限验证失败:", _error);
      return false;
    }
  }

  /**
   * 提取资源的隔离上下文
   */
  private extractResourceContext(resource: unknown): unknown | null {
    try {
      const resourceObj = resource as Record<string, unknown>;

      // 从资源中提取隔离信息
      if (resourceObj.tenantId) {
        if (resourceObj.departmentId && resourceObj.organizationId) {
          return {
            tenantId: resourceObj.tenantId,
            organizationId: resourceObj.organizationId,
            departmentId: resourceObj.departmentId,
          };
        } else if (resourceObj.organizationId) {
          return {
            tenantId: resourceObj.tenantId,
            organizationId: resourceObj.organizationId,
          };
        } else {
          return { tenantId: resourceObj.tenantId };
        }
      } else if (resourceObj.userId) {
        return {
          userId: resourceObj.userId,
          tenantId: resourceObj.tenantId,
        };
      }
      return {};
    } catch (_error) {
      console.error("提取资源隔离上下文失败:", _error);
      return null;
    }
  }

  /**
   * 检查资源访问权限
   */
  async checkResourceAccess(
    context: unknown,
    resourceType: string,
    resourceId: string,
    action: string,
  ): Promise<boolean> {
    try {
      // 获取适用的访问规则
      const applicableRules = this.getApplicableRules(resourceType, action);

      // 按优先级排序规则
      const sortedRules = applicableRules.sort(
        (a, b) => b.priority - a.priority,
      );

      // 检查规则
      for (const rule of sortedRules) {
        if (
          this.isRuleApplicable(rule, context, resourceType, resourceId, action)
        ) {
          return rule.allow;
        }
      }

      // 默认权限检查
      return this.checkDefaultAccess(context, resourceType, resourceId, action);
    } catch (_error) {
      return false;
    }
  }

  /**
   * 过滤数据
   */
  filterData<T>(data: T[], context: unknown): T[] {
    try {
      return data.filter((item) => this.isDataAccessible(item, context));
    } catch (_error) {
      return [];
    }
  }

  /**
   * 应用隔离过滤
   */
  applyIsolationFilter(query: unknown, context: unknown): unknown {
    try {
      const queryObj = query as Record<string, unknown>;
      const contextObj = context as Record<string, unknown>;
      const filteredQuery = { ...queryObj };

      // 添加隔离条件
      if (contextObj.tenantId) {
        filteredQuery.tenantId = contextObj.tenantId;
      }

      if (contextObj.organizationId) {
        filteredQuery.organizationId = contextObj.organizationId;
      }

      if (contextObj.departmentId) {
        filteredQuery.departmentId = contextObj.departmentId;
      }

      if (contextObj.userId) {
        filteredQuery.userId = contextObj.userId;
      }

      return filteredQuery;
    } catch (_error) {
      return query;
    }
  }

  /**
   * 设置访问规则
   */
  setAccessRule(
    resourceType: string,
    action: string,
    rule: Omit<AccessRule, "id">,
  ): void {
    const ruleId = `rule_${++this.ruleIdCounter}`;
    const fullRule: AccessRule = {
      id: ruleId,
      ...rule,
    };

    const key = `${resourceType}:${action}`;
    const existingRules = this.accessRules.get(key) || [];
    existingRules.push(fullRule);
    this.accessRules.set(key, existingRules);
  }

  /**
   * 获取访问规则
   */
  getAccessRules(resourceType: string, action: string): AccessRule[] {
    const key = `${resourceType}:${action}`;
    return this.accessRules.get(key) || [];
  }

  /**
   * 移除访问规则
   */
  removeAccessRule(resourceType: string, action: string, ruleId: string): void {
    const key = `${resourceType}:${action}`;
    const existingRules = this.accessRules.get(key) || [];
    const filteredRules = existingRules.filter((rule) => rule.id !== ruleId);
    this.accessRules.set(key, filteredRules);
  }

  /**
   * 检查批量访问权限
   */
  async checkBatchAccess(
    context: unknown,
    resources: Array<{ type: string; id: string; action: string }>,
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const resource of resources) {
      const key = `${resource.type}:${resource.id}:${resource.action}`;
      try {
        results[key] = await this.checkResourceAccess(
          context,
          resource.type,
          resource.id,
          resource.action,
        );
      } catch (_error) {
        results[key] = false;
      }
    }

    return results;
  }

  /**
   * 获取权限摘要
   */
  async getPermissionSummary(context: unknown): Promise<PermissionSummary> {
    try {
      const allowedActions: string[] = [];
      const deniedActions: string[] = [];
      const resourcePermissions: Record<string, string[]> = {};
      let permissionLevel: "READ" | "WRITE" | "ADMIN" | "OWNER" = "READ";

      // 遍历所有规则
      for (const [key, rules] of this.accessRules.entries()) {
        const [resourceType, action] = key.split(":");

        for (const rule of rules) {
          if (this.isRuleApplicable(rule, context, resourceType, "", action)) {
            if (rule.allow) {
              allowedActions.push(action);
              if (!resourcePermissions[resourceType]) {
                resourcePermissions[resourceType] = [];
              }
              resourcePermissions[resourceType].push(action);
            } else {
              deniedActions.push(action);
            }
          }
        }
      }

      // 确定权限级别
      if ((context as any).sharingLevel === "PLATFORM") {
        permissionLevel = "OWNER";
      } else if ((context as any).sharingLevel === "TENANT") {
        permissionLevel = "ADMIN";
      } else if ((context as any).sharingLevel === "ORGANIZATION") {
        permissionLevel = "WRITE";
      } else {
        permissionLevel = "READ";
      }

      return {
        allowedActions,
        deniedActions,
        resourcePermissions,
        permissionLevel,
      };
    } catch (_error) {
      return {
        allowedActions: [],
        deniedActions: [],
        resourcePermissions: {},
        permissionLevel: "READ",
      };
    }
  }

  /**
   * 获取资源类型
   */
  private getResourceType(resource: unknown): string {
    if (typeof resource === "string") {
      return resource;
    }

    if (resource && typeof resource === "object") {
      const resourceObj = resource as Record<string, unknown>;
      return (
        (resourceObj.type as string) ||
        (resourceObj.resourceType as string) ||
        "unknown"
      );
    }

    return "unknown";
  }

  /**
   * 获取资源ID
   */
  private getResourceId(resource: unknown): string {
    if (typeof resource === "string") {
      return resource;
    }

    if (resource && typeof resource === "object") {
      const resourceObj = resource as Record<string, unknown>;
      return (
        (resourceObj.id as string) || (resourceObj.resourceId as string) || ""
      );
    }

    return "";
  }

  /**
   * 获取操作
   */
  private getAction(resource: unknown): string {
    if (resource && typeof resource === "object") {
      const resourceObj = resource as Record<string, unknown>;
      return (resourceObj.action as string) || "read";
    }

    return "read";
  }

  /**
   * 获取适用的访问规则
   */
  private getApplicableRules(
    resourceType: string,
    action: string,
  ): AccessRule[] {
    const key = `${resourceType}:${action}`;
    return this.accessRules.get(key) || [];
  }

  /**
   * 检查规则是否适用
   */
  private isRuleApplicable(
    rule: AccessRule,
    context: unknown,
    resourceType: string,
    resourceId: string,
    action: string,
  ): boolean {
    try {
      if (!rule.enabled) {
        return false;
      }

      // 检查条件
      if (rule.conditions) {
        for (const [key, value] of Object.entries(rule.conditions)) {
          if (
            !this.checkCondition(
              key,
              value,
              context,
              resourceType,
              resourceId,
              action,
            )
          ) {
            return false;
          }
        }
      }

      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * 检查条件
   */
  private checkCondition(
    key: string,
    value: unknown,
    context: unknown,
    _resourceType: string,
    _resourceId: string,
    _action: string,
  ): boolean {
    try {
      const contextObj = context as Record<string, unknown>;

      switch (key) {
        case "tenantId":
          return contextObj.tenantId === value;
        case "organizationId":
          return contextObj.organizationId === value;
        case "departmentId":
          return contextObj.departmentId === value;
        case "userId":
          return contextObj.userId === value;
        case "sharingLevel":
          return contextObj.sharingLevel === value;
        case "isShared":
          return contextObj.isShared === value;
        default:
          return true;
      }
    } catch (_error) {
      return false;
    }
  }

  /**
   * 检查默认访问权限
   */
  private checkDefaultAccess(
    context: unknown,
    _resourceType: string,
    _resourceId: string,
    _action: string,
  ): boolean {
    try {
      // 根据共享级别确定默认权限
      switch ((context as any).sharingLevel) {
        case "PLATFORM":
          return true;
        case "TENANT":
          return _resourceType.startsWith("tenant:");
        case "ORGANIZATION":
          return (
            _resourceType.startsWith("org:") ||
            _resourceType.startsWith("tenant:")
          );
        case "DEPARTMENT":
          return (
            _resourceType.startsWith("dept:") ||
            _resourceType.startsWith("org:") ||
            _resourceType.startsWith("tenant:")
          );
        case "USER":
          return (
            _resourceType.startsWith("user:") ||
            _resourceType.startsWith("dept:") ||
            _resourceType.startsWith("org:") ||
            _resourceType.startsWith("tenant:")
          );
        default:
          return false;
      }
    } catch (_error) {
      return false;
    }
  }

  /**
   * 检查数据是否可访问
   */
  private isDataAccessible(data: unknown, context: unknown): boolean {
    try {
      if (!data || typeof data !== "object") {
        return false;
      }

      const contextObj = context as Record<string, unknown>;
      const dataObj = data as Record<string, unknown>;

      // 检查租户隔离
      if (contextObj.tenantId && dataObj.tenantId !== contextObj.tenantId) {
        return false;
      }

      // 检查组织隔离
      if (
        contextObj.organizationId &&
        dataObj.organizationId !== contextObj.organizationId
      ) {
        return false;
      }

      // 检查部门隔离
      if (
        contextObj.departmentId &&
        dataObj.departmentId !== contextObj.departmentId
      ) {
        return false;
      }

      // 检查用户隔离
      if (contextObj.userId && dataObj.userId !== contextObj.userId) {
        return false;
      }

      return true;
    } catch (_error) {
      return false;
    }
  }
}
