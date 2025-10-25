/**
 * 部门层次结构管理器
 *
 * @description 处理部门层次结构管理，包括层次结构构建、验证、查询等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { DomainService } from "@hl8/domain-kernel";
import {
  DepartmentLevelConfig,
  DepartmentLevelType,
} from "../value-objects/department-level-config.vo.js";
import { DepartmentId } from "@hl8/domain-kernel";
import { OrganizationId } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";

/**
 * 部门层次结构节点接口
 */
export interface DepartmentHierarchyNode {
  readonly id: DepartmentId;
  readonly name: string;
  readonly code: string;
  readonly level: number;
  readonly type: DepartmentLevelType;
  readonly parentId?: DepartmentId;
  readonly children: readonly DepartmentHierarchyNode[];
  readonly organizationId: OrganizationId;
  readonly tenantId: TenantId;
  readonly permissions: readonly string[];
  readonly constraints: readonly string[];
}

/**
 * 部门层次结构验证结果接口
 */
export interface DepartmentHierarchyValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly suggestions: readonly string[];
}

/**
 * 部门层次结构管理器
 *
 * 部门层次结构管理器负责处理部门层次结构管理，包括层次结构构建、验证、查询等。
 * 支持多级部门层次结构，包括根部门、分支部门、叶子部门等类型。
 *
 * @example
 * ```typescript
 * const manager = new DepartmentHierarchyManager();
 * const result = await manager.validateHierarchy(departments, configs);
 * if (result.isValid) {
 *   console.log("Hierarchy is valid");
 * }
 * ```
 */
@Injectable()
export class DepartmentHierarchyManager extends DomainService {
  constructor() {
    super();
    this.setContext("DepartmentHierarchyManager");
  }

  /**
   * 构建部门层次结构
   *
   * @param departments - 部门列表
   * @param configs - 层级配置列表
   * @returns 层次结构根节点
   */
  async buildHierarchy(
    departments: readonly {
      readonly id: DepartmentId;
      readonly name: string;
      readonly code: string;
      readonly level: number;
      readonly type: DepartmentLevelType;
      readonly parentId?: DepartmentId;
      readonly organizationId: OrganizationId;
      readonly tenantId: TenantId;
      readonly permissions: readonly string[];
      readonly constraints: readonly string[];
    }[],
    configs: readonly DepartmentLevelConfig[],
  ): Promise<DepartmentHierarchyNode | null> {
    this.logger.log(
      `Building department hierarchy for ${departments.length} departments`,
      this.context,
    );

    if (departments.length === 0) {
      return null;
    }

    // 找到根部门
    const rootDepartments = departments.filter((d) => !d.parentId);
    if (rootDepartments.length === 0) {
      throw new Error("No root departments found");
    }

    if (rootDepartments.length > 1) {
      throw new Error("Multiple root departments found");
    }

    const rootDepartment = rootDepartments[0];
    const rootNode = await this.buildNode(rootDepartment, departments, configs);

    this.logger.log(
      `Department hierarchy built successfully with root: ${rootNode.name}`,
      this.context,
    );

    return rootNode;
  }

