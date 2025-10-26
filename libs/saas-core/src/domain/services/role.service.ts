import {
  TenantId,
  GenericEntityId,
  BaseDomainService,
} from "@hl8/domain-kernel";
import { Role } from "../aggregates/role.aggregate.js";
import { RoleType } from "../value-objects/role-type.vo.js";
import { RoleInheritanceBusinessRule } from "../rules/role-inheritance.rule.js";
import { UserActiveSpecification } from "../specifications/user-active.specification.js";

/**
 * 角色领域服务接口
 * @description 提供角色管理的业务逻辑
 */
export interface IRoleService {
  /**
   * 创建角色
   */
  createRole(
    tenantId: TenantId,
    code: string,
    name: string,
    type: RoleType,
    description?: string,
  ): Promise<Role>;

  /**
   * 分配角色给用户
   */
  assignRoleToUser(
    roleId: GenericEntityId,
    userId: GenericEntityId,
  ): Promise<void>;

  /**
   * 撤销用户角色
   */
  revokeRoleFromUser(roleId: GenericEntityId, userId: GenericEntityId): Promise<void>;

  /**
   * 添加权限到角色
   */
  addPermissionToRole(
    roleId: GenericEntityId,
    permissionId: GenericEntityId,
  ): Promise<void>;

  /**
   * 从角色移除权限
   */
  removePermissionFromRole(
    roleId: GenericEntityId,
    permissionId: GenericEntityId,
  ): Promise<void>;

  /**
   * 检查用户是否有角色
   */
  checkUserRole(userId: GenericEntityId, roleType: RoleType): Promise<boolean>;
}

/**
 * 角色领域服务
 * @description 提供角色管理的业务逻辑
 *
 * @example
 * ```typescript
 * const roleService = new RoleService();
 *
 * const role = await roleService.createRole(
 *   TenantId.create('tenant-123'),
 *   'admin',
 *   '管理员',
 *   RoleType.TENANT_ADMIN
 * );
 * ```
 */
export class RoleService extends BaseDomainService implements IRoleService {
  public execute(_input: unknown): unknown {
    throw new Error(
      "RoleService does not use execute method. Use specific methods instead.",
    );
  }

  public async createRole(
    tenantId: TenantId,
    code: string,
    name: string,
    type: RoleType,
    description?: string,
  ): Promise<Role> {
    const role = Role.create(tenantId, code, name, type, description);
    // TODO: 保存到仓储
    return role;
  }

  public async assignRoleToUser(
    roleId: GenericEntityId,
    userId: GenericEntityId,
    roleType?: RoleType,
  ): Promise<void> {
    // 1. 业务规则验证（角色继承规则）
    const rule = new RoleInheritanceBusinessRule();
    const result = rule.validate({
      operation: "role_assignment",
      roleData: {
        userId,
        roleType: roleType || RoleType.REGULAR_USER,
      },
    });

    if (!result.isValid) {
      const errorMessages = result.errors
        .map((e) => `${e.field}: ${e.message}`)
        .join("; ");
      throw new Error(`角色分配验证失败: ${errorMessages}`);
    }

    // 2. TODO: 从仓储加载用户，检查用户活跃状态
    // const user = await this.userRepository.findById(userId);
    // const activeSpec = new UserActiveSpecification();
    // if (!activeSpec.isSatisfiedBy(user)) {
    //   throw new Error("只有活跃用户才能分配角色");
    // }

    // 3. TODO: 从仓储加载角色并分配
    // const role = await this.roleRepository.findById(roleId);
    // role.assignToUser(userId);
    // await this.roleRepository.save(role);
  }

  public async revokeRoleFromUser(
    roleId: GenericEntityId,
    userId: GenericEntityId,
  ): Promise<void> {
    // TODO: 从仓储加载角色
  }

  public async addPermissionToRole(
    roleId: GenericEntityId,
    permissionId: GenericEntityId,
  ): Promise<void> {
    // TODO: 从仓储加载角色
  }

  public async removePermissionFromRole(
    roleId: GenericEntityId,
    permissionId: GenericEntityId,
  ): Promise<void> {
    // TODO: 从仓储加载角色
  }

  public async checkUserRole(
    userId: GenericEntityId,
    roleType: RoleType,
  ): Promise<boolean> {
    // 1. 业务规则验证（角色继承规则）
    const rule = new RoleInheritanceBusinessRule();
    const result = rule.validate({
      operation: "role_assignment",
      roleData: {
        userId,
        roleType,
      },
    });

    if (!result.isValid) {
      return false;
    }

    // 2. TODO: 从仓储查询用户角色
    // const user = await this.userRepository.findById(userId);
    // const userRoles = await this.userRoleRepository.findByUserId(userId);
    // return userRoles.some(ur => ur.roleType === roleType);

    // 临时实现
    return false;
  }
}
