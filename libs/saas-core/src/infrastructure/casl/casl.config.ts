import { defineAbility } from "@casl/ability";
import { User } from "../../domain/entities/user.entity.js";
import { Role } from "../../domain/entities/role.entity.js";
import { Tenant } from "../../domain/entities/tenant.entity.js";
import { Organization } from "../../domain/entities/organization.entity.js";
import { Department } from "../../domain/entities/department.entity.js";

/**
 * CASL权限系统配置
 *
 * @description 定义CASL权限系统的配置和权限规则
 * @author HL8 Team
 * @version 1.0.0
 */
export interface CaslConfig {
  /** 权限规则定义 */
  rules: CaslRule[];
  /** 权限条件定义 */
  conditions: CaslCondition[];
  /** 权限主体定义 */
  subjects: CaslSubject[];
}

/**
 * CASL权限规则接口
 */
export interface CaslRule {
  /** 操作类型 */
  action: string;
  /** 权限主体 */
  subject: string;
  /** 权限条件 */
  conditions?: Record<string, unknown>;
  /** 是否反向规则 */
  inverted?: boolean;
}

/**
 * CASL权限条件接口
 */
export interface CaslCondition {
  /** 字段名 */
  field: string;
  /** 操作符 */
  operator: string;
  /** 条件值 */
  value: unknown;
}

/**
 * CASL权限主体接口
 */
export interface CaslSubject {
  /** 主体名称 */
  name: string;
  /** 主体类型 */
  type: string;
  /** 主体描述 */
  description: string;
}

/**
 * CASL权限系统配置常量
 */
export const CASL_CONFIG: CaslConfig = {
  rules: [
    // 平台管理员权限
    {
      action: "manage",
      subject: "all",
      conditions: { role: "PLATFORM_ADMIN" },
    },
    // 租户管理员权限
    {
      action: "manage",
      subject: "Tenant",
      conditions: { role: "TENANT_ADMIN" },
    },
    {
      action: "manage",
      subject: "Organization",
      conditions: { role: "TENANT_ADMIN" },
    },
    {
      action: "manage",
      subject: "Department",
      conditions: { role: "TENANT_ADMIN" },
    },
    {
      action: "manage",
      subject: "User",
      conditions: { role: "TENANT_ADMIN" },
    },
    // 组织管理员权限
    {
      action: "read",
      subject: "Organization",
      conditions: { role: "ORGANIZATION_ADMIN" },
    },
    {
      action: "update",
      subject: "Organization",
      conditions: { role: "ORGANIZATION_ADMIN" },
    },
    {
      action: "manage",
      subject: "Department",
      conditions: { role: "ORGANIZATION_ADMIN" },
    },
    {
      action: "manage",
      subject: "User",
      conditions: { role: "ORGANIZATION_ADMIN" },
    },
    // 部门管理员权限
    {
      action: "read",
      subject: "Department",
      conditions: { role: "DEPARTMENT_ADMIN" },
    },
    {
      action: "update",
      subject: "Department",
      conditions: { role: "DEPARTMENT_ADMIN" },
    },
    {
      action: "manage",
      subject: "User",
      conditions: { role: "DEPARTMENT_ADMIN" },
    },
    // 普通用户权限
    {
      action: "read",
      subject: "User",
      conditions: { role: "REGULAR_USER" },
    },
    {
      action: "update",
      subject: "User",
      conditions: { role: "REGULAR_USER", "user.id": "${user.id}" },
    },
  ],
  conditions: [
    {
      field: "tenantId",
      operator: "equals",
      value: "${user.tenantId}",
    },
    {
      field: "organizationId",
      operator: "equals",
      value: "${user.organizationId}",
    },
    {
      field: "departmentId",
      operator: "equals",
      value: "${user.departmentId}",
    },
    {
      field: "userId",
      operator: "equals",
      value: "${user.id}",
    },
  ],
  subjects: [
    {
      name: "Tenant",
      type: "entity",
      description: "租户实体",
    },
    {
      name: "Organization",
      type: "entity",
      description: "组织实体",
    },
    {
      name: "Department",
      type: "entity",
      description: "部门实体",
    },
    {
      name: "User",
      type: "entity",
      description: "用户实体",
    },
    {
      name: "Role",
      type: "entity",
      description: "角色实体",
    },
    {
      name: "Permission",
      type: "entity",
      description: "权限实体",
    },
  ],
};

/**
 * 创建CASL能力实例
 *
 * @description 根据用户信息和权限规则创建CASL能力实例
 * @param user 用户信息
 * @param role 角色信息
 * @returns CASL能力实例
 */
export function createCaslAbility(
  user: User,
  role: Role,
): ReturnType<typeof defineAbility> {
  return defineAbility((can, cannot) => {
    // 根据用户角色和权限规则定义能力
    const userRole = role.name;
    const userTenantId = user.tenantId;
    const userOrganizationId = user.organizationId;
    const userDepartmentId = user.departmentId;
    const userId = user.id;

    // 应用权限规则
    CASL_CONFIG.rules.forEach((rule) => {
      if (rule.conditions?.role === userRole) {
        if (rule.inverted) {
          cannot(rule.action, rule.subject, rule.conditions);
        } else {
          can(rule.action, rule.subject, rule.conditions);
        }
      }
    });

    // 应用隔离条件
    CASL_CONFIG.conditions.forEach((condition) => {
      if (condition.field === "tenantId") {
        can("read", "all", { tenantId: userTenantId });
      }
      if (condition.field === "organizationId") {
        can("read", "all", { organizationId: userOrganizationId });
      }
      if (condition.field === "departmentId") {
        can("read", "all", { departmentId: userDepartmentId });
      }
      if (condition.field === "userId") {
        can("read", "all", { userId: userId });
      }
    });
  });
}
