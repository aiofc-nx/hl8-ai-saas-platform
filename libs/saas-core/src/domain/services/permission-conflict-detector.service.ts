/**
 * 权限冲突检测器
 *
 * @description 处理权限冲突检测和解决，包括权限冲突识别、冲突类型分析、解决建议等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { DomainService } from "@hl8/domain-kernel";
import { PermissionTemplate } from "../value-objects/permission-template.vo.js";

/**
 * 权限冲突类型枚举
 */
export enum PermissionConflictType {
  DUPLICATE_PERMISSION = "DUPLICATE_PERMISSION",
  CONTRADICTORY_PERMISSION = "CONTRADICTORY_PERMISSION",
  HIERARCHY_VIOLATION = "HIERARCHY_VIOLATION",
  RESOURCE_CONFLICT = "RESOURCE_CONFLICT",
  CONDITION_CONFLICT = "CONDITION_CONFLICT",
  TEMPLATE_CONFLICT = "TEMPLATE_CONFLICT",
}

/**
 * 权限冲突严重程度枚举
 */
export enum ConflictSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * 权限冲突检测结果接口
 */
export interface PermissionConflictResult {
  readonly hasConflict: boolean;
  readonly conflicts: readonly PermissionConflict[];
  readonly severity: ConflictSeverity;
  readonly recommendations: readonly string[];
}

/**
 * 权限冲突接口
 */
export interface PermissionConflict {
  readonly type: PermissionConflictType;
  readonly severity: ConflictSeverity;
  readonly description: string;
  readonly conflictingPermissions: readonly string[];
  readonly conflictingTemplates?: readonly string[];
  readonly suggestions: readonly string[];
  readonly detectedAt: Date;
}

/**
 * 权限冲突检测器
 *
 * 权限冲突检测器负责处理权限冲突检测和解决，包括权限冲突识别、冲突类型分析、解决建议等。
 * 支持多种冲突类型检测，包括重复权限、矛盾权限、层次结构违规、资源冲突等。
 *
 * @example
 * ```typescript
 * const detector = new PermissionConflictDetector();
 * const result = await detector.detectConflicts(templates);
 * if (result.hasConflict) {
 *   console.log(`Found ${result.conflicts.length} conflicts`);
 * }
 * ```
 */
@Injectable()
export class PermissionConflictDetector extends DomainService {
  constructor() {
    super();
    this.setContext("PermissionConflictDetector");
  }

  /**
   * 检测权限冲突
   *
   * @param templates - 权限模板列表
   * @returns 冲突检测结果
   */
  async detectConflicts(
    templates: readonly PermissionTemplate[],
  ): Promise<PermissionConflictResult> {
    this.logger.log(
      `Detecting permission conflicts for ${templates.length} templates`,
      this.context,
    );

    const conflicts: PermissionConflict[] = [];
    const recommendations: string[] = [];

    // 检测重复权限
    const duplicateConflicts = await this.detectDuplicatePermissions(templates);
    conflicts.push(...duplicateConflicts);

    // 检测矛盾权限
    const contradictoryConflicts =
      await this.detectContradictoryPermissions(templates);
    conflicts.push(...contradictoryConflicts);

    // 检测层次结构违规
    const hierarchyConflicts = await this.detectHierarchyViolations(templates);
    conflicts.push(...hierarchyConflicts);

    // 检测资源冲突
    const resourceConflicts = await this.detectResourceConflicts(templates);
    conflicts.push(...resourceConflicts);

    // 检测条件冲突
    const conditionConflicts = await this.detectConditionConflicts(templates);
    conflicts.push(...conditionConflicts);

    // 检测模板冲突
    const templateConflicts = await this.detectTemplateConflicts(templates);
    conflicts.push(...templateConflicts);

    // 确定严重程度
    const severity = this.determineSeverity(conflicts);

    // 生成建议
    const conflictRecommendations = this.generateRecommendations(conflicts);
    recommendations.push(...conflictRecommendations);

    const result: PermissionConflictResult = {
      hasConflict: conflicts.length > 0,
      conflicts,
      severity,
      recommendations,
    };

    this.logger.log(
      `Permission conflict detection completed: ${conflicts.length} conflicts found, severity: ${severity}`,
      this.context,
    );

    return result;
  }

