/**
 * 部门实体映射器（PostgreSQL）
 *
 * @description 在部门数据库实体和部门领域实体之间进行转换
 * @since 1.0.0
 */

import { Department } from "../../../domain/entities/department.entity.js";
import { DepartmentId } from "../../../domain/value-objects/department-id.vo.js";
import { OrganizationId } from "../../../domain/value-objects/organization-id.vo.js";
import { TenantId } from "../../../domain/value-objects/tenant-id.vo.js";
import { AuditInfo } from "@hl8/domain-kernel";
import { DepartmentEntity } from "../../entities/postgresql/department.entity.js";

/**
 * 部门映射器（PostgreSQL）
 *
 * 负责在数据库实体和领域实体之间进行双向转换：
 * - toDomain: 将数据库实体转换为领域实体
 * - toEntity: 将领域实体转换为数据库实体
 */
export class DepartmentMapper {
  /**
   * 将数据库实体转换为领域实体
   *
   * @param entity - 数据库实体
   * @returns 领域实体
   */
  static toDomain(entity: DepartmentEntity): Department {
    // 转换值对象
    const departmentId = new DepartmentId(entity.id);
    const organizationId = new OrganizationId(entity.organizationId);
    const tenantId = new TenantId(entity.tenantId);
    const parentId = entity.parentId ? new DepartmentId(entity.parentId) : null;

    // 创建审计信息
    const auditInfo: AuditInfo = {
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      version: entity.version,
    };

    // 创建领域实体
    return new Department(
      departmentId,
      entity.name,
      entity.code,
      organizationId,
      tenantId,
      parentId,
      auditInfo,
    );
  }

  /**
   * 将领域实体转换为数据库实体
   *
   * @param domain - 领域实体
   * @returns 数据库实体
   */
  static toEntity(domain: Department): DepartmentEntity {
    return new DepartmentEntity({
      id: domain.id.getValue(),
      tenantId: domain.tenantId.getValue(),
      organizationId: domain.organizationId.getValue(),
      name: domain.name,
      code: domain.code,
      parentId: domain.parentId?.getValue(),
      level: domain.level,
      path: "", // Department doesn't have path in domain
      createdAt: domain.auditInfo.createdAt,
      updatedAt: domain.auditInfo.updatedAt,
      version: domain.auditInfo.version,
    });
  }
}
