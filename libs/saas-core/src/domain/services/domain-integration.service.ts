/**
 * 领域集成服务
 *
 * @description 处理领域层集成，包括组件协调、依赖管理、集成验证等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { DomainService } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import { OrganizationId } from "@hl8/domain-kernel";
import { DepartmentId } from "@hl8/domain-kernel";
import { UserId } from "@hl8/domain-kernel";

/**
 * 集成组件类型枚举
 */
export enum IntegrationComponentType {
  VALUE_OBJECT = "VALUE_OBJECT",
  DOMAIN_SERVICE = "DOMAIN_SERVICE",
  AGGREGATE = "AGGREGATE",
  DOMAIN_EVENT = "DOMAIN_EVENT",
  BUSINESS_RULE = "BUSINESS_RULE",
  VALIDATION_RULE = "VALIDATION_RULE",
}

/**
 * 集成状态枚举
 */
export enum IntegrationStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  ROLLED_BACK = "ROLLED_BACK",
}

/**
 * 集成组件接口
 */
export interface IntegrationComponent {
  readonly id: string;
  readonly type: IntegrationComponentType;
  readonly name: string;
  readonly version: string;
  readonly dependencies: readonly string[];
  readonly status: IntegrationStatus;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 集成验证结果接口
 */
export interface IntegrationValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly suggestions: readonly string[];
  readonly componentStatus: Record<string, IntegrationStatus>;
}

/**
 * 集成报告接口
 */
export interface IntegrationReport {
  readonly summary: {
    readonly totalComponents: number;
    readonly completedComponents: number;
    readonly failedComponents: number;
    readonly integrationHealth:
      | "EXCELLENT"
      | "GOOD"
      | "FAIR"
      | "POOR"
      | "CRITICAL";
  };
  readonly components: readonly IntegrationComponent[];
  readonly dependencies: Record<string, readonly string[]>;
  readonly recommendations: readonly string[];
}

/**
 * 领域集成服务
 *
 * 领域集成服务负责处理领域层集成，包括组件协调、依赖管理、集成验证等。
 * 支持多种集成组件类型，提供统一的集成管理接口。
 *
 * @example
 * ```typescript
 * const service = new DomainIntegrationService();
 * await service.registerComponent(component);
 * const result = await service.validateIntegration();
 * ```
 */
@Injectable()
export class DomainIntegrationService extends DomainService {
  private readonly components: Map<string, IntegrationComponent> = new Map();
  private readonly dependencies: Map<string, string[]> = new Map();
  private readonly integrationHistory: Array<{
    readonly timestamp: Date;
    readonly action: string;
    readonly componentId: string;
    readonly status: IntegrationStatus;
  }> = [];

  constructor() {
    super();
    this.setContext("DomainIntegrationService");
  }

  /**
   * 注册集成组件
   *
   * @param component - 集成组件
   * @returns 是否注册成功
   */
  async registerComponent(component: IntegrationComponent): Promise<boolean> {
    this.logger.log(
      `Registering integration component: ${component.name} (${component.type})`,
      this.context,
    );

    if (this.components.has(component.id)) {
      throw new Error(`Component ${component.id} already registered`);
    }

    this.components.set(component.id, component);
    this.dependencies.set(component.id, [...component.dependencies]);

    this.recordIntegrationAction(
      "REGISTER",
      component.id,
      IntegrationStatus.PENDING,
    );

    this.logger.log(
      `Integration component ${component.name} registered successfully`,
      this.context,
    );

    return true;
  }

  /**
   * 获取集成组件
   *
   * @param componentId - 组件ID
   * @returns 集成组件或undefined
   */
  async getComponent(
    componentId: string,
  ): Promise<IntegrationComponent | undefined> {
    this.logger.log(
      `Getting integration component: ${componentId}`,
      this.context,
    );

    const component = this.components.get(componentId);

    this.logger.log(
      `Integration component ${componentId} ${component ? "found" : "not found"}`,
      this.context,
    );

    return component;
  }