  /**
   * 检测重复权限
   *
   * @param templates - 权限模板列表
   * @returns 重复权限冲突列表
   */
  private async detectDuplicatePermissions(
    templates: readonly PermissionTemplate[],
  ): Promise<PermissionConflict[]> {
    const conflicts: PermissionConflict[] = [];
    const permissionMap = new Map<string, string[]>();

    // 收集所有权限及其所属模板
    for (const template of templates) {
      for (const permission of template.permissions) {
        if (!permissionMap.has(permission)) {
          permissionMap.set(permission, []);
        }
        permissionMap.get(permission)!.push(template.name);
      }
    }

    // 检测重复权限
    for (const [permission, templateNames] of permissionMap) {
      if (templateNames.length > 1) {
        conflicts.push({
          type: PermissionConflictType.DUPLICATE_PERMISSION,
          severity: ConflictSeverity.MEDIUM,
          description: `Permission '${permission}' is duplicated across multiple templates`,
          conflictingPermissions: [permission],
          conflictingTemplates: templateNames,
          suggestions: [
            `Consider consolidating permission '${permission}' into a single template`,
            `Use template inheritance to avoid duplication`,
            `Review if all templates actually need this permission`,
          ],
          detectedAt: new Date(),
        });
      }
    }

    return conflicts;
  }

