/**
 * 权限模板服务
 *
 * @description 处理权限模板管理，包括模板创建、更新、删除、查询等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { DomainService } from "@hl8/domain-kernel";
import {
  PermissionTemplate,
  PermissionTemplateType,
  PermissionTemplateStatus,
} from "../value-objects/permission-template.vo.js";

/**
 * 权限模板查询条件接口
 */
export interface PermissionTemplateQuery {
  readonly name?: string;
  readonly type?: PermissionTemplateType;
  readonly status?: PermissionTemplateStatus;
  readonly permissions?: readonly string[];
  readonly conditions?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

/**
 * 权限模板服务
 *
 * 权限模板服务负责处理权限模板管理，包括模板创建、更新、删除、查询等。
 * 支持多种权限模板类型，包括基于角色、资源、功能和层次结构的权限模板。
 *
 * @example
 * ```typescript
 * const service = new PermissionTemplateService();
 * const template = await service.createTemplate(
 *   "Admin Template",
 *   "Administrator permissions",
 *   PermissionTemplateType.ROLE_BASED,
 *   ["user:create", "user:read", "user:update", "user:delete"]
 * );
 * ```
 */
@Injectable()
export class PermissionTemplateService extends DomainService {
  private readonly templates: Map<string, PermissionTemplate> = new Map();

  constructor() {
    super();
    this.setContext("PermissionTemplateService");
  }

  /**
   * 创建权限模板
   *
   * @param name - 模板名称
   * @param description - 模板描述
   * @param type - 模板类型
   * @param permissions - 权限列表
   * @param conditions - 条件列表
   * @param metadata - 元数据
   * @returns 创建的权限模板
   */
  async createTemplate(
    name: string,
    description: string,
    type: PermissionTemplateType,
    permissions: readonly string[],
    conditions?: readonly string[],
    metadata?: Record<string, unknown>,
  ): Promise<PermissionTemplate> {
    this.logger.log(
      `Creating permission template '${name}' with type '${type}'`,
      this.context,
    );

    // 检查模板名称是否已存在
    if (this.templates.has(name)) {
      throw new Error(`Template with name '${name}' already exists`);
    }

    const template = PermissionTemplate.create(
      name,
      description,
      type,
      permissions,
      conditions,
      metadata,
    );

    this.templates.set(name, template);

    this.logger.log(
      `Permission template '${name}' created successfully`,
      this.context,
    );

    return template;
  }

  /**
   * 更新权限模板
   *
   * @param name - 模板名称
   * @param updates - 更新内容
   * @returns 更新后的权限模板
   */
  async updateTemplate(
    name: string,
    updates: {
      readonly description?: string;
      readonly permissions?: readonly string[];
      readonly conditions?: readonly string[];
      readonly metadata?: Record<string, unknown>;
    },
  ): Promise<PermissionTemplate> {
    this.logger.log(`Updating permission template '${name}'`, this.context);

    const existingTemplate = this.templates.get(name);
    if (!existingTemplate) {
      throw new Error(`Template with name '${name}' not found`);
    }

    const updatedTemplate = PermissionTemplate.createFromTemplate(
      existingTemplate,
      updates,
    );
    this.templates.set(name, updatedTemplate);

    this.logger.log(
      `Permission template '${name}' updated successfully`,
      this.context,
    );

    return updatedTemplate;
  }