  /**
   * 验证部门层次结构
   *
   * @param departments - 部门列表
   * @param configs - 层级配置列表
   * @returns 验证结果
   */
  async validateHierarchy(
    departments: readonly {
      readonly id: DepartmentId;
      readonly name: string;
      readonly code: string;
      readonly level: number;
      readonly type: DepartmentLevelType;
      readonly parentId?: DepartmentId;
      readonly organizationId: OrganizationId;
      readonly tenantId: TenantId;
      readonly permissions: readonly string[];
      readonly constraints: readonly string[];
    }[],
    configs: readonly DepartmentLevelConfig[],
  ): Promise<DepartmentHierarchyValidationResult> {
    this.logger.log(
      `Validating department hierarchy for ${departments.length} departments`,
      this.context,
    );

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 验证根部门
    const rootDepartments = departments.filter((d) => !d.parentId);
    if (rootDepartments.length === 0) {
      errors.push("No root departments found");
    } else if (rootDepartments.length > 1) {
      errors.push("Multiple root departments found");
    }

    // 验证每个部门
    for (const department of departments) {
      const config = configs.find((c) => c.level === department.level);
      if (!config) {
        errors.push(`No configuration found for level ${department.level}`);
        continue;
      }

      // 验证层级类型
      if (config.type !== department.type) {
        errors.push(
          `Department ${department.name} type ${department.type} does not match config type ${config.type}`,
        );
      }

      // 验证父级类型
      if (department.parentId) {
        const parent = departments.find((d) =>
          d.id.equals(department.parentId!),
        );
        if (parent && !config.allowsParentType(parent.type)) {
          errors.push(
            `Department ${department.name} cannot have parent of type ${parent.type}`,
          );
        }
      }

      // 验证子级类型
      const children = departments.filter((d) =>
        d.parentId?.equals(department.id),
      );
      for (const child of children) {
        if (!config.allowsChildType(child.type)) {
          errors.push(
            `Department ${department.name} cannot have child of type ${child.type}`,
          );
        }
      }

      // 验证最大子部门数
      if (config.exceedsMaxChildren(children.length)) {
        errors.push(
          `Department ${department.name} exceeds max children limit: ${children.length}/${config.maxChildren}`,
        );
      }

      // 验证权限
      for (const permission of department.permissions) {
        if (!config.hasPermission(permission)) {
          warnings.push(
            `Department ${department.name} has permission ${permission} not allowed at level ${department.level}`,
          );
        }
      }

      // 验证约束
      for (const constraint of department.constraints) {
        if (!config.hasConstraint(constraint)) {
          warnings.push(
            `Department ${department.name} has constraint ${constraint} not allowed at level ${department.level}`,
          );
        }
      }
    }

    // 验证层次结构深度
    const maxDepth = Math.max(...departments.map((d) => d.level));
    const rootConfig = configs.find((c) => c.level === 1);
    if (rootConfig && rootConfig.exceedsMaxDepth(maxDepth)) {
      errors.push(
        `Hierarchy depth ${maxDepth} exceeds max depth ${rootConfig.maxDepth}`,
      );
    }

    // 验证循环引用
    const cycleErrors = this.detectCycles(departments);
    errors.push(...cycleErrors);

    const result: DepartmentHierarchyValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };

    this.logger.log(
      `Hierarchy validation completed: ${errors.length} errors, ${warnings.length} warnings`,
      this.context,
    );

