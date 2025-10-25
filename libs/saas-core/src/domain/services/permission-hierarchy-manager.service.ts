/**
 * 权限层次结构管理器
 *
 * @description 处理权限层次结构管理，包括层次结构定义、权限继承、层次验证等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { DomainService } from "@hl8/domain-kernel";
import {
  PermissionTemplate,
  PermissionTemplateType,
} from "../value-objects/permission-template.vo.js";

/**
 * 权限层次结构级别枚举
 */
export enum PermissionHierarchyLevel {
  PLATFORM = "PLATFORM",
  TENANT = "TENANT",
  ORGANIZATION = "ORGANIZATION",
  DEPARTMENT = "DEPARTMENT",
  USER = "USER",
}

/**
 * 权限层次结构节点接口
 */
export interface PermissionHierarchyNode {
  readonly level: PermissionHierarchyLevel;
  readonly permissions: readonly string[];
  readonly children: readonly PermissionHierarchyNode[];
  readonly parent?: PermissionHierarchyNode;
}

/**
 * 权限继承结果接口
 */
export interface PermissionInheritanceResult {
  readonly inheritedPermissions: readonly string[];
  readonly directPermissions: readonly string[];
  readonly effectivePermissions: readonly string[];
  readonly inheritancePath: readonly PermissionHierarchyLevel[];
  readonly conflicts: readonly string[];
}

/**
 * 权限层次结构管理器
 *
 * 权限层次结构管理器负责处理权限层次结构管理，包括层次结构定义、权限继承、层次验证等。
 * 支持多级权限层次结构，包括平台、租户、组织、部门、用户等层级。
 *
 * @example
 * ```typescript
 * const manager = new PermissionHierarchyManager();
 * const result = await manager.getInheritedPermissions(template, hierarchyLevel);
 * console.log(`Inherited ${result.inheritedPermissions.length} permissions`);
 * ```
 */
@Injectable()
export class PermissionHierarchyManager extends DomainService {
  private readonly hierarchyRules: Map<
    PermissionHierarchyLevel,
    PermissionHierarchyLevel[]
  > = new Map();

  constructor() {
    super();
    this.setContext("PermissionHierarchyManager");
    this.initializeHierarchyRules();
  }

  /**
   * 获取继承的权限
   *
   * @param template - 权限模板
   * @param level - 层次结构级别
   * @returns 权限继承结果
   */
  async getInheritedPermissions(
    template: PermissionTemplate,
    level: PermissionHierarchyLevel,
  ): Promise<PermissionInheritanceResult> {
    this.logger.log(
      `Getting inherited permissions for template '${template.name}' at level '${level}'`,
      this.context,
    );

    const inheritancePath = this.getInheritancePath(level);
    const inheritedPermissions: string[] = [];
    const conflicts: string[] = [];

    // 从父级继承权限
    for (const parentLevel of inheritancePath) {
      const parentPermissions = this.getPermissionsForLevel(parentLevel);
      for (const permission of parentPermissions) {
        if (!inheritedPermissions.includes(permission)) {
          inheritedPermissions.push(permission);
        } else {
          conflicts.push(
            `Duplicate permission '${permission}' inherited from level '${parentLevel}'`,
          );
        }
      }
    }

    // 获取直接权限
    const directPermissions = [...template.permissions];

    // 合并有效权限
    const effectivePermissions = [
      ...new Set([...inheritedPermissions, ...directPermissions]),
    ];

    const result: PermissionInheritanceResult = {
      inheritedPermissions,
      directPermissions,
      effectivePermissions,
      inheritancePath,
      conflicts,
    };

    this.logger.log(
      `Permission inheritance completed: ${inheritedPermissions.length} inherited, ${directPermissions.length} direct, ${effectivePermissions.length} effective`,
      this.context,
    );

    return result;
  }