  /**
   * 更新组件状态
   *
   * @param componentId - 组件ID
   * @param status - 新状态
   * @returns 是否更新成功
   */
  async updateComponentStatus(
    componentId: string,
    status: IntegrationStatus,
  ): Promise<boolean> {
    this.logger.log(
      `Updating component status: ${componentId} -> ${status}`,
      this.context,
    );

    const component = this.components.get(componentId);
    if (!component) {
      throw new Error(`Component ${componentId} not found`);
    }

    const updatedComponent: IntegrationComponent = {
      ...component,
      status,
    };

    this.components.set(componentId, updatedComponent);
    this.recordIntegrationAction("UPDATE_STATUS", componentId, status);

    this.logger.log(
      `Component status updated: ${componentId} -> ${status}`,
      this.context,
    );

    return true;
  }

  /**
   * 验证集成
   *
   * @returns 集成验证结果
   */
  async validateIntegration(): Promise<IntegrationValidationResult> {
    this.logger.log(`Validating domain integration`, this.context);

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const componentStatus: Record<string, IntegrationStatus> = {};

    // 验证所有组件
    for (const [componentId, component] of this.components.entries()) {
      componentStatus[componentId] = component.status;

      // 验证依赖关系
      const dependencyErrors = await this.validateDependencies(component);
      errors.push(...dependencyErrors);

      // 验证组件状态
      if (component.status === IntegrationStatus.FAILED) {
        errors.push(`Component ${component.name} has failed status`);
      }

      // 检查组件完整性
      const integrityWarnings = await this.checkComponentIntegrity(component);
      warnings.push(...integrityWarnings);
    }

    // 验证循环依赖
    const cycleErrors = this.detectCyclicDependencies();
    errors.push(...cycleErrors);

    // 验证集成完整性
    const integrationWarnings = await this.checkIntegrationIntegrity();
    warnings.push(...integrationWarnings);

    // 生成建议
    if (errors.length === 0 && warnings.length === 0) {
      suggestions.push(
        "Integration is healthy and all components are properly integrated",
      );
    } else {
      suggestions.push("Review and fix the identified issues");
      suggestions.push("Consider updating component dependencies");
    }

    const result: IntegrationValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      componentStatus,
    };

    this.logger.log(
      `Integration validation completed: ${errors.length} errors, ${warnings.length} warnings`,
      this.context,
    );

