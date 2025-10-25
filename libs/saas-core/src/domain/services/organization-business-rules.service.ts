/**
 * 组织业务规则
 *
 * @description 处理组织相关的业务规则，包括组织创建、更新、删除、成员管理等业务规则
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { DomainService } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import { OrganizationId } from "@hl8/domain-kernel";
import { UserId } from "@hl8/domain-kernel";

/**
 * 组织业务规则类型枚举
 */
export enum OrganizationBusinessRuleType {
  CREATION = "CREATION",
  UPDATE = "UPDATE",
  DELETION = "DELETION",
  MEMBER_MANAGEMENT = "MEMBER_MANAGEMENT",
  ROLE_ASSIGNMENT = "ROLE_ASSIGNMENT",
  PERMISSION_MANAGEMENT = "PERMISSION_MANAGEMENT",
  HIERARCHY_MANAGEMENT = "HIERARCHY_MANAGEMENT",
  NAMING = "NAMING",
}

/**
 * 组织业务规则优先级枚举
 */
export enum OrganizationBusinessRulePriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * 组织业务规则上下文接口
 */
export interface OrganizationBusinessRuleContext {
  readonly tenantId?: TenantId;
  readonly organizationId?: OrganizationId;
  readonly userId?: UserId;
  readonly operation: string;
  readonly data: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 组织业务规则结果接口
 */
export interface OrganizationBusinessRuleResult {
  readonly success: boolean;
  readonly message: string;
  readonly data?: Record<string, unknown>;
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

/**
 * 组织业务规则接口
 */
export interface OrganizationBusinessRule {
  readonly id: string;
  readonly name: string;
  readonly type: OrganizationBusinessRuleType;
  readonly priority: OrganizationBusinessRulePriority;
  readonly description: string;
  readonly condition: (
    context: OrganizationBusinessRuleContext,
  ) => Promise<boolean>;
  readonly action: (
    context: OrganizationBusinessRuleContext,
  ) => Promise<OrganizationBusinessRuleResult>;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 组织业务规则
 *
 * 组织业务规则负责处理组织相关的业务规则，包括组织创建、更新、删除、成员管理等业务规则。
 * 支持多种业务规则类型和优先级，提供统一的组织业务规则管理接口。
 *
 * @example
 * ```typescript
 * const rules = new OrganizationBusinessRules();
 * await rules.addRule(rule);
 * const result = await rules.executeRules(context);
 * ```
 */
@Injectable()
export class OrganizationBusinessRules extends DomainService {
  private readonly rules: Map<string, OrganizationBusinessRule> = new Map();
  private readonly executionHistory: Array<{
    readonly timestamp: Date;
    readonly context: OrganizationBusinessRuleContext;
    readonly results: readonly {
      readonly ruleId: string;
      readonly ruleName: string;
      readonly executed: boolean;
      readonly result: OrganizationBusinessRuleResult;
      readonly executionTime: number;
    }[];
  }> = [];

  constructor() {
    super();
    this.setContext("OrganizationBusinessRules");
    this.initializeDefaultRules();
  }

  /**
   * 添加组织业务规则
   *
   * @param rule - 组织业务规则
   * @returns 是否添加成功
   */
  async addRule(rule: OrganizationBusinessRule): Promise<boolean> {
    this.logger.log(
      `Adding organization business rule: ${rule.name} (${rule.type})`,
      this.context,
    );

    if (this.rules.has(rule.id)) {
      throw new Error(`Organization business rule ${rule.id} already exists`);
    }

    this.rules.set(rule.id, rule);

    this.logger.log(
      `Organization business rule ${rule.name} added successfully`,
      this.context,
    );

    return true;
  }

  /**
   * 获取组织业务规则
   *
   * @param ruleId - 规则ID
   * @returns 组织业务规则或undefined
   */
  async getRule(ruleId: string): Promise<OrganizationBusinessRule | undefined> {
    this.logger.log(
      `Getting organization business rule: ${ruleId}`,
      this.context,
    );

    const rule = this.rules.get(ruleId);

    this.logger.log(
      `Organization business rule ${ruleId} ${rule ? "found" : "not found"}`,
      this.context,
    );

    return rule;
  }

