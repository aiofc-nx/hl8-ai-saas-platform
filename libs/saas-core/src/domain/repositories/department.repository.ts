/**
 * 部门仓储接口
 * @description 定义部门聚合根的持久化契约
 *
 * @since 1.0.0
 */
import { DepartmentId, OrganizationId, GenericEntityId } from "@hl8/domain-kernel";
import { Department } from "../aggregates/department.aggregate.js";
import { DepartmentStatus } from "../value-objects/department-status.vo.js";

/**
 * 部门仓储接口
 */
export interface IDepartmentRepository {
  /**
   * 保存部门
   * @param department - 部门聚合根
   * @returns Promise<void>
   */
  save(department: Department): Promise<void>;

  /**
   * 根据ID查找部门
   * @param id - 部门ID
   * @returns 部门聚合根或null
   */
  findById(id: DepartmentId): Promise<Department | null>;

  /**
   * 根据名称和组织查找部门
   * @param name - 部门名称
   * @param organizationId - 组织ID
   * @returns 部门聚合根或null
   */
  findByNameAndOrganization(
    name: string,
    organizationId: OrganizationId,
  ): Promise<Department | null>;

  /**
   * 查找组织的所有部门
   * @param organizationId - 组织ID
   * @param includeChildren - 是否包含子部门
   * @returns 部门列表
   */
  findByOrganization(
    organizationId: OrganizationId,
    includeChildren?: boolean,
  ): Promise<Department[]>;

  /**
   * 查找部门的所有子部门
   * @param departmentId - 父部门ID
   * @returns 子部门列表
   */
  findChildren(departmentId: DepartmentId): Promise<Department[]>;

  /**
   * 根据状态查找部门列表
   * @param organizationId - 组织ID
   * @param status - 部门状态
   * @param offset - 偏移量
   * @param limit - 限制数量
   * @returns 部门列表和总数
   */
  findByStatus(
    organizationId: OrganizationId,
    status: DepartmentStatus,
    offset?: number,
    limit?: number,
  ): Promise<{ departments: Department[]; total: number }>;

  /**
   * 根据层级查找部门列表
   * @param organizationId - 组织ID
   * @param level - 部门层级
   * @returns 部门列表
   */
  findByLevel(organizationId: OrganizationId, level: number): Promise<Department[]>;

  /**
   * 删除部门
   * @param id - 部门ID
   * @returns Promise<void>
   */
  delete(id: DepartmentId): Promise<void>;
}
