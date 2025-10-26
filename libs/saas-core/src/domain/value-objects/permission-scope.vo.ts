/**
 * 权限范围
 * @description 定义权限的作用范围
 *
 * @remarks
 * 权限层级（从高到低）：
 * - PLATFORM: 平台级权限，可访问所有租户数据
 * - TENANT: 租户级权限，可访问租户内所有数据
 * - ORGANIZATION: 组织级权限，可访问组织内所有数据
 * - DEPARTMENT: 部门级权限，可访问部门内所有数据
 * - USER: 用户级权限，只能访问个人数据
 */
export enum PermissionScope {
  /** 平台级：平台级别的权限 */
  PLATFORM = "PLATFORM",

  /** 租户级：租户级别的权限 */
  TENANT = "TENANT",

  /** 组织级：组织级别的权限 */
  ORGANIZATION = "ORGANIZATION",

  /** 部门级：部门级别的权限 */
  DEPARTMENT = "DEPARTMENT",

  /** 用户级：用户级别的权限 */
  USER = "USER",
}
