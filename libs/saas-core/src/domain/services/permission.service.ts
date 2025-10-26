import {
  TenantId,
  GenericEntityId,
  BaseDomainService,
} from "@hl8/domain-kernel";
import { Permission } from "../aggregates/permission.aggregate.js";
import { PermissionAction } from "../value-objects/permission-action.vo.js";
import { PermissionScope } from "../value-objects/permission-scope.vo.js";
import { PermissionAssignmentBusinessRule } from "../rules/permission-assignment.rule.js";
import { AuthorizationCheckBusinessRule } from "../rules/authorization-check.rule.js";
import { UserPermissionSpecification } from "../specifications/user-permission.specification.js";

/**
 * 权限领域服务接口
 * @description 提供权限管理的业务逻辑
 */
export interface IPermissionService {
  /**
   * 创建权限
   * @param tenantId - 租户ID
   * @param code - 权限代码
   * @param name - 权限名称
   * @param action - 权限操作
   * @param scope - 权限范围
   * @param description - 权限描述
   * @returns 权限聚合根
   */
  createPermission(
    tenantId: TenantId,
    code: string,
    name: string,
    action: PermissionAction,
    scope: PermissionScope,
    description?: string,
  ): Promise<Permission>;

  /**
   * 分配权限给用户
   * @param permissionId - 权限ID
   * @param userId - 用户ID
   */
  assignPermissionToUser(
    permissionId: GenericEntityId,
    userId: GenericEntityId,
  ): Promise<void>;

  /**
   * 撤销用户权限
   * @param permissionId - 权限ID
   * @param userId - 用户ID
   */
  revokePermissionFromUser(
    permissionId: GenericEntityId,
    userId: GenericEntityId,
  ): Promise<void>;

  /**
   * 检查用户是否有权限
   * @param userId - 用户ID
   * @param action - 权限操作
   * @param scope - 权限范围
   * @returns 是否有权限
   */
  checkUserPermission(
    userId: GenericEntityId,
    action: PermissionAction,
    scope: PermissionScope,
  ): Promise<boolean>;
}

/**
 * 权限领域服务
 * @description 提供权限管理的业务逻辑
 *
 * @remarks
 * 领域服务的职责：
 * - 协调多个聚合根之间的业务逻辑
 * - 处理跨聚合的业务规则
 * - 提供领域特定的查询和计算
 *
 * @example
 * ```typescript
 * const permissionService = new PermissionService();
 *
 * const permission = await permissionService.createPermission(
 *   TenantId.create('tenant-123'),
 *   'user.create',
 *   '创建用户',
 *   PermissionAction.CREATE,
 *   PermissionScope.TENANT
 * );
 *
 * await permissionService.assignPermissionToUser(
 *   permission.id,
 *   UserId.create('user-123')
 * );
 * ```
 */
export class PermissionService
  extends BaseDomainService
  implements IPermissionService
{
  /**
   * 执行领域服务逻辑
   * @param input - 输入参数
   * @returns 执行结果
   */
  public execute(_input: unknown): unknown {
    // PermissionService 不使用统一的 execute 方法
    throw new Error(
      "PermissionService does not use execute method. Use specific methods instead.",
    );
  }

  /**
   * 创建权限
   * @param tenantId - 租户ID
   * @param code - 权限代码
   * @param name - 权限名称
   * @param action - 权限操作
   * @param scope - 权限范围
   * @param description - 权限描述
   * @returns 权限聚合根
   */
  public async createPermission(
    tenantId: TenantId,
    code: string,
    name: string,
    action: PermissionAction,
    scope: PermissionScope,
    description?: string,
  ): Promise<Permission> {
    // 创建权限聚合根
    const permission = Permission.create(
      tenantId,
      code,
      name,
      action,
      scope,
      description,
    );

    // TODO: 保存到仓储

    return permission;
  }

  /**
   * 分配权限给用户
   * @param permissionId - 权限ID
   * @param userId - 用户ID
   * @param scope - 权限范围（可选）
   * @param targetResourceId - 目标资源ID（可选）
   */
  public async assignPermissionToUser(
    permissionId: GenericEntityId,
    userId: GenericEntityId,
    scope?: PermissionScope,
    targetResourceId?: GenericEntityId,
  ): Promise<void> {
    // 1. 业务规则验证
    const rule = new PermissionAssignmentBusinessRule();
    const result = rule.validate({
      operation: "permission_assignment",
      permissionData: {
        userId,
        permissionId,
        scope: scope || PermissionScope.PLATFORM,
        targetResourceId,
      },
    });

    if (!result.isValid) {
      // 收集错误信息
      const errorMessages = result.errors
        .map((e) => `${e.field}: ${e.message}`)
        .join("; ");
      throw new Error(`权限分配验证失败: ${errorMessages}`);
    }

    // 2. 执行业务逻辑
    // TODO: 从仓储加载权限
    // const permission = await this.permissionRepository.findById(permissionId);
    // permission.assignToUser(userId);
    // await this.permissionRepository.save(permission);
  }

  /**
   * 撤销用户权限
   * @param permissionId - 权限ID
   * @param userId - 用户ID
   */
  public async revokePermissionFromUser(
    permissionId: GenericEntityId,
    userId: GenericEntityId,
  ): Promise<void> {
    // TODO: 从仓储加载权限
    // const permission = await this.permissionRepository.findById(permissionId);
    // permission.revokeFromUser(userId);
    // await this.permissionRepository.save(permission);
  }

  /**
   * 检查用户是否有权限
   * @param userId - 用户ID
   * @param action - 权限操作
   * @param scope - 权限范围
   * @param targetResourceId - 目标资源ID（可选）
   * @returns 是否有权限
   */
  public async checkUserPermission(
    userId: GenericEntityId,
    action: PermissionAction,
    scope: PermissionScope,
    targetResourceId?: GenericEntityId,
  ): Promise<boolean> {
    // 1. 业务规则验证（授权检查）
    const rule = new AuthorizationCheckBusinessRule();
    const ruleResult = rule.validate({
      operation: "authorization_check",
      authorizationData: {
        userId,
        action,
        scope,
        targetResourceId,
      },
    });

    if (!ruleResult.isValid) {
      return false;
    }

    // 2. 使用规格模式检查用户权限
    // TODO: 从仓储加载用户
    // const user = await this.userRepository.findById(userId);
    // const spec = new UserPermissionSpecification();
    // const hasPermission = spec.isSatisfiedBy({
    //   user,
    //   requiredPermission: { action, scope }
    // });

    // 临时实现（TODO: 实现完整的权限查询逻辑）
    return false;
  }
}