  /**
   * 验证权限层次结构
   *
   * @param templates - 权限模板列表
   * @returns 验证结果
   */
  async validateHierarchy(templates: readonly PermissionTemplate[]): Promise<{
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
    readonly suggestions: readonly string[];
  }> {
    this.logger.log(
      `Validating permission hierarchy for ${templates.length} templates`,
      this.context,
    );

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 验证层次结构模板
    const hierarchyTemplates = templates.filter(
      (t) => t.type === PermissionTemplateType.HIERARCHY_BASED,
    );

    for (const template of hierarchyTemplates) {
      const validation = await this.validateTemplateHierarchy(template);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
      suggestions.push(...validation.suggestions);
    }

    // 验证层次结构一致性
    const consistencyValidation =
      await this.validateHierarchyConsistency(templates);
    errors.push(...consistencyValidation.errors);
    warnings.push(...consistencyValidation.warnings);
    suggestions.push(...consistencyValidation.suggestions);

    const result = {
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
   * 构建权限层次结构树
   *
   * @param templates - 权限模板列表
   * @returns 层次结构树
   */
  async buildHierarchyTree(
    templates: readonly PermissionTemplate[],
  ): Promise<PermissionHierarchyNode> {
    this.logger.log(
      `Building permission hierarchy tree for ${templates.length} templates`,
      this.context,
    );

    const rootNode: PermissionHierarchyNode = {
      level: PermissionHierarchyLevel.PLATFORM,
      permissions: this.getPermissionsForLevel(
        PermissionHierarchyLevel.PLATFORM,
      ),
      children: [],
    };

    const nodeMap = new Map<
      PermissionHierarchyLevel,
      PermissionHierarchyNode
    >();
    nodeMap.set(PermissionHierarchyLevel.PLATFORM, rootNode);

    // 构建其他层级的节点
    const levels = [
      PermissionHierarchyLevel.TENANT,
      PermissionHierarchyLevel.ORGANIZATION,
      PermissionHierarchyLevel.DEPARTMENT,
      PermissionHierarchyLevel.USER,
    ];

    for (const level of levels) {
      const node: PermissionHierarchyNode = {
        level,
        permissions: this.getPermissionsForLevel(level),
        children: [],
      };
      nodeMap.set(level, node);
    }

    // 建立父子关系
    for (const level of levels) {
      const node = nodeMap.get(level)!;
      const parentLevel = this.getParentLevel(level);
      if (parentLevel) {
        const parentNode = nodeMap.get(parentLevel)!;
        node.parent = parentNode;
        parentNode.children = [...parentNode.children, node];
      }
    }

    this.logger.log(
      `Hierarchy tree built successfully with ${nodeMap.size} nodes`,
      this.context,
    );

    return rootNode;
  }

  /**
   * 获取权限层次结构路径
   *
   * @param level - 层次结构级别
   * @returns 层次结构路径
   */
  getHierarchyPath(
    level: PermissionHierarchyLevel,
  ): readonly PermissionHierarchyLevel[] {
    const path: PermissionHierarchyLevel[] = [];
    let currentLevel: PermissionHierarchyLevel | undefined = level;

    while (currentLevel) {
      path.unshift(currentLevel);
      currentLevel = this.getParentLevel(currentLevel);
    }

    return path;
  }

  /**
   * 检查权限是否在层次结构中
   *
   * @param permission - 权限
   * @param level - 层次结构级别
   * @returns 是否在层次结构中
   */
  isPermissionInHierarchy(
    permission: string,
    level: PermissionHierarchyLevel,
  ): boolean {
    const permissions = this.getPermissionsForLevel(level);
    return permissions.includes(permission);
  }

  /**
   * 获取层次结构级别
   *
   * @param permission - 权限
   * @returns 层次结构级别
   */
  getPermissionLevel(permission: string): PermissionHierarchyLevel | undefined {
    for (const level of Object.values(PermissionHierarchyLevel)) {
      const permissions = this.getPermissionsForLevel(level);
      if (permissions.includes(permission)) {
        return level;
      }
    }
    return undefined;
  }

  /**
   * 获取层次结构统计
   *
   * @param templates - 权限模板列表
   * @returns 层次结构统计
   */
  async getHierarchyStatistics(
    templates: readonly PermissionTemplate[],
  ): Promise<{
    readonly totalLevels: number;
    readonly permissionsByLevel: Record<PermissionHierarchyLevel, number>;
    readonly templatesByLevel: Record<PermissionHierarchyLevel, number>;
    readonly averagePermissionsPerLevel: number;
    readonly hierarchyDepth: number;
  }> {
    this.logger.log(
      `Getting hierarchy statistics for ${templates.length} templates`,
      this.context,
    );

    const permissionsByLevel: Record<PermissionHierarchyLevel, number> =
      {} as Record<PermissionHierarchyLevel, number>;
    const templatesByLevel: Record<PermissionHierarchyLevel, number> =
      {} as Record<PermissionHierarchyLevel, number>;

    // 初始化统计
    for (const level of Object.values(PermissionHierarchyLevel)) {
      permissionsByLevel[level] = 0;
      templatesByLevel[level] = 0;
    }

    // 统计权限数量
    for (const level of Object.values(PermissionHierarchyLevel)) {
      const permissions = this.getPermissionsForLevel(level);
      permissionsByLevel[level] = permissions.length;
    }

    // 统计模板数量
    for (const template of templates) {
      if (template.type === PermissionTemplateType.HIERARCHY_BASED) {
        const level = this.getTemplateLevel(template);
        if (level) {
          templatesByLevel[level]++;
        }
      }
    }

    const totalLevels = Object.values(PermissionHierarchyLevel).length;
    const totalPermissions = Object.values(permissionsByLevel).reduce(
      (sum, count) => sum + count,
      0,
    );
    const averagePermissionsPerLevel = totalPermissions / totalLevels;
    const hierarchyDepth = this.getHierarchyDepth();

    const result = {
      totalLevels,
      permissionsByLevel,
      templatesByLevel,
      averagePermissionsPerLevel,
      hierarchyDepth,
    };

    this.logger.log(
      `Hierarchy statistics generated: ${totalLevels} levels, ${totalPermissions} total permissions, depth: ${hierarchyDepth}`,
      this.context,
    );

    return result;
  }

  /**
   * 初始化层次结构规则
   */
  private initializeHierarchyRules(): void {
    this.hierarchyRules.set(PermissionHierarchyLevel.PLATFORM, []);
    this.hierarchyRules.set(PermissionHierarchyLevel.TENANT, [
      PermissionHierarchyLevel.PLATFORM,
    ]);
    this.hierarchyRules.set(PermissionHierarchyLevel.ORGANIZATION, [
      PermissionHierarchyLevel.TENANT,
    ]);
    this.hierarchyRules.set(PermissionHierarchyLevel.DEPARTMENT, [
      PermissionHierarchyLevel.ORGANIZATION,
    ]);
    this.hierarchyRules.set(PermissionHierarchyLevel.USER, [
      PermissionHierarchyLevel.DEPARTMENT,
    ]);
  }

  /**
   * 获取继承路径
   *
   * @param level - 层次结构级别
   * @returns 继承路径
   */
  private getInheritancePath(
    level: PermissionHierarchyLevel,
  ): readonly PermissionHierarchyLevel[] {
    const path: PermissionHierarchyLevel[] = [];
    let currentLevel: PermissionHierarchyLevel | undefined = level;

    while (currentLevel) {
      const parentLevels = this.hierarchyRules.get(currentLevel) || [];
      if (parentLevels.length > 0) {
        path.unshift(...parentLevels);
        currentLevel = parentLevels[0];
      } else {
        break;
      }
    }

    return path;
  }

  /**
   * 获取父级级别
   *
   * @param level - 层次结构级别
   * @returns 父级级别
   */
  private getParentLevel(
    level: PermissionHierarchyLevel,
  ): PermissionHierarchyLevel | undefined {
    const parentLevels = this.hierarchyRules.get(level) || [];
    return parentLevels.length > 0 ? parentLevels[0] : undefined;
  }

  /**
   * 获取级别的权限
   *
   * @param level - 层次结构级别
   * @returns 权限列表
   */
  private getPermissionsForLevel(
    level: PermissionHierarchyLevel,
  ): readonly string[] {
    switch (level) {
      case PermissionHierarchyLevel.PLATFORM:
        return ["platform:admin", "platform:config", "platform:monitor"];
      case PermissionHierarchyLevel.TENANT:
        return [
          "tenant:admin",
          "tenant:config",
          "tenant:users",
          "tenant:organizations",
        ];
      case PermissionHierarchyLevel.ORGANIZATION:
        return [
          "organization:admin",
          "organization:config",
          "organization:users",
          "organization:departments",
        ];
      case PermissionHierarchyLevel.DEPARTMENT:
        return ["department:admin", "department:config", "department:users"];
      case PermissionHierarchyLevel.USER:
        return ["user:profile", "user:settings"];
      default:
        return [];
    }
  }

  /**
   * 验证模板层次结构
   *
   * @param template - 权限模板
   * @returns 验证结果
   */
  private async validateTemplateHierarchy(
    template: PermissionTemplate,
  ): Promise<{
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
    readonly suggestions: readonly string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 验证权限是否属于正确的层次结构级别
    const templateLevel = this.getTemplateLevel(template);
    if (templateLevel) {
      for (const permission of template.permissions) {
        const permissionLevel = this.getPermissionLevel(permission);
        if (permissionLevel && permissionLevel !== templateLevel) {
          warnings.push(
            `Permission '${permission}' belongs to level '${permissionLevel}' but template '${template.name}' is at level '${templateLevel}'`,
          );
        }
      }
    }

    return { errors, warnings, suggestions };
  }

  /**
   * 验证层次结构一致性
   *
   * @param templates - 权限模板列表
   * @returns 验证结果
   */
  private async validateHierarchyConsistency(
    templates: readonly PermissionTemplate[],
  ): Promise<{
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
    readonly suggestions: readonly string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 验证层次结构完整性
    const hierarchyTemplates = templates.filter(
      (t) => t.type === PermissionTemplateType.HIERARCHY_BASED,
    );
    const levelsWithTemplates = new Set<PermissionHierarchyLevel>();

    for (const template of hierarchyTemplates) {
      const level = this.getTemplateLevel(template);
      if (level) {
        levelsWithTemplates.add(level);
      }
    }

    // 检查是否有缺失的层级
    for (const level of Object.values(PermissionHierarchyLevel)) {
      if (!levelsWithTemplates.has(level)) {
        warnings.push(`No templates found for hierarchy level '${level}'`);
      }
    }

    return { errors, warnings, suggestions };
  }

  /**
   * 获取模板级别
   *
   * @param template - 权限模板
   * @returns 模板级别
   */
  private getTemplateLevel(
    template: PermissionTemplate,
  ): PermissionHierarchyLevel | undefined {
    // 基于模板名称或元数据确定级别
    const name = template.name.toLowerCase();
    const metadata = template.metadata;

    if (name.includes("platform") || metadata?.level === "PLATFORM") {
      return PermissionHierarchyLevel.PLATFORM;
    }
    if (name.includes("tenant") || metadata?.level === "TENANT") {
      return PermissionHierarchyLevel.TENANT;
    }
    if (name.includes("organization") || metadata?.level === "ORGANIZATION") {
      return PermissionHierarchyLevel.ORGANIZATION;
    }
    if (name.includes("department") || metadata?.level === "DEPARTMENT") {
      return PermissionHierarchyLevel.DEPARTMENT;
    }
    if (name.includes("user") || metadata?.level === "USER") {
      return PermissionHierarchyLevel.USER;
    }

    return undefined;
  }

  /**
   * 获取层次结构深度
   *
   * @returns 层次结构深度
   */
  private getHierarchyDepth(): number {
    return Object.values(PermissionHierarchyLevel).length;
  }
}