    return result;
  }

  /**
   * 查询部门层次结构
   *
   * @param rootNode - 根节点
   * @param query - 查询条件
   * @returns 匹配的部门节点
   */
  async queryHierarchy(
    rootNode: DepartmentHierarchyNode,
    query: {
      readonly level?: number;
      readonly type?: DepartmentLevelType;
      readonly organizationId?: OrganizationId;
      readonly tenantId?: TenantId;
      readonly permissions?: readonly string[];
      readonly constraints?: readonly string[];
    },
  ): Promise<readonly DepartmentHierarchyNode[]> {
    this.logger.log(
      `Querying department hierarchy with criteria: ${JSON.stringify(query)}`,
      this.context,
    );

    const results: DepartmentHierarchyNode[] = [];
    await this.queryNode(rootNode, query, results);

    this.logger.log(
      `Found ${results.length} departments matching query criteria`,
      this.context,
    );

    return results;
  }

  /**
   * 获取部门层次结构统计
   *
   * @param rootNode - 根节点
   * @returns 层次结构统计
   */
  async getHierarchyStatistics(rootNode: DepartmentHierarchyNode): Promise<{
    readonly totalDepartments: number;
    readonly departmentsByLevel: Record<number, number>;
    readonly departmentsByType: Record<DepartmentLevelType, number>;
    readonly maxDepth: number;
    readonly averageChildrenPerDepartment: number;
    readonly leafDepartments: number;
  }> {
    this.logger.log(
      `Getting hierarchy statistics for root: ${rootNode.name}`,
      this.context,
    );

    const departmentsByLevel: Record<number, number> = {};
    const departmentsByType: Record<DepartmentLevelType, number> = {} as Record<
      DepartmentLevelType,
      number
    >;

    // 初始化统计
    for (let level = 1; level <= 7; level++) {
      departmentsByLevel[level] = 0;
    }
    for (const type of Object.values(DepartmentLevelType)) {
      departmentsByType[type] = 0;
    }

    let totalDepartments = 0;
    let maxDepth = 0;
    let totalChildren = 0;
    let leafDepartments = 0;

    await this.collectStatistics(rootNode, {
      departmentsByLevel,
      departmentsByType,
      totalDepartments: 0,
      maxDepth: 0,
      totalChildren: 0,
      leafDepartments: 0,
    });

    const averageChildrenPerDepartment =
      totalDepartments > 0 ? totalChildren / totalDepartments : 0;

    const result = {
      totalDepartments,
      departmentsByLevel,
      departmentsByType,
      maxDepth,
      averageChildrenPerDepartment,
      leafDepartments,
    };

    this.logger.log(
      `Hierarchy statistics generated: ${totalDepartments} departments, max depth: ${maxDepth}`,
      this.context,
    );

    return result;
  }

  /**
   * 构建部门节点
   *
   * @param department - 部门信息
   * @param departments - 所有部门列表
   * @param configs - 层级配置列表
   * @returns 部门节点
   */
  private async buildNode(
    department: {
      readonly id: DepartmentId;
      readonly name: string;
      readonly code: string;
      readonly level: number;
      readonly type: DepartmentLevelType;
      readonly parentId?: DepartmentId;
      readonly organizationId: OrganizationId;
      readonly tenantId: TenantId;
      readonly permissions: readonly string[];
      readonly constraints: readonly string[];
    },
    departments: readonly {
      readonly id: DepartmentId;
      readonly name: string;
      readonly code: string;
      readonly level: number;
      readonly type: DepartmentLevelType;
      readonly parentId?: DepartmentId;
      readonly organizationId: OrganizationId;
      readonly tenantId: TenantId;
      readonly permissions: readonly string[];
      readonly constraints: readonly string[];
    }[],
    configs: readonly DepartmentLevelConfig[],
  ): Promise<DepartmentHierarchyNode> {
    const children = departments.filter((d) =>
      d.parentId?.equals(department.id),
    );
    const childNodes: DepartmentHierarchyNode[] = [];

    for (const child of children) {
      const childNode = await this.buildNode(child, departments, configs);
      childNodes.push(childNode);
    }

    return {
      id: department.id,
      name: department.name,
      code: department.code,
      level: department.level,
      type: department.type,
      parentId: department.parentId,
      children: childNodes,
      organizationId: department.organizationId,
      tenantId: department.tenantId,
      permissions: department.permissions,
      constraints: department.constraints,
    };
  }

  /**
   * 检测循环引用
   *
   * @param departments - 部门列表
   * @returns 循环引用错误
   */
  private detectCycles(
    departments: readonly {
      readonly id: DepartmentId;
      readonly name: string;
      readonly parentId?: DepartmentId;
    }[],
  ): string[] {
    const errors: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const department of departments) {
      if (!visited.has(department.id.value)) {
        const cycle = this.detectCycleFromDepartment(
          department,
          departments,
          visited,
          recursionStack,
        );
        if (cycle.length > 0) {
          errors.push(`Cycle detected: ${cycle.join(" -> ")}`);
        }
      }
    }

    return errors;
  }

  /**
   * 从指定部门检测循环引用
   *
   * @param department - 部门
   * @param departments - 所有部门列表
   * @param visited - 已访问的部门
   * @param recursionStack - 递归栈
   * @returns 循环路径
   */
  private detectCycleFromDepartment(
    department: {
      readonly id: DepartmentId;
      readonly name: string;
      readonly parentId?: DepartmentId;
    },
    departments: readonly {
      readonly id: DepartmentId;
      readonly name: string;
      readonly parentId?: DepartmentId;
    }[],
    visited: Set<string>,
    recursionStack: Set<string>,
  ): string[] {
    if (recursionStack.has(department.id.value)) {
      return [department.name];
    }

    if (visited.has(department.id.value)) {
      return [];
    }

    visited.add(department.id.value);
    recursionStack.add(department.id.value);

    if (department.parentId) {
      const parent = departments.find((d) => d.id.equals(department.parentId!));
      if (parent) {
        const cycle = this.detectCycleFromDepartment(
          parent,
          departments,
          visited,
          recursionStack,
        );
        if (cycle.length > 0) {
          cycle.push(department.name);
          return cycle;
        }
      }
    }

    recursionStack.delete(department.id.value);
    return [];
  }

  /**
   * 查询部门节点
   *
   * @param node - 部门节点
   * @param query - 查询条件
   * @param results - 结果列表
   */
  private async queryNode(
    node: DepartmentHierarchyNode,
    query: {
      readonly level?: number;
      readonly type?: DepartmentLevelType;
      readonly organizationId?: OrganizationId;
      readonly tenantId?: TenantId;
      readonly permissions?: readonly string[];
      readonly constraints?: readonly string[];
    },
    results: DepartmentHierarchyNode[],
  ): Promise<void> {
    if (this.matchesQuery(node, query)) {
      results.push(node);
    }

    for (const child of node.children) {
      await this.queryNode(child, query, results);
    }
  }

  /**
   * 检查节点是否匹配查询条件
   *
   * @param node - 部门节点
   * @param query - 查询条件
   * @returns 是否匹配
   */
  private matchesQuery(
    node: DepartmentHierarchyNode,
    query: {
      readonly level?: number;
      readonly type?: DepartmentLevelType;
      readonly organizationId?: OrganizationId;
      readonly tenantId?: TenantId;
      readonly permissions?: readonly string[];
      readonly constraints?: readonly string[];
    },
  ): boolean {
    if (query.level !== undefined && node.level !== query.level) {
      return false;
    }

    if (query.type !== undefined && node.type !== query.type) {
      return false;
    }

    if (
      query.organizationId !== undefined &&
      !node.organizationId.equals(query.organizationId)
    ) {
      return false;
    }

    if (query.tenantId !== undefined && !node.tenantId.equals(query.tenantId)) {
      return false;
    }

    if (query.permissions !== undefined && query.permissions.length > 0) {
      const hasAllPermissions = query.permissions.every((permission) =>
        node.permissions.includes(permission),
      );
      if (!hasAllPermissions) {
        return false;
      }
    }

    if (query.constraints !== undefined && query.constraints.length > 0) {
      const hasAllConstraints = query.constraints.every((constraint) =>
        node.constraints.includes(constraint),
      );
      if (!hasAllConstraints) {
        return false;
      }
    }

    return true;
  }

  /**
   * 收集层次结构统计信息
   *
   * @param node - 部门节点
   * @param stats - 统计信息
   */
  private async collectStatistics(
    node: DepartmentHierarchyNode,
    stats: {
      departmentsByLevel: Record<number, number>;
      departmentsByType: Record<DepartmentLevelType, number>;
      totalDepartments: number;
      maxDepth: number;
      totalChildren: number;
      leafDepartments: number;
    },
  ): Promise<void> {
    stats.totalDepartments++;
    stats.departmentsByLevel[node.level]++;
    stats.departmentsByType[node.type]++;
    stats.maxDepth = Math.max(stats.maxDepth, node.level);
    stats.totalChildren += node.children.length;

    if (node.children.length === 0) {
      stats.leafDepartments++;
    }

    for (const child of node.children) {
      await this.collectStatistics(child, stats);
    }
  }
}