    return result;
  }

  /**
   * 生成集成报告
   *
   * @returns 集成报告
   */
  async generateIntegrationReport(): Promise<IntegrationReport> {
    this.logger.log(`Generating integration report`, this.context);

    const components = Array.from(this.components.values());
    const totalComponents = components.length;
    const completedComponents = components.filter(
      (c) => c.status === IntegrationStatus.COMPLETED,
    ).length;
    const failedComponents = components.filter(
      (c) => c.status === IntegrationStatus.FAILED,
    ).length;

    // 计算集成健康度
    const healthScore = this.calculateIntegrationHealth(components);
    const integrationHealth = this.determineIntegrationHealth(healthScore);

    // 构建依赖关系图
    const dependencies: Record<string, readonly string[]> = {};
    for (const [componentId, deps] of this.dependencies.entries()) {
      dependencies[componentId] = deps;
    }

    // 生成建议
    const recommendations =
      await this.generateIntegrationRecommendations(components);

    const report: IntegrationReport = {
      summary: {
        totalComponents,
        completedComponents,
        failedComponents,
        integrationHealth,
      },
      components,
      dependencies,
      recommendations,
    };

    this.logger.log(
      `Integration report generated: ${totalComponents} components, ${completedComponents} completed, ${failedComponents} failed`,
      this.context,
    );

    return report;
  }

  /**
   * 获取组件依赖关系
   *
   * @param componentId - 组件ID
   * @returns 依赖关系列表
   */
  async getComponentDependencies(
    componentId: string,
  ): Promise<readonly string[]> {
    this.logger.log(
      `Getting dependencies for component: ${componentId}`,
      this.context,
    );

    const dependencies = this.dependencies.get(componentId) || [];

    this.logger.log(
      `Component ${componentId} has ${dependencies.length} dependencies`,
      this.context,
    );

    return dependencies;
  }

  /**
   * 获取依赖组件的组件列表
   *
   * @param componentId - 组件ID
   * @returns 依赖此组件的组件列表
   */
  async getDependentComponents(
    componentId: string,
  ): Promise<readonly string[]> {
    this.logger.log(
      `Getting dependent components for: ${componentId}`,
      this.context,
    );

    const dependents: string[] = [];

    for (const [id, deps] of this.dependencies.entries()) {
      if (deps.includes(componentId)) {
        dependents.push(id);
      }
    }

    this.logger.log(
      `Found ${dependents.length} components dependent on ${componentId}`,
      this.context,
    );

    return dependents;
  }

  /**
   * 获取集成历史
   *
   * @param limit - 限制数量
   * @returns 集成历史列表
   */
  async getIntegrationHistory(limit: number = 100): Promise<
    readonly {
      readonly timestamp: Date;
      readonly action: string;
      readonly componentId: string;
      readonly status: IntegrationStatus;
    }[]
  > {
    this.logger.log(
      `Getting integration history with limit: ${limit}`,
      this.context,
    );

    const history = this.integrationHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    this.logger.log(
      `Retrieved ${history.length} integration history entries`,
      this.context,
    );

    return history;
  }

  /**
   * 验证依赖关系
   *
   * @param component - 集成组件
   * @returns 依赖验证错误
   */
  private async validateDependencies(
    component: IntegrationComponent,
  ): Promise<string[]> {
    const errors: string[] = [];

    for (const depId of component.dependencies) {
      const depComponent = this.components.get(depId);
      if (!depComponent) {
        errors.push(
          `Component ${component.name} depends on non-existent component ${depId}`,
        );
      } else if (depComponent.status !== IntegrationStatus.COMPLETED) {
        errors.push(
          `Component ${component.name} depends on incomplete component ${depComponent.name}`,
        );
      }
    }

    return errors;
  }

  /**
   * 检查组件完整性
   *
   * @param component - 集成组件
   * @returns 完整性警告
   */
  private async checkComponentIntegrity(
    component: IntegrationComponent,
  ): Promise<string[]> {
    const warnings: string[] = [];

    if (!component.name || component.name.trim() === "") {
      warnings.push(`Component ${component.id} has empty name`);
    }

    if (!component.version || component.version.trim() === "") {
      warnings.push(`Component ${component.id} has empty version`);
    }

    if (
      component.dependencies.length === 0 &&
      component.type !== IntegrationComponentType.VALUE_OBJECT
    ) {
      warnings.push(
        `Component ${component.name} has no dependencies but is not a value object`,
      );
    }

    return warnings;
  }

  /**
   * 检测循环依赖
   *
   * @returns 循环依赖错误
   */
  private detectCyclicDependencies(): string[] {
    const errors: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const componentId of this.components.keys()) {
      if (!visited.has(componentId)) {
        const cycle = this.detectCycleFromComponent(
          componentId,
          visited,
          recursionStack,
        );
        if (cycle.length > 0) {
          errors.push(`Circular dependency detected: ${cycle.join(" -> ")}`);
        }
      }
    }

    return errors;
  }

  /**
   * 从指定组件检测循环依赖
   *
   * @param componentId - 组件ID
   * @param visited - 已访问的组件
   * @param recursionStack - 递归栈
   * @returns 循环路径
   */
  private detectCycleFromComponent(
    componentId: string,
    visited: Set<string>,
    recursionStack: Set<string>,
  ): string[] {
    if (recursionStack.has(componentId)) {
      return [componentId];
    }

    if (visited.has(componentId)) {
      return [];
    }

    visited.add(componentId);
    recursionStack.add(componentId);

    const dependencies = this.dependencies.get(componentId) || [];
    for (const depId of dependencies) {
      const cycle = this.detectCycleFromComponent(
        depId,
        visited,
        recursionStack,
      );
      if (cycle.length > 0) {
        cycle.push(componentId);
        return cycle;
      }
    }

    recursionStack.delete(componentId);
    return [];
  }

  /**
   * 检查集成完整性
   *
   * @returns 集成完整性警告
   */
  private async checkIntegrationIntegrity(): Promise<string[]> {
    const warnings: string[] = [];

    const components = Array.from(this.components.values());
    const valueObjects = components.filter(
      (c) => c.type === IntegrationComponentType.VALUE_OBJECT,
    );
    const domainServices = components.filter(
      (c) => c.type === IntegrationComponentType.DOMAIN_SERVICE,
    );
    const aggregates = components.filter(
      (c) => c.type === IntegrationComponentType.AGGREGATE,
    );
    const domainEvents = components.filter(
      (c) => c.type === IntegrationComponentType.DOMAIN_EVENT,
    );

    // 检查组件类型分布
    if (valueObjects.length === 0) {
      warnings.push("No value objects found in integration");
    }

    if (domainServices.length === 0) {
      warnings.push("No domain services found in integration");
    }

    if (aggregates.length === 0) {
      warnings.push("No aggregates found in integration");
    }

    if (domainEvents.length === 0) {
      warnings.push("No domain events found in integration");
    }

    return warnings;
  }

  /**
   * 计算集成健康度
   *
   * @param components - 组件列表
   * @returns 健康度分数
   */
  private calculateIntegrationHealth(
    components: IntegrationComponent[],
  ): number {
    if (components.length === 0) {
      return 0;
    }

    const completedCount = components.filter(
      (c) => c.status === IntegrationStatus.COMPLETED,
    ).length;
    const failedCount = components.filter(
      (c) => c.status === IntegrationStatus.FAILED,
    ).length;
    const inProgressCount = components.filter(
      (c) => c.status === IntegrationStatus.IN_PROGRESS,
    ).length;

    const completionRate = completedCount / components.length;
    const failureRate = failedCount / components.length;
    const progressRate = inProgressCount / components.length;

    return completionRate * 0.6 + progressRate * 0.3 - failureRate * 0.1;
  }

  /**
   * 确定集成健康度
   *
   * @param healthScore - 健康度分数
   * @returns 集成健康度
   */
  private determineIntegrationHealth(
    healthScore: number,
  ): "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "CRITICAL" {
    if (healthScore >= 0.9) {
      return "EXCELLENT";
    } else if (healthScore >= 0.7) {
      return "GOOD";
    } else if (healthScore >= 0.5) {
      return "FAIR";
    } else if (healthScore >= 0.3) {
      return "POOR";
    } else {
      return "CRITICAL";
    }
  }

  /**
   * 生成集成建议
   *
   * @param components - 组件列表
   * @returns 建议列表
   */
  private async generateIntegrationRecommendations(
    components: IntegrationComponent[],
  ): Promise<readonly string[]> {
    const recommendations: string[] = [];

    const failedComponents = components.filter(
      (c) => c.status === IntegrationStatus.FAILED,
    );
    if (failedComponents.length > 0) {
      recommendations.push(
        `Address ${failedComponents.length} failed components to improve integration health`,
      );
    }

    const pendingComponents = components.filter(
      (c) => c.status === IntegrationStatus.PENDING,
    );
    if (pendingComponents.length > 0) {
      recommendations.push(
        `Process ${pendingComponents.length} pending components to complete integration`,
      );
    }

    const inProgressComponents = components.filter(
      (c) => c.status === IntegrationStatus.IN_PROGRESS,
    );
    if (inProgressComponents.length > 0) {
      recommendations.push(
        `Monitor ${inProgressComponents.length} components currently in progress`,
      );
    }

    if (components.length === 0) {
      recommendations.push("Register domain components to start integration");
    }

    return recommendations;
  }

  /**
   * 记录集成操作
   *
   * @param action - 操作
   * @param componentId - 组件ID
   * @param status - 状态
   */
  private recordIntegrationAction(
    action: string,
    componentId: string,
    status: IntegrationStatus,
  ): void {
    this.integrationHistory.push({
      timestamp: new Date(),
      action,
      componentId,
      status,
    });
  }
}
