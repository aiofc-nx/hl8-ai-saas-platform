/**
 * 组织仓储接口
 * @description 定义组织聚合根的持久化契约
 *
 * @since 1.0.0
 */
import { OrganizationId, GenericEntityId } from "@hl8/domain-kernel";
import { Organization } from "../aggregates/organization.aggregate.js";
import { OrganizationStatus } from "../value-objects/organization-status.vo.js";
import { OrganizationType } from "../value-objects/organization-type.vo.js";

/**
 * 组织仓储接口
 */
export interface IOrganizationRepository {
  /**
   * 保存组织
   * @param organization - 组织聚合根
   * @returns Promise<void>
   */
  save(organization: Organization): Promise<void>;

  /**
   * 根据ID查找组织
   * @param id - 组织ID
   * @returns 组织聚合根或null
   */
  findById(id: OrganizationId): Promise<Organization | null>;

  /**
   * 根据名称和租户查找组织
   * @param name - 组织名称
   * @param tenantId - 租户ID
   * @returns 组织聚合根或null
   */
  findByNameAndTenant(
    name: string,
    tenantId: GenericEntityId,
  ): Promise<Organization | null>;

  /**
   * 根据状态查找组织列表
   * @param tenantId - 租户ID
   * @param status - 组织状态
   * @param offset - 偏移量
   * @param limit - 限制数量
   * @returns 组织列表和总数
   */
  findByStatus(
    tenantId: GenericEntityId,
    status: OrganizationStatus,
    offset?: number,
    limit?: number,
  ): Promise<{ organizations: Organization[]; total: number }>;

  /**
   * 根据类型查找组织列表
   * @param tenantId - 租户ID
   * @param type - 组织类型
   * @param offset - 偏移量
   * @param limit - 限制数量
   * @returns 组织列表和总数
   */
  findByType(
    tenantId: GenericEntityId,
    type: OrganizationType,
    offset?: number,
    limit?: number,
  ): Promise<{ organizations: Organization[]; total: number }>;

  /**
   * 删除组织
   * @param id - 组织ID
   * @returns Promise<void>
   */
  delete(id: OrganizationId): Promise<void>;
}
