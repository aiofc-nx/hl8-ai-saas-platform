/**
 * 部门层级配置服务
 *
 * @description 处理部门层级配置管理，包括配置创建、更新、删除、查询等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { BaseDomainService } from "@hl8/domain-kernel";
import {
  DepartmentLevelConfig,
  DepartmentLevelType,
} from "../value-objects/department-level-config.vo.js";

/**
 * 部门层级配置查询条件接口
 */
export interface DepartmentLevelConfigQuery {
  readonly level?: number;
  readonly type?: DepartmentLevelType;
  readonly maxChildren?: number;
  readonly maxDepth?: number;
  readonly permissions?: readonly string[];
  readonly constraints?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

/**
 * 部门层级配置服务
 *
 * 部门层级配置服务负责处理部门层级配置管理，包括配置创建、更新、删除、查询等。
 * 支持多级部门层次结构配置，包括根部门、分支部门、叶子部门等类型。
 *
 * @example
 * ```typescript
 * const service = new DepartmentLevelConfigService();
 * const config = await service.createConfig(
 *   1,
 *   DepartmentLevelType.ROOT,
 *   10,
 *   7,
 *   [DepartmentLevelType.ROOT],
 *   [DepartmentLevelType.BRANCH, DepartmentLevelType.LEAF],
 *   ["department:create", "department:read", "department:update"],
 *   ["max_users:100", "max_organizations:5"]
 * );
 * ```
 */
@Injectable()
export class DepartmentLevelConfigService extends BaseDomainService {
  private readonly configs: Map<number, DepartmentLevelConfig> = new Map();

  constructor() {
    super();
    this.setContext("DepartmentLevelConfigService");
  }

  /**
   * 创建部门层级配置
   *
   * @param level - 层级
   * @param type - 类型
   * @param maxChildren - 最大子部门数
   * @param maxDepth - 最大深度
   * @param allowedParentTypes - 允许的父级类型
   * @param allowedChildTypes - 允许的子级类型
   * @param permissions - 权限列表
   * @param constraints - 约束列表
   * @param metadata - 元数据
   * @returns 创建的部门层级配置
   */
  async createConfig(
    level: number,
    type: DepartmentLevelType,
    maxChildren: number,
    maxDepth: number,
    allowedParentTypes: readonly DepartmentLevelType[],
    allowedChildTypes: readonly DepartmentLevelType[],
    permissions: readonly string[],
    constraints: readonly string[],
    metadata?: Record<string, unknown>,
  ): Promise<DepartmentLevelConfig> {
    this.logger.log(
      `Creating department level config for level ${level} with type ${type}`,
      this.context,
    );

    // 检查配置是否已存在
    if (this.configs.has(level)) {
      throw new Error(`Config for level ${level} already exists`);
    }

    const config = DepartmentLevelConfig.create(
      level,
      type,
      maxChildren,
      maxDepth,
      allowedParentTypes,
      allowedChildTypes,
      permissions,
      constraints,
      metadata,
    );

    this.configs.set(level, config);

    this.logger.log(
      `Department level config for level ${level} created successfully`,
      this.context,
    );

    return config;
  }

  /**
   * 更新部门层级配置
   *
   * @param level - 层级
   * @param updates - 更新内容
   * @returns 更新后的部门层级配置
   */
  async updateConfig(
    level: number,
    updates: {
      readonly maxChildren?: number;
      readonly maxDepth?: number;
      readonly allowedParentTypes?: readonly DepartmentLevelType[];
      readonly allowedChildTypes?: readonly DepartmentLevelType[];
      readonly permissions?: readonly string[];
      readonly constraints?: readonly string[];
      readonly metadata?: Record<string, unknown>;
    },
  ): Promise<DepartmentLevelConfig> {
    this.logger.log(
      `Updating department level config for level ${level}`,
      this.context,
    );

    const existingConfig = this.configs.get(level);
    if (!existingConfig) {
      throw new Error(`Config for level ${level} not found`);
    }

    const updatedConfig = DepartmentLevelConfig.createFromConfig(
      existingConfig,
      updates,
    );
    this.configs.set(level, updatedConfig);

    this.logger.log(
      `Department level config for level ${level} updated successfully`,
      this.context,
    );

    return updatedConfig;
  }