  /**
   * 检测矛盾权限
   *
   * @param templates - 权限模板列表
   * @returns 矛盾权限冲突列表
   */
  private async detectContradictoryPermissions(
    templates: readonly PermissionTemplate[],
  ): Promise<PermissionConflict[]> {
    const conflicts: PermissionConflict[] = [];
    const contradictoryPairs = this.getContradictoryPermissionPairs();

    for (const template of templates) {
      for (const [permission1, permission2] of contradictoryPairs) {
        if (
          template.hasPermission(permission1) &&
          template.hasPermission(permission2)
        ) {
          conflicts.push({
            type: PermissionConflictType.CONTRADICTORY_PERMISSION,
            severity: ConflictSeverity.HIGH,
            description: `Template '${template.name}' contains contradictory permissions: '${permission1}' and '${permission2}'`,
            conflictingPermissions: [permission1, permission2],
            conflictingTemplates: [template.name],
            suggestions: [
              `Remove one of the contradictory permissions: '${permission1}' or '${permission2}'`,
              `Use conditions to make permissions mutually exclusive`,
              `Review business logic to determine which permission is correct`,
            ],
            detectedAt: new Date(),
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * 检测层次结构违规
   *
   * @param templates - 权限模板列表
   * @returns 层次结构违规冲突列表
   */
  private async detectHierarchyViolations(
    templates: readonly PermissionTemplate[],
  ): Promise<PermissionConflict[]> {
    const conflicts: PermissionConflict[] = [];
    const hierarchyRules = this.getHierarchyRules();

    for (const template of templates) {
      if (template.type !== PermissionTemplateType.HIERARCHY_BASED) {
        continue;
      }

      for (const rule of hierarchyRules) {
        const hasParentPermission = template.hasPermission(
          rule.parentPermission,
        );
        const hasChildPermission = template.hasPermission(rule.childPermission);

        if (hasChildPermission && !hasParentPermission) {
          conflicts.push({
            type: PermissionConflictType.HIERARCHY_VIOLATION,
            severity: ConflictSeverity.HIGH,
            description: `Template '${template.name}' violates hierarchy: '${rule.childPermission}' requires '${rule.parentPermission}'`,
            conflictingPermissions: [
              rule.parentPermission,
              rule.childPermission,
            ],
            conflictingTemplates: [template.name],
            suggestions: [
              `Add parent permission '${rule.parentPermission}' to template`,
              `Remove child permission '${rule.childPermission}' if not needed`,
              `Use template inheritance to maintain hierarchy`,
            ],
            detectedAt: new Date(),
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * 检测资源冲突
   *
   * @param templates - 权限模板列表
   * @returns 资源冲突列表
   */
  private async detectResourceConflicts(
    templates: readonly PermissionTemplate[],
  ): Promise<PermissionConflict[]> {
    const conflicts: PermissionConflict[] = [];
    const resourceRules = this.getResourceRules();

    for (const template of templates) {
      if (template.type !== PermissionTemplateType.RESOURCE_BASED) {
        continue;
      }

      for (const rule of resourceRules) {
        const hasReadPermission = template.hasPermission(rule.readPermission);
        const hasWritePermission = template.hasPermission(rule.writePermission);
        const hasDeletePermission = template.hasPermission(
          rule.deletePermission,
        );

        if (hasDeletePermission && !hasWritePermission) {
          conflicts.push({
            type: PermissionConflictType.RESOURCE_CONFLICT,
            severity: ConflictSeverity.MEDIUM,
            description: `Template '${template.name}' has delete permission without write permission for resource '${rule.resource}'`,
            conflictingPermissions: [
              rule.writePermission,
              rule.deletePermission,
            ],
            conflictingTemplates: [template.name],
            suggestions: [
              `Add write permission '${rule.writePermission}' to template`,
              `Remove delete permission '${rule.deletePermission}' if not needed`,
              `Review resource access requirements`,
            ],
            detectedAt: new Date(),
          });
        }

        if (hasWritePermission && !hasReadPermission) {
          conflicts.push({
            type: PermissionConflictType.RESOURCE_CONFLICT,
            severity: ConflictSeverity.LOW,
            description: `Template '${template.name}' has write permission without read permission for resource '${rule.resource}'`,
            conflictingPermissions: [rule.readPermission, rule.writePermission],
            conflictingTemplates: [template.name],
            suggestions: [
              `Add read permission '${rule.readPermission}' to template`,
              `Review if write-only access is intentional`,
            ],
            detectedAt: new Date(),
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * 检测条件冲突
   *
   * @param templates - 权限模板列表
   * @returns 条件冲突列表
   */
  private async detectConditionConflicts(
    templates: readonly PermissionTemplate[],
  ): Promise<PermissionConflict[]> {
    const conflicts: PermissionConflict[] = [];
    const conditionRules = this.getConditionRules();

    for (const template of templates) {
      for (const rule of conditionRules) {
        const hasCondition1 = template.hasCondition(rule.condition1);
        const hasCondition2 = template.hasCondition(rule.condition2);

        if (hasCondition1 && hasCondition2) {
          conflicts.push({
            type: PermissionConflictType.CONDITION_CONFLICT,
            severity: ConflictSeverity.MEDIUM,
            description: `Template '${template.name}' has conflicting conditions: '${rule.condition1}' and '${rule.condition2}'`,
            conflictingPermissions: [],
            conflictingTemplates: [template.name],
            suggestions: [
              `Remove one of the conflicting conditions: '${rule.condition1}' or '${rule.condition2}'`,
              `Use conditional logic to make conditions mutually exclusive`,
              `Review business requirements for condition logic`,
            ],
            detectedAt: new Date(),
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * 检测模板冲突
   *
   * @param templates - 权限模板列表
   * @returns 模板冲突列表
   */
  private async detectTemplateConflicts(
    templates: readonly PermissionTemplate[],
  ): Promise<PermissionConflict[]> {
    const conflicts: PermissionConflict[] = [];
    const templateMap = new Map<string, PermissionTemplate[]>();

    // 按名称分组模板
    for (const template of templates) {
      if (!templateMap.has(template.name)) {
        templateMap.set(template.name, []);
      }
      templateMap.get(template.name)!.push(template);
    }

    // 检测同名模板
    for (const [name, templateList] of templateMap) {
      if (templateList.length > 1) {
        const activeTemplates = templateList.filter((t) => t.isActive());
        if (activeTemplates.length > 1) {
          conflicts.push({
            type: PermissionConflictType.TEMPLATE_CONFLICT,
            severity: ConflictSeverity.CRITICAL,
            description: `Multiple active templates with the same name '${name}'`,
            conflictingPermissions: [],
            conflictingTemplates: activeTemplates.map((t) => t.name),
            suggestions: [
              `Rename one of the templates to avoid conflicts`,
              `Deprecate or archive duplicate templates`,
              `Use versioning to distinguish between templates`,
            ],
            detectedAt: new Date(),
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * 确定冲突严重程度
   *
   * @param conflicts - 冲突列表
   * @returns 严重程度
   */
  private determineSeverity(conflicts: PermissionConflict[]): ConflictSeverity {
    if (conflicts.length === 0) {
      return ConflictSeverity.LOW;
    }

    const severityCounts = {
      [ConflictSeverity.CRITICAL]: 0,
      [ConflictSeverity.HIGH]: 0,
      [ConflictSeverity.MEDIUM]: 0,
      [ConflictSeverity.LOW]: 0,
    };

    for (const conflict of conflicts) {
      severityCounts[conflict.severity]++;
    }

    if (severityCounts[ConflictSeverity.CRITICAL] > 0) {
      return ConflictSeverity.CRITICAL;
    }
    if (severityCounts[ConflictSeverity.HIGH] > 0) {
      return ConflictSeverity.HIGH;
    }
    if (severityCounts[ConflictSeverity.MEDIUM] > 0) {
      return ConflictSeverity.MEDIUM;
    }
    return ConflictSeverity.LOW;
  }

  /**
   * 生成解决建议
   *
   * @param conflicts - 冲突列表
   * @returns 建议列表
   */
  private generateRecommendations(conflicts: PermissionConflict[]): string[] {
    const recommendations: string[] = [];

    if (conflicts.length === 0) {
      recommendations.push(
        "No conflicts detected. Templates are properly configured.",
      );
      return recommendations;
    }

    const conflictTypes = new Set(conflicts.map((c) => c.type));

    if (conflictTypes.has(PermissionConflictType.DUPLICATE_PERMISSION)) {
      recommendations.push(
        "Consider using template inheritance to avoid permission duplication",
      );
    }

    if (conflictTypes.has(PermissionConflictType.CONTRADICTORY_PERMISSION)) {
      recommendations.push(
        "Review business logic to resolve contradictory permissions",
      );
    }

    if (conflictTypes.has(PermissionConflictType.HIERARCHY_VIOLATION)) {
      recommendations.push(
        "Implement proper permission hierarchy using template inheritance",
      );
    }

    if (conflictTypes.has(PermissionConflictType.RESOURCE_CONFLICT)) {
      recommendations.push(
        "Ensure resource permissions follow proper access patterns",
      );
    }

    if (conflictTypes.has(PermissionConflictType.CONDITION_CONFLICT)) {
      recommendations.push(
        "Use conditional logic to resolve conflicting conditions",
      );
    }

    if (conflictTypes.has(PermissionConflictType.TEMPLATE_CONFLICT)) {
      recommendations.push(
        "Implement template versioning and naming conventions",
      );
    }

    return recommendations;
  }

  /**
   * 获取矛盾权限对
   *
   * @returns 矛盾权限对列表
   */
  private getContradictoryPermissionPairs(): Array<[string, string]> {
    return [
      ["user:create", "user:delete"],
      ["tenant:admin", "tenant:readonly"],
      ["organization:admin", "organization:readonly"],
      ["department:admin", "department:readonly"],
    ];
  }

  /**
   * 获取层次结构规则
   *
   * @returns 层次结构规则列表
   */
  private getHierarchyRules(): Array<{
    parentPermission: string;
    childPermission: string;
  }> {
    return [
      {
        parentPermission: "tenant:admin",
        childPermission: "organization:admin",
      },
      {
        parentPermission: "organization:admin",
        childPermission: "department:admin",
      },
      { parentPermission: "department:admin", childPermission: "user:admin" },
    ];
  }

  /**
   * 获取资源规则
   *
   * @returns 资源规则列表
   */
  private getResourceRules(): Array<{
    resource: string;
    readPermission: string;
    writePermission: string;
    deletePermission: string;
  }> {
    return [
      {
        resource: "user",
        readPermission: "user:read",
        writePermission: "user:write",
        deletePermission: "user:delete",
      },
      {
        resource: "organization",
        readPermission: "organization:read",
        writePermission: "organization:write",
        deletePermission: "organization:delete",
      },
      {
        resource: "department",
        readPermission: "department:read",
        writePermission: "department:write",
        deletePermission: "department:delete",
      },
    ];
  }

  /**
   * 获取条件规则
   *
   * @returns 条件规则列表
   */
  private getConditionRules(): Array<{
    condition1: string;
    condition2: string;
  }> {
    return [
      { condition1: "tenant:admin", condition2: "tenant:readonly" },
      { condition1: "organization:admin", condition2: "organization:readonly" },
      { condition1: "department:admin", condition2: "department:readonly" },
    ];
  }
}