  /**
   * 执行组织业务规则
   *
   * @param context - 组织业务规则上下文
   * @param ruleIds - 规则ID列表（可选）
   * @returns 组织业务规则执行结果
   */
  async executeRules(
    context: OrganizationBusinessRuleContext,
    ruleIds?: readonly string[],
  ): Promise<
    readonly {
      readonly ruleId: string;
      readonly ruleName: string;
      readonly executed: boolean;
      readonly result: OrganizationBusinessRuleResult;
      readonly executionTime: number;
    }[]
  > {
    this.logger.log(
      `Executing organization business rules for context: ${context.operation}`,
      this.context,
    );

    const rulesToExecute = ruleIds
      ? Array.from(this.rules.values()).filter((rule) =>
          ruleIds.includes(rule.id),
        )
      : Array.from(this.rules.values());

    // 按优先级排序
    rulesToExecute.sort((a, b) => {
      const priorityOrder = {
        [OrganizationBusinessRulePriority.CRITICAL]: 4,
        [OrganizationBusinessRulePriority.HIGH]: 3,
        [OrganizationBusinessRulePriority.NORMAL]: 2,
        [OrganizationBusinessRulePriority.LOW]: 1,
      };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const results: Array<{
      readonly ruleId: string;
      readonly ruleName: string;
      readonly executed: boolean;
      readonly result: OrganizationBusinessRuleResult;
      readonly executionTime: number;
    }> = [];

    for (const rule of rulesToExecute) {
      const startTime = Date.now();
      let executed = false;
      let result: OrganizationBusinessRuleResult;

      try {
        // 检查规则条件
        const conditionMet = await rule.condition(context);

        if (conditionMet) {
          // 执行规则动作
          result = await rule.action(context);
          executed = true;
        } else {
          result = {
            success: true,
            message: `Rule condition not met for ${rule.name}`,
          };
        }
      } catch (error) {
        this.logger.error(
          `Error executing organization business rule ${rule.name}: ${error.message}`,
          this.context,
        );

        result = {
          success: false,
          message: `Rule execution error: ${error.message}`,
          errors: [error.message],
        };
        executed = true;
      }

      const executionTime = Date.now() - startTime;
      const executionResult = {
        ruleId: rule.id,
        ruleName: rule.name,
        executed,
        result,
        executionTime,
      };

      results.push(executionResult);
    }

    // 记录执行历史
    this.executionHistory.push({
      timestamp: new Date(),
      context,
      results,
    });

    this.logger.log(
      `Organization business rules execution completed: ${results.length} rules executed`,
      this.context,
    );

    return results;
  }

  /**
   * 获取组织业务规则统计信息
   *
   * @returns 组织业务规则统计信息
   */
  async getOrganizationBusinessRuleStatistics(): Promise<{
    readonly totalRules: number;
    readonly rulesByType: Record<OrganizationBusinessRuleType, number>;
    readonly rulesByPriority: Record<OrganizationBusinessRulePriority, number>;
    readonly totalExecutions: number;
    readonly successfulExecutions: number;
    readonly failedExecutions: number;
    readonly averageExecutionTime: number;
    readonly successRate: number;
  }> {
    this.logger.log(
      `Getting organization business rule statistics`,
      this.context,
    );

    const totalRules = this.rules.size;
    const rulesByType: Record<OrganizationBusinessRuleType, number> =
      {} as Record<OrganizationBusinessRuleType, number>;
    const rulesByPriority: Record<OrganizationBusinessRulePriority, number> =
      {} as Record<OrganizationBusinessRulePriority, number>;

    // 初始化统计
    for (const type of Object.values(OrganizationBusinessRuleType)) {
      rulesByType[type] = 0;
    }
    for (const priority of Object.values(OrganizationBusinessRulePriority)) {
      rulesByPriority[priority] = 0;
    }

    // 统计规则
    for (const rule of this.rules.values()) {
      rulesByType[rule.type]++;
      rulesByPriority[rule.priority]++;
    }

    // 统计执行历史
    const totalExecutions = this.executionHistory.length;
    const successfulExecutions = this.executionHistory.filter((h) =>
      h.results.every((r) => r.result.success),
    ).length;
    const failedExecutions = totalExecutions - successfulExecutions;
    const successRate =
      totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    // 计算平均执行时间
    const totalExecutionTime = this.executionHistory.reduce(
      (sum, h) =>
        sum + h.results.reduce((ruleSum, r) => ruleSum + r.executionTime, 0),
      0,
    );
    const averageExecutionTime =
      totalExecutions > 0 ? totalExecutionTime / totalExecutions : 0;

    const result = {
      totalRules,
      rulesByType,
      rulesByPriority,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
      successRate,
    };

    this.logger.log(
      `Organization business rule statistics generated: ${totalRules} rules, ${totalExecutions} executions, ${(successRate * 100).toFixed(2)}% success rate`,
      this.context,
    );

    return result;
  }

  /**
   * 获取执行历史
   *
   * @param limit - 限制数量
   * @returns 执行历史列表
   */
  async getExecutionHistory(limit: number = 100): Promise<
    readonly {
      readonly timestamp: Date;
      readonly context: OrganizationBusinessRuleContext;
      readonly results: readonly {
        readonly ruleId: string;
        readonly ruleName: string;
        readonly executed: boolean;
        readonly result: OrganizationBusinessRuleResult;
        readonly executionTime: number;
      }[];
    }[]
  > {
    this.logger.log(
      `Getting execution history with limit: ${limit}`,
      this.context,
    );

    const history = this.executionHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    this.logger.log(
      `Retrieved ${history.length} execution history entries`,
      this.context,
    );

    return history;
  }

  /**
   * 获取组织业务规则列表
   *
   * @param type - 规则类型（可选）
   * @param priority - 规则优先级（可选）
   * @returns 组织业务规则列表
   */
  async getRules(
    type?: OrganizationBusinessRuleType,
    priority?: OrganizationBusinessRulePriority,
  ): Promise<readonly OrganizationBusinessRule[]> {
    this.logger.log(
      `Getting organization business rules: type=${type}, priority=${priority}`,
      this.context,
    );

    let rules = Array.from(this.rules.values());

    if (type) {
      rules = rules.filter((rule) => rule.type === type);
    }

    if (priority) {
      rules = rules.filter((rule) => rule.priority === priority);
    }

    this.logger.log(
      `Retrieved ${rules.length} organization business rules`,
      this.context,
    );

    return rules;
  }

  /**
   * 初始化默认组织业务规则
   */
  private initializeDefaultRules(): void {
    // 组织创建规则
    this.addRule({
      id: "organization-creation-name-validation",
      name: "Organization Creation Name Validation",
      type: OrganizationBusinessRuleType.CREATION,
      priority: OrganizationBusinessRulePriority.HIGH,
      description: "Validates organization name during creation",
      condition: async (context) => {
        return context.operation === "CREATE_ORGANIZATION";
      },
      action: async (context) => {
        const name = context.data.name;
        if (!name || typeof name !== "string" || name.trim() === "") {
          return {
            success: false,
            message: "Organization name is required",
            errors: ["Organization name is required"],
          };
        }

        if (name.length < 2 || name.length > 100) {
          return {
            success: false,
            message: "Organization name must be between 2 and 100 characters",
            errors: ["Organization name must be between 2 and 100 characters"],
          };
        }

        return {
          success: true,
          message: "Organization name validation passed",
        };
      },
    });

    // 组织类型验证规则
    this.addRule({
      id: "organization-type-validation",
      name: "Organization Type Validation",
      type: OrganizationBusinessRuleType.CREATION,
      priority: OrganizationBusinessRulePriority.HIGH,
      description: "Validates organization type during creation",
      condition: async (context) => {
        return context.operation === "CREATE_ORGANIZATION";
      },
      action: async (context) => {
        const type = context.data.type;
        const validTypes = [
          "Committee",
          "Project Team",
          "Quality Group",
          "Performance Group",
        ];

        if (!type || typeof type !== "string") {
          return {
            success: false,
            message: "Organization type is required",
            errors: ["Organization type is required"],
          };
        }

        if (!validTypes.includes(type)) {
          return {
            success: false,
            message: `Invalid organization type. Must be one of: ${validTypes.join(", ")}`,
            errors: [
              `Invalid organization type. Must be one of: ${validTypes.join(", ")}`,
            ],
          };
        }

        return {
          success: true,
          message: "Organization type validation passed",
        };
      },
    });

    // 组织成员管理规则
    this.addRule({
      id: "organization-member-management",
      name: "Organization Member Management",
      type: OrganizationBusinessRuleType.MEMBER_MANAGEMENT,
      priority: OrganizationBusinessRulePriority.HIGH,
      description: "Validates organization member management operations",
      condition: async (context) => {
        return (
          context.operation === "ADD_ORGANIZATION_MEMBER" ||
          context.operation === "REMOVE_ORGANIZATION_MEMBER"
        );
      },
      action: async (context) => {
        const userId = context.userId;
        const organizationId = context.organizationId;

        if (!userId) {
          return {
            success: false,
            message: "User ID is required for member management",
            errors: ["User ID is required for member management"],
          };
        }

        if (!organizationId) {
          return {
            success: false,
            message: "Organization ID is required for member management",
            errors: ["Organization ID is required for member management"],
          };
        }

        return {
          success: true,
          message: "Organization member management validation passed",
        };
      },
    });

    // 组织角色分配规则
    this.addRule({
      id: "organization-role-assignment",
      name: "Organization Role Assignment",
      type: OrganizationBusinessRuleType.ROLE_ASSIGNMENT,
      priority: OrganizationBusinessRulePriority.HIGH,
      description: "Validates organization role assignment",
      condition: async (context) => {
        return context.operation === "ASSIGN_ORGANIZATION_ROLE";
      },
      action: async (context) => {
        const role = context.data.role;
        const userId = context.userId;

        if (!role || typeof role !== "string") {
          return {
            success: false,
            message: "Role is required for assignment",
            errors: ["Role is required for assignment"],
          };
        }

        if (!userId) {
          return {
            success: false,
            message: "User ID is required for role assignment",
            errors: ["User ID is required for role assignment"],
          };
        }

        const validRoles = ["Admin", "Member", "Viewer"];
        if (!validRoles.includes(role)) {
          return {
            success: false,
            message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
            errors: [`Invalid role. Must be one of: ${validRoles.join(", ")}`],
          };
        }

        return {
          success: true,
          message: "Organization role assignment validation passed",
        };
      },
    });

    // 组织删除规则
    this.addRule({
      id: "organization-deletion-validation",
      name: "Organization Deletion Validation",
      type: OrganizationBusinessRuleType.DELETION,
      priority: OrganizationBusinessRulePriority.CRITICAL,
      description: "Validates organization deletion requirements",
      condition: async (context) => {
        return context.operation === "DELETE_ORGANIZATION";
      },
      action: async (context) => {
        const organizationId = context.organizationId;
        if (!organizationId) {
          return {
            success: false,
            message: "Organization ID is required for deletion",
            errors: ["Organization ID is required for deletion"],
          };
        }

        // 检查组织是否有活跃的部门
        const hasActiveDepartments = context.data.hasActiveDepartments;
        if (hasActiveDepartments) {
          return {
            success: false,
            message: "Organization with active departments cannot be deleted",
            errors: ["Organization with active departments cannot be deleted"],
          };
        }

        // 检查组织是否有活跃的成员
        const hasActiveMembers = context.data.hasActiveMembers;
        if (hasActiveMembers) {
          return {
            success: false,
            message: "Organization with active members cannot be deleted",
            errors: ["Organization with active members cannot be deleted"],
          };
        }

        return {
          success: true,
          message: "Organization deletion validation passed",
        };
      },
    });

    // 组织层次结构管理规则
    this.addRule({
      id: "organization-hierarchy-management",
      name: "Organization Hierarchy Management",
      type: OrganizationBusinessRuleType.HIERARCHY_MANAGEMENT,
      priority: OrganizationBusinessRulePriority.NORMAL,
      description: "Validates organization hierarchy management",
      condition: async (context) => {
        return context.operation === "UPDATE_ORGANIZATION_HIERARCHY";
      },
      action: async (context) => {
        const hierarchy = context.data.hierarchy;
        if (!hierarchy || typeof hierarchy !== "object") {
          return {
            success: false,
            message: "Organization hierarchy is required",
            errors: ["Organization hierarchy is required"],
          };
        }

        // 验证层次结构的完整性
        const { parentId, children } = hierarchy;
        if (parentId && typeof parentId !== "string") {
          return {
            success: false,
            message: "Parent ID must be a string",
            errors: ["Parent ID must be a string"],
          };
        }

        if (children && !Array.isArray(children)) {
          return {
            success: false,
            message: "Children must be an array",
            errors: ["Children must be an array"],
          };
        }

        return {
          success: true,
          message: "Organization hierarchy management validation passed",
        };
      },
    });
  }
}
