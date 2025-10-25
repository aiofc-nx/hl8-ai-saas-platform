/**
 * 部门业务规则
 *
 * @description 处理部门相关的业务规则，包括部门创建、更新、删除、层次结构管理等业务规则
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { DomainService } from "@hl8/domain-kernel";
import { TenantId } from "../value-objects/tenant-id.vo.js";
import { OrganizationId } from "../value-objects/organization-id.vo.js";
import { DepartmentId } from "../value-objects/department-id.vo.js";
import { UserId } from "../value-objects/user-id.vo.js";

/**
 * 部门业务规则类型枚举
 */
export enum DepartmentBusinessRuleType {
  CREATION = "CREATION",
  UPDATE = "UPDATE",
  DELETION = "DELETION",
  HIERARCHY_MANAGEMENT = "HIERARCHY_MANAGEMENT",
  LEVEL_VALIDATION = "LEVEL_VALIDATION",
  PARENT_CHILD_RELATIONSHIP = "PARENT_CHILD_RELATIONSHIP",
  MEMBER_MANAGEMENT = "MEMBER_MANAGEMENT",
  NAMING = "NAMING",
}

/**
 * 部门业务规则优先级枚举
 */
export enum DepartmentBusinessRulePriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * 部门业务规则上下文接口
 */
export interface DepartmentBusinessRuleContext {
  readonly tenantId?: TenantId;
  readonly organizationId?: OrganizationId;
  readonly departmentId?: DepartmentId;
  readonly parentDepartmentId?: DepartmentId;
  readonly userId?: UserId;
  readonly operation: string;
  readonly data: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 部门业务规则结果接口
 */
export interface DepartmentBusinessRuleResult {
  readonly success: boolean;
  readonly message: string;
  readonly data?: Record<string, unknown>;
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

/**
 * 部门业务规则接口
 */
export interface DepartmentBusinessRule {
  readonly id: string;
  readonly name: string;
  readonly type: DepartmentBusinessRuleType;
  readonly priority: DepartmentBusinessRulePriority;
  readonly description: string;
  readonly condition: (
    context: DepartmentBusinessRuleContext,
  ) => Promise<boolean>;
  readonly action: (
    context: DepartmentBusinessRuleContext,
  ) => Promise<DepartmentBusinessRuleResult>;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 部门业务规则
 *
 * 部门业务规则负责处理部门相关的业务规则，包括部门创建、更新、删除、层次结构管理等业务规则。
 * 支持多种业务规则类型和优先级，提供统一的部门业务规则管理接口。
 *
 * @example
 * ```typescript
 * const rules = new DepartmentBusinessRules();
 * await rules.addRule(rule);
 * const result = await rules.executeRules(context);
 * ```
 */
@Injectable()
export class DepartmentBusinessRules extends DomainService {
  private readonly rules: Map<string, DepartmentBusinessRule> = new Map();
  private readonly executionHistory: Array<{
    readonly timestamp: Date;
    readonly context: DepartmentBusinessRuleContext;
    readonly results: readonly {
      readonly ruleId: string;
      readonly ruleName: string;
      readonly executed: boolean;
      readonly result: DepartmentBusinessRuleResult;
      readonly executionTime: number;
    }[];
  }> = [];

  constructor() {
    super();
    this.setContext("DepartmentBusinessRules");
    this.initializeDefaultRules();
  }

  /**
   * 添加部门业务规则
   *
   * @param rule - 部门业务规则
   * @returns 是否添加成功
   */
  async addRule(rule: DepartmentBusinessRule): Promise<boolean> {
    this.logger.log(
      `Adding department business rule: ${rule.name} (${rule.type})`,
      this.context,
    );

    if (this.rules.has(rule.id)) {
      throw new Error(`Department business rule ${rule.id} already exists`);
    }

    this.rules.set(rule.id, rule);

    this.logger.log(
      `Department business rule ${rule.name} added successfully`,
      this.context,
    );

    return true;
  }

  /**
   * 获取部门业务规则
   *
   * @param ruleId - 规则ID
   * @returns 部门业务规则或undefined
   */
  async getRule(ruleId: string): Promise<DepartmentBusinessRule | undefined> {
    this.logger.log(
      `Getting department business rule: ${ruleId}`,
      this.context,
    );

    const rule = this.rules.get(ruleId);

    this.logger.log(
      `Department business rule ${ruleId} ${rule ? "found" : "not found"}`,
      this.context,
    );

    return rule;
  }