  /**
   * 删除权限模板
   *
   * @param name - 模板名称
   * @returns 是否删除成功
   */
  async deleteTemplate(name: string): Promise<boolean> {
    this.logger.log(`Deleting permission template '${name}'`, this.context);

    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template with name '${name}' not found`);
    }

    if (template.isActive()) {
      throw new Error(
        `Cannot delete active template '${name}'. Please deprecate it first.`,
      );
    }

    const deleted = this.templates.delete(name);

    this.logger.log(
      `Permission template '${name}' deleted: ${deleted}`,
      this.context,
    );

    return deleted;
  }

  /**
   * 获取权限模板
   *
   * @param name - 模板名称
   * @returns 权限模板或undefined
   */
  async getTemplate(name: string): Promise<PermissionTemplate | undefined> {
    this.logger.log(`Getting permission template '${name}'`, this.context);

    const template = this.templates.get(name);

    this.logger.log(
      `Permission template '${name}' ${template ? "found" : "not found"}`,
      this.context,
    );

    return template;
  }

  /**
   * 查询权限模板
   *
   * @param query - 查询条件
   * @returns 权限模板列表
   */
  async queryTemplates(
    query: PermissionTemplateQuery,
  ): Promise<readonly PermissionTemplate[]> {
    this.logger.log(
      `Querying permission templates with criteria: ${JSON.stringify(query)}`,
      this.context,
    );

    const results: PermissionTemplate[] = [];

    for (const template of this.templates.values()) {
      if (this.matchesQuery(template, query)) {
        results.push(template);
      }
    }

    this.logger.log(
      `Found ${results.length} templates matching query criteria`,
      this.context,
    );

    return results;
  }

  /**
   * 获取所有权限模板
   *
   * @returns 权限模板列表
   */
  async getAllTemplates(): Promise<readonly PermissionTemplate[]> {
    this.logger.log(`Getting all permission templates`, this.context);

    const templates = Array.from(this.templates.values());

    this.logger.log(
      `Retrieved ${templates.length} permission templates`,
      this.context,
    );

    return templates;
  }

  /**
   * 激活权限模板
   *
   * @param name - 模板名称
   * @returns 激活后的权限模板
   */
  async activateTemplate(name: string): Promise<PermissionTemplate> {
    this.logger.log(`Activating permission template '${name}'`, this.context);

    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template with name '${name}' not found`);
    }

    const activatedTemplate = template.activate();
    this.templates.set(name, activatedTemplate);

    this.logger.log(
      `Permission template '${name}' activated successfully`,
      this.context,
    );

