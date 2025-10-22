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
  async validateAccess(context: any, resource: any): Promise<boolean> {
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
    } catch (error) {
      console.error("访问权限验证失败:", error);
      return false;
    }
  }

  /**
   * 提取资源的隔离上下文
   */
  private extractResourceContext(resource: any): any | null {
    try {
      // 从资源中提取隔离信息
      if (resource.tenantId) {
        if (resource.departmentId && resource.organizationId) {
          return {
            tenantId: resource.tenantId,
            organizationId: resource.organizationId,
            departmentId: resource.departmentId,
          };
        } else if (resource.organizationId) {
          return {
            tenantId: resource.tenantId,
            organizationId: resource.organizationId,
          };
        } else {
          return { tenantId: resource.tenantId };
        }
      } else if (resource.userId) {
        return {
          userId: resource.userId,
          tenantId: resource.tenantId,
        };
      }
      return {};
    } catch (error) {
      console.error("提取资源隔离上下文失败:", error);
      return null;
    }
  }

  /**
   * 检查资源访问权限
   */
  async checkResourceAccess(
    context: any,
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
    } catch (error) {
      return false;
    }
  }

  /**
   * 过滤数据
   */
  filterData<T>(data: T[], context: any): T[] {
    try {
      return data.filter((item) => this.isDataAccessible(item, context));
    } catch (error) {
      return [];
    }
  }

  /**
   * 应用隔离过滤
   */
  applyIsolationFilter(query: any, context: any): any {
    try {
      const filteredQuery = { ...query };

      // 添加隔离条件
      if (context.tenantId) {
        filteredQuery.tenantId = context.tenantId;
      }

      if (context.organizationId) {
        filteredQuery.organizationId = context.organizationId;
      }

      if (context.departmentId) {
        filteredQuery.departmentId = context.departmentId;
      }

      if (context.userId) {
        filteredQuery.userId = context.userId;
      }

      return filteredQuery;
    } catch (error) {
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
    context: any,
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
      } catch (error) {
        results[key] = false;
      }
    }

    return results;
  }

  /**
   * 获取权限摘要
   */
  async getPermissionSummary(context: any): Promise<PermissionSummary> {
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
    } catch (error) {
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
  private getResourceType(resource: any): string {
    if (typeof resource === "string") {
      return resource;
    }

    if (resource && typeof resource === "object") {
      return resource.type || resource.resourceType || "unknown";
    }

    return "unknown";
  }

  /**
   * 获取资源ID
   */
  private getResourceId(resource: any): string {
    if (typeof resource === "string") {
      return resource;
    }

    if (resource && typeof resource === "object") {
      return resource.id || resource.resourceId || "";
    }

    return "";
  }

  /**
   * 获取操作
   */
  private getAction(resource: any): string {
    if (resource && typeof resource === "object") {
      return resource.action || "read";
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
    context: any,
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
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查条件
   */
  private checkCondition(
    key: string,
    value: any,
    context: any,
    resourceType: string,
    resourceId: string,
    action: string,
  ): boolean {
    try {
      switch (key) {
        case "tenantId":
          return context.tenantId === value;
        case "organizationId":
          return context.organizationId === value;
        case "departmentId":
          return context.departmentId === value;
        case "userId":
          return context.userId === value;
        case "sharingLevel":
          return (context as any).sharingLevel === value;
        case "isShared":
          return (context as any).isShared === value;
        default:
          return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查默认访问权限
   */
  private checkDefaultAccess(
    context: any,
    resourceType: string,
    resourceId: string,
    action: string,
  ): boolean {
    try {
      // 根据共享级别确定默认权限
      switch ((context as any).sharingLevel) {
        case "PLATFORM":
          return true;
        case "TENANT":
          return resourceType.startsWith("tenant:");
        case "ORGANIZATION":
          return (
            resourceType.startsWith("org:") ||
            resourceType.startsWith("tenant:")
          );
        case "DEPARTMENT":
          return (
            resourceType.startsWith("dept:") ||
            resourceType.startsWith("org:") ||
            resourceType.startsWith("tenant:")
          );
        case "USER":
          return (
            resourceType.startsWith("user:") ||
            resourceType.startsWith("dept:") ||
            resourceType.startsWith("org:") ||
            resourceType.startsWith("tenant:")
          );
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查数据是否可访问
   */
  private isDataAccessible(data: any, context: any): boolean {
    try {
      if (!data || typeof data !== "object") {
        return false;
      }

      // 检查租户隔离
      if (context.tenantId && data.tenantId !== context.tenantId) {
        return false;
      }

      // 检查组织隔离
      if (
        context.organizationId &&
        data.organizationId !== context.organizationId
      ) {
        return false;
      }

      // 检查部门隔离
      if (context.departmentId && data.departmentId !== context.departmentId) {
        return false;
      }

      // 检查用户隔离
      if (context.userId && data.userId !== context.userId) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