  /**
   * 执行部门业务规则
   *
   * @param context - 部门业务规则上下文
   * @param ruleIds - 规则ID列表（可选）
   * @returns 部门业务规则执行结果
   */
  async executeRules(
    context: DepartmentBusinessRuleContext,
    ruleIds?: readonly string[],
  ): Promise<
    readonly {
      readonly ruleId: string;
      readonly ruleName: string;
      readonly executed: boolean;
      readonly result: DepartmentBusinessRuleResult;
      readonly executionTime: number;
    }[]
  > {
    this.logger.log(
      `Executing department business rules for context: ${context.operation}`,
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
        [DepartmentBusinessRulePriority.CRITICAL]: 4,
        [DepartmentBusinessRulePriority.HIGH]: 3,
        [DepartmentBusinessRulePriority.NORMAL]: 2,
        [DepartmentBusinessRulePriority.LOW]: 1,
      };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const results: Array<{
      readonly ruleId: string;
      readonly ruleName: string;
      readonly executed: boolean;
      readonly result: DepartmentBusinessRuleResult;
      readonly executionTime: number;
    }> = [];

    for (const rule of rulesToExecute) {
      const startTime = Date.now();
      let executed = false;
      let result: DepartmentBusinessRuleResult;

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
          `Error executing department business rule ${rule.name}: ${error.message}`,
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
      `Department business rules execution completed: ${results.length} rules executed`,
      this.context,
    );

    return results;
  }