  /**
   * 删除部门层级配置
   *
   * @param level - 层级
   * @returns 是否删除成功
   */
  async deleteConfig(level: number): Promise<boolean> {
    this.logger.log(
      `Deleting department level config for level ${level}`,
      this.context,
    );

    const config = this.configs.get(level);
    if (!config) {
      throw new Error(`Config for level ${level} not found`);
    }

    const deleted = this.configs.delete(level);

    this.logger.log(
      `Department level config for level ${level} deleted: ${deleted}`,
      this.context,
    );

    return deleted;
  }

  /**
   * 获取部门层级配置
   *
   * @param level - 层级
   * @returns 部门层级配置或undefined
   */
  async getConfig(level: number): Promise<DepartmentLevelConfig | undefined> {
    this.logger.log(
      `Getting department level config for level ${level}`,
      this.context,
    );

    const config = this.configs.get(level);

    this.logger.log(
      `Department level config for level ${level} ${config ? "found" : "not found"}`,
      this.context,
    );

    return config;
  }

  /**
   * 查询部门层级配置
   *
   * @param query - 查询条件
   * @returns 部门层级配置列表
   */
  async queryConfigs(
    query: DepartmentLevelConfigQuery,
  ): Promise<readonly DepartmentLevelConfig[]> {
    this.logger.log(
      `Querying department level configs with criteria: ${JSON.stringify(query)}`,
      this.context,
    );

    const results: DepartmentLevelConfig[] = [];

    for (const config of this.configs.values()) {
      if (this.matchesQuery(config, query)) {
        results.push(config);
      }
    }

    this.logger.log(
      `Found ${results.length} configs matching query criteria`,
      this.context,
    );

    return results;
  }

  /**
   * 获取所有部门层级配置
   *
   * @returns 部门层级配置列表
   */
  async getAllConfigs(): Promise<readonly DepartmentLevelConfig[]> {
    this.logger.log(`Getting all department level configs`, this.context);

    const configs = Array.from(this.configs.values());

    this.logger.log(
      `Retrieved ${configs.length} department level configs`,
      this.context,
    );

    return configs;
  }

  /**
   * 验证部门层级配置
   *
   * @param configs - 配置列表
   * @returns 验证结果
   */
  async validateConfigs(configs: readonly DepartmentLevelConfig[]): Promise<{
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
    readonly suggestions: readonly string[];
  }> {
    this.logger.log(
      `Validating ${configs.length} department level configs`,
      this.context,
    );

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 验证层级连续性
    const levels = configs.map((c) => c.level).sort((a, b) => a - b);
    for (let i = 0; i < levels.length - 1; i++) {
      if (levels[i + 1] - levels[i] > 1) {
        errors.push(`Missing config for level ${levels[i] + 1}`);
      }
    }

    // 验证每个配置
    for (const config of configs) {
      // 验证层级类型一致性
      const sameLevelConfigs = configs.filter((c) => c.level === config.level);
      if (sameLevelConfigs.length > 1) {
        errors.push(`Multiple configs found for level ${config.level}`);
      }

      // 验证父级类型兼容性
      for (const parentType of config.allowedParentTypes) {
        const parentConfig = configs.find((c) => c.type === parentType);
        if (parentConfig && !parentConfig.allowsChildType(config.type)) {
          errors.push(
            `Config for level ${config.level} type ${config.type} cannot have parent of type ${parentType}`,
          );
        }
      }

      // 验证子级类型兼容性
      for (const childType of config.allowedChildTypes) {
        const childConfig = configs.find((c) => c.type === childType);
        if (childConfig && !childConfig.allowsParentType(config.type)) {
          errors.push(
            `Config for level ${config.level} type ${config.type} cannot have child of type ${childType}`,
          );
        }
      }

      // 验证权限一致性
      for (const permission of config.permissions) {
        const parentConfig = configs.find((c) => c.level === config.level - 1);
        if (parentConfig && !parentConfig.hasPermission(permission)) {
          warnings.push(
            `Permission ${permission} at level ${config.level} not available at parent level ${config.level - 1}`,
          );
        }
      }

      // 验证约束合理性
      for (const constraint of config.constraints) {
        if (constraint.startsWith("max_") && !constraint.includes(":")) {
          warnings.push(
            `Constraint ${constraint} at level ${config.level} should include a value`,
          );
        }
      }
    }

    // 生成建议
    if (errors.length === 0 && warnings.length === 0) {
      suggestions.push("All configurations are valid and consistent");
    } else {
      suggestions.push("Review and fix the identified issues");
      suggestions.push(
        "Consider using template configurations for consistency",
      );
    }

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };

    this.logger.log(
      `Config validation completed: ${errors.length} errors, ${warnings.length} warnings`,
      this.context,
    );

    return result;
  }

  /**
   * 获取配置统计信息
   *
   * @returns 配置统计信息
   */
  async getConfigStatistics(): Promise<{
    readonly totalConfigs: number;
    readonly configsByLevel: Record<number, number>;
    readonly configsByType: Record<DepartmentLevelType, number>;
    readonly averagePermissionsPerConfig: number;
    readonly averageConstraintsPerConfig: number;
    readonly maxDepth: number;
  }> {
    this.logger.log(`Getting config statistics`, this.context);

    const configs = Array.from(this.configs.values());
    const totalConfigs = configs.length;

    const configsByLevel: Record<number, number> = {};
    const configsByType: Record<DepartmentLevelType, number> = {} as Record<
      DepartmentLevelType,
      number
    >;

    // 初始化统计
    for (let level = 1; level <= 7; level++) {
      configsByLevel[level] = 0;
    }
    for (const type of Object.values(DepartmentLevelType)) {
      configsByType[type] = 0;
    }

    let totalPermissions = 0;
    let totalConstraints = 0;
    let maxDepth = 0;

    for (const config of configs) {
      configsByLevel[config.level]++;
      configsByType[config.type]++;
      totalPermissions += config.getPermissionCount();
      totalConstraints += config.getConstraintCount();
      maxDepth = Math.max(maxDepth, config.level);
    }

    const averagePermissionsPerConfig =
      totalConfigs > 0 ? totalPermissions / totalConfigs : 0;
    const averageConstraintsPerConfig =
      totalConfigs > 0 ? totalConstraints / totalConfigs : 0;

    const result = {
      totalConfigs,
      configsByLevel,
      configsByType,
      averagePermissionsPerConfig,
      averageConstraintsPerConfig,
      maxDepth,
    };

    this.logger.log(
      `Config statistics generated: ${totalConfigs} configs, max depth: ${maxDepth}`,
      this.context,
    );

    return result;
  }

  /**
   * 检查配置是否匹配查询条件
   *
   * @param config - 部门层级配置
   * @param query - 查询条件
   * @returns 是否匹配
   */
  private matchesQuery(
    config: DepartmentLevelConfig,
    query: DepartmentLevelConfigQuery,
  ): boolean {
    if (query.level !== undefined && config.level !== query.level) {
      return false;
    }

    if (query.type !== undefined && config.type !== query.type) {
      return false;
    }

    if (
      query.maxChildren !== undefined &&
      config.maxChildren !== query.maxChildren
    ) {
      return false;
    }

    if (query.maxDepth !== undefined && config.maxDepth !== query.maxDepth) {
      return false;
    }

    if (query.permissions !== undefined && query.permissions.length > 0) {
      const hasAllPermissions = query.permissions.every((permission) =>
        config.hasPermission(permission),
      );
      if (!hasAllPermissions) {
        return false;
      }
    }

    if (query.constraints !== undefined && query.constraints.length > 0) {
      const hasAllConstraints = query.constraints.every((constraint) =>
        config.hasConstraint(constraint),
      );
      if (!hasAllConstraints) {
        return false;
      }
    }

    if (
      query.metadata !== undefined &&
      Object.keys(query.metadata).length > 0
    ) {
      const configMetadata = config.metadata;
      const hasAllMetadata = Object.entries(query.metadata).every(
        ([key, value]) => configMetadata[key] === value,
      );
      if (!hasAllMetadata) {
        return false;
      }
    }

    return true;
  }
}