    return activatedTemplate;
  }

  /**
   * 弃用权限模板
   *
   * @param name - 模板名称
   * @returns 弃用后的权限模板
   */
  async deprecateTemplate(name: string): Promise<PermissionTemplate> {
    this.logger.log(`Deprecating permission template '${name}'`, this.context);

    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template with name '${name}' not found`);
    }

    const deprecatedTemplate = template.deprecate();
    this.templates.set(name, deprecatedTemplate);

    this.logger.log(
      `Permission template '${name}' deprecated successfully`,
      this.context,
    );

    return deprecatedTemplate;
  }

  /**
   * 归档权限模板
   *
   * @param name - 模板名称
   * @returns 归档后的权限模板
   */
  async archiveTemplate(name: string): Promise<PermissionTemplate> {
    this.logger.log(`Archiving permission template '${name}'`, this.context);

    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template with name '${name}' not found`);
    }

    const archivedTemplate = template.archive();
    this.templates.set(name, archivedTemplate);

    this.logger.log(
      `Permission template '${name}' archived successfully`,
      this.context,
    );

    return archivedTemplate;
  }

  /**
   * 添加权限到模板
   *
   * @param name - 模板名称
   * @param permission - 权限
   * @returns 更新后的权限模板
   */
  async addPermissionToTemplate(
    name: string,
    permission: string,
  ): Promise<PermissionTemplate> {
    this.logger.log(
      `Adding permission '${permission}' to template '${name}'`,
      this.context,
    );

    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template with name '${name}' not found`);
    }

    const updatedTemplate = template.addPermission(permission);
    this.templates.set(name, updatedTemplate);

    this.logger.log(
      `Permission '${permission}' added to template '${name}' successfully`,
      this.context,
    );

    return updatedTemplate;
  }

  /**
   * 从模板移除权限
   *
   * @param name - 模板名称
   * @param permission - 权限
   * @returns 更新后的权限模板
   */
  async removePermissionFromTemplate(
    name: string,
    permission: string,
  ): Promise<PermissionTemplate> {
    this.logger.log(
      `Removing permission '${permission}' from template '${name}'`,
      this.context,
    );

    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template with name '${name}' not found`);
    }

    const updatedTemplate = template.removePermission(permission);
    this.templates.set(name, updatedTemplate);

    this.logger.log(
      `Permission '${permission}' removed from template '${name}' successfully`,
      this.context,
    );

    return updatedTemplate;
  }

  /**
   * 添加条件到模板
   *
   * @param name - 模板名称
   * @param condition - 条件
   * @returns 更新后的权限模板
   */
  async addConditionToTemplate(
    name: string,
    condition: string,
  ): Promise<PermissionTemplate> {
    this.logger.log(
      `Adding condition '${condition}' to template '${name}'`,
      this.context,
    );

    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template with name '${name}' not found`);
    }

    const updatedTemplate = template.addCondition(condition);
    this.templates.set(name, updatedTemplate);

    this.logger.log(
      `Condition '${condition}' added to template '${name}' successfully`,
      this.context,
    );

    return updatedTemplate;
  }

  /**
   * 从模板移除条件
   *
   * @param name - 模板名称
   * @param condition - 条件
   * @returns 更新后的权限模板
   */
  async removeConditionFromTemplate(
    name: string,
    condition: string,
  ): Promise<PermissionTemplate> {
    this.logger.log(
      `Removing condition '${condition}' from template '${name}'`,
      this.context,
    );

    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template with name '${name}' not found`);
    }

    const updatedTemplate = template.removeCondition(condition);
    this.templates.set(name, updatedTemplate);

    this.logger.log(
      `Condition '${condition}' removed from template '${name}' successfully`,
      this.context,
    );

    return updatedTemplate;
  }

  /**
   * 获取模板统计信息
   *
   * @returns 模板统计信息
   */
  async getTemplateStatistics(): Promise<{
    readonly totalTemplates: number;
    readonly templatesByType: Record<PermissionTemplateType, number>;
    readonly templatesByStatus: Record<PermissionTemplateStatus, number>;
    readonly averagePermissionsPerTemplate: number;
    readonly averageConditionsPerTemplate: number;
  }> {
    this.logger.log(`Getting template statistics`, this.context);

    const templates = Array.from(this.templates.values());
    const totalTemplates = templates.length;

    const templatesByType: Record<PermissionTemplateType, number> =
      {} as Record<PermissionTemplateType, number>;
    const templatesByStatus: Record<PermissionTemplateStatus, number> =
      {} as Record<PermissionTemplateStatus, number>;

    // 初始化统计
    for (const type of Object.values(PermissionTemplateType)) {
      templatesByType[type] = 0;
    }
    for (const status of Object.values(PermissionTemplateStatus)) {
      templatesByStatus[status] = 0;
    }

    // 统计模板
    let totalPermissions = 0;
    let totalConditions = 0;

    for (const template of templates) {
      templatesByType[template.type]++;
      templatesByStatus[template.status]++;
      totalPermissions += template.getPermissionCount();
      totalConditions += template.getConditionCount();
    }

    const averagePermissionsPerTemplate =
      totalTemplates > 0 ? totalPermissions / totalTemplates : 0;
    const averageConditionsPerTemplate =
      totalTemplates > 0 ? totalConditions / totalTemplates : 0;

    const result = {
      totalTemplates,
      templatesByType,
      templatesByStatus,
      averagePermissionsPerTemplate,
      averageConditionsPerTemplate,
    };

    this.logger.log(
      `Template statistics generated: ${totalTemplates} templates, ${averagePermissionsPerTemplate.toFixed(2)} avg permissions, ${averageConditionsPerTemplate.toFixed(2)} avg conditions`,
      this.context,
    );

    return result;
  }

  /**
   * 检查模板是否匹配查询条件
   *
   * @param template - 权限模板
   * @param query - 查询条件
   * @returns 是否匹配
   */
  private matchesQuery(
    template: PermissionTemplate,
    query: PermissionTemplateQuery,
  ): boolean {
    if (
      query.name &&
      !template.name.toLowerCase().includes(query.name.toLowerCase())
    ) {
      return false;
    }

    if (query.type && template.type !== query.type) {
      return false;
    }

    if (query.status && template.status !== query.status) {
      return false;
    }

    if (query.permissions && query.permissions.length > 0) {
      const hasAllPermissions = query.permissions.every((permission) =>
        template.hasPermission(permission),
      );
      if (!hasAllPermissions) {
        return false;
      }
    }

    if (query.conditions && query.conditions.length > 0) {
      const hasAllConditions = query.conditions.every((condition) =>
        template.hasCondition(condition),
      );
      if (!hasAllConditions) {
        return false;
      }
    }

    if (query.metadata && Object.keys(query.metadata).length > 0) {
      const templateMetadata = template.metadata;
      const hasAllMetadata = Object.entries(query.metadata).every(
        ([key, value]) => templateMetadata[key] === value,
      );
      if (!hasAllMetadata) {
        return false;
      }
    }

    return true;
  }
}