  /**
   * 获取部门业务规则统计信息
   *
   * @returns 部门业务规则统计信息
   */
  async getDepartmentBusinessRuleStatistics(): Promise<{
    readonly totalRules: number;
    readonly rulesByType: Record<DepartmentBusinessRuleType, number>;
    readonly rulesByPriority: Record<DepartmentBusinessRulePriority, number>;
    readonly totalExecutions: number;
    readonly successfulExecutions: number;
    readonly failedExecutions: number;
    readonly averageExecutionTime: number;
    readonly successRate: number;
  }> {
    this.logger.log(
      `Getting department business rule statistics`,
      this.context,
    );

    const totalRules = this.rules.size;
    const rulesByType: Record<DepartmentBusinessRuleType, number> =
      {} as Record<DepartmentBusinessRuleType, number>;
    const rulesByPriority: Record<DepartmentBusinessRulePriority, number> =
      {} as Record<DepartmentBusinessRulePriority, number>;

    // 初始化统计
    for (const type of Object.values(DepartmentBusinessRuleType)) {
      rulesByType[type] = 0;
    }
    for (const priority of Object.values(DepartmentBusinessRulePriority)) {
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
      `Department business rule statistics generated: ${totalRules} rules, ${totalExecutions} executions, ${(successRate * 100).toFixed(2)}% success rate`,
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
      readonly context: DepartmentBusinessRuleContext;
      readonly results: readonly {
        readonly ruleId: string;
        readonly ruleName: string;
        readonly executed: boolean;
        readonly result: DepartmentBusinessRuleResult;
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
   * 获取部门业务规则列表
   *
   * @param type - 规则类型（可选）
   * @param priority - 规则优先级（可选）
   * @returns 部门业务规则列表
   */
  async getRules(
    type?: DepartmentBusinessRuleType,
    priority?: DepartmentBusinessRulePriority,
  ): Promise<readonly DepartmentBusinessRule[]> {
    this.logger.log(
      `Getting department business rules: type=${type}, priority=${priority}`,
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
      `Retrieved ${rules.length} department business rules`,
      this.context,
    );

    return rules;
  }

  /**
   * 初始化默认部门业务规则
   */
  private initializeDefaultRules(): void {
    // 部门创建规则
    this.addRule({
      id: "department-creation-name-validation",
      name: "Department Creation Name Validation",
      type: DepartmentBusinessRuleType.CREATION,
      priority: DepartmentBusinessRulePriority.HIGH,
      description: "Validates department name during creation",
      condition: async (context) => {
        return context.operation === "CREATE_DEPARTMENT";
      },
      action: async (context) => {
        const name = context.data.name;
        if (!name || typeof name !== "string" || name.trim() === "") {
          return {
            success: false,
            message: "Department name is required",
            errors: ["Department name is required"],
          };
        }

        if (name.length < 2 || name.length > 100) {
          return {
            success: false,
            message: "Department name must be between 2 and 100 characters",
            errors: ["Department name must be between 2 and 100 characters"],
          };
        }

        return {
          success: true,
          message: "Department name validation passed",
        };
      },
    });

    // 部门层级验证规则
    this.addRule({
      id: "department-level-validation",
      name: "Department Level Validation",
      type: DepartmentBusinessRuleType.LEVEL_VALIDATION,
      priority: DepartmentBusinessRulePriority.CRITICAL,
      description: "Validates department level constraints",
      condition: async (context) => {
        return (
          context.operation === "CREATE_DEPARTMENT" ||
          context.operation === "UPDATE_DEPARTMENT_LEVEL"
        );
      },
      action: async (context) => {
        const level = context.data.level;
        const parentId = context.data.parentId;

        if (typeof level !== "number" || level < 1 || level > 7) {
          return {
            success: false,
            message: "Department level must be between 1 and 7",
            errors: ["Department level must be between 1 and 7"],
          };
        }

        // 如果层级大于1，必须有父部门
        if (level > 1 && !parentId) {
          return {
            success: false,
            message: "Parent department is required for levels 2-7",
            errors: ["Parent department is required for levels 2-7"],
          };
        }

        // 如果层级为1，不能有父部门
        if (level === 1 && parentId) {
          return {
            success: false,
            message: "Level 1 departments cannot have parent departments",
            errors: ["Level 1 departments cannot have parent departments"],
          };
        }

        return {
          success: true,
          message: "Department level validation passed",
        };
      },
    });

    // 部门父子关系验证规则
    this.addRule({
      id: "department-parent-child-relationship",
      name: "Department Parent-Child Relationship",
      type: DepartmentBusinessRuleType.PARENT_CHILD_RELATIONSHIP,
      priority: DepartmentBusinessRulePriority.HIGH,
      description: "Validates department parent-child relationships",
      condition: async (context) => {
        return (
          context.operation === "CREATE_DEPARTMENT" ||
          context.operation === "UPDATE_DEPARTMENT_PARENT"
        );
      },
      action: async (context) => {
        const parentId = context.data.parentId;
        const departmentId = context.departmentId;

        if (parentId && departmentId && parentId === departmentId) {
          return {
            success: false,
            message: "Department cannot be its own parent",
            errors: ["Department cannot be its own parent"],
          };
        }

        // 检查循环引用（这里需要实际的数据查询，简化处理）
        const hasCircularReference = context.data.hasCircularReference;
        if (hasCircularReference) {
          return {
            success: false,
            message: "Circular reference detected in department hierarchy",
            errors: ["Circular reference detected in department hierarchy"],
          };
        }

        return {
          success: true,
          message: "Department parent-child relationship validation passed",
        };
      },
    });

    // 部门层次结构管理规则
    this.addRule({
      id: "department-hierarchy-management",
      name: "Department Hierarchy Management",
      type: DepartmentBusinessRuleType.HIERARCHY_MANAGEMENT,
      priority: DepartmentBusinessRulePriority.HIGH,
      description: "Validates department hierarchy management operations",
      condition: async (context) => {
        return context.operation === "UPDATE_DEPARTMENT_HIERARCHY";
      },
      action: async (context) => {
        const hierarchy = context.data.hierarchy;
        if (!hierarchy || typeof hierarchy !== "object") {
          return {
            success: false,
            message: "Department hierarchy is required",
            errors: ["Department hierarchy is required"],
          };
        }

        const { maxDepth, maxChildren } = hierarchy;
        if (
          maxDepth &&
          (typeof maxDepth !== "number" || maxDepth < 1 || maxDepth > 7)
        ) {
          return {
            success: false,
            message: "Max depth must be between 1 and 7",
            errors: ["Max depth must be between 1 and 7"],
          };
        }

        if (
          maxChildren &&
          (typeof maxChildren !== "number" || maxChildren < 1)
        ) {
          return {
            success: false,
            message: "Max children must be a positive number",
            errors: ["Max children must be a positive number"],
          };
        }

        return {
          success: true,
          message: "Department hierarchy management validation passed",
        };
      },
    });

    // 部门删除规则
    this.addRule({
      id: "department-deletion-validation",
      name: "Department Deletion Validation",
      type: DepartmentBusinessRuleType.DELETION,
      priority: DepartmentBusinessRulePriority.CRITICAL,
      description: "Validates department deletion requirements",
      condition: async (context) => {
        return context.operation === "DELETE_DEPARTMENT";
      },
      action: async (context) => {
        const departmentId = context.departmentId;
        if (!departmentId) {
          return {
            success: false,
            message: "Department ID is required for deletion",
            errors: ["Department ID is required for deletion"],
          };
        }

        // 检查部门是否有子部门
        const hasChildDepartments = context.data.hasChildDepartments;
        if (hasChildDepartments) {
          return {
            success: false,
            message: "Department with child departments cannot be deleted",
            errors: ["Department with child departments cannot be deleted"],
          };
        }

        // 检查部门是否有活跃的成员
        const hasActiveMembers = context.data.hasActiveMembers;
        if (hasActiveMembers) {
          return {
            success: false,
            message: "Department with active members cannot be deleted",
            errors: ["Department with active members cannot be deleted"],
          };
        }

        return {
          success: true,
          message: "Department deletion validation passed",
        };
      },
    });

    // 部门成员管理规则
    this.addRule({
      id: "department-member-management",
      name: "Department Member Management",
      type: DepartmentBusinessRuleType.MEMBER_MANAGEMENT,
      priority: DepartmentBusinessRulePriority.HIGH,
      description: "Validates department member management operations",
      condition: async (context) => {
        return (
          context.operation === "ADD_DEPARTMENT_MEMBER" ||
          context.operation === "REMOVE_DEPARTMENT_MEMBER"
        );
      },
      action: async (context) => {
        const userId = context.userId;
        const departmentId = context.departmentId;

        if (!userId) {
          return {
            success: false,
            message: "User ID is required for member management",
            errors: ["User ID is required for member management"],
          };
        }

        if (!departmentId) {
          return {
            success: false,
            message: "Department ID is required for member management",
            errors: ["Department ID is required for member management"],
          };
        }

        return {
          success: true,
          message: "Department member management validation passed",
        };
      },
    });
  }
}
