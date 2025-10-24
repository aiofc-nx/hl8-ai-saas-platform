import { CaslAbility } from "../../domain/entities/casl-ability.entity.js";
import { CaslAbilityId } from "../../domain/value-objects/casl-ability-id.vo.js";
import { UserId } from "../../domain/value-objects/user-id.vo.js";
import { RoleId } from "../../domain/value-objects/role-id.vo.js";
import { IsolationContext } from "../../domain/value-objects/isolation-context.vo.js";
import { CaslCondition } from "../../domain/value-objects/casl-condition.vo.js";
import { AuditInfo } from "@hl8/domain-kernel";

/**
 * CASL权限能力工厂
 *
 * @description 用于创建CASL权限能力的工厂类
 * @since 1.0.0
 */
export class CaslAbilityFactory {
  /**
   * 创建CASL权限能力
   *
   * @param userId - 用户ID
   * @param subject - 权限主体
   * @param action - 操作类型
   * @param context - 隔离上下文
   * @param roleId - 角色ID（可选）
   * @param conditions - 权限条件（可选）
   * @returns CASL权限能力实体
   */
  static createAbility(
    userId: UserId,
    subject: string,
    action: string,
    context: IsolationContext,
    roleId?: RoleId,
    conditions: CaslCondition[] = [],
  ): CaslAbility {
    // 生成权限能力ID
    const abilityId = new CaslAbilityId(
      `ability_${userId.getValue()}_${subject}_${action}_${Date.now()}`,
    );

    // 创建审计信息
    const auditInfo = new AuditInfo({
      createdBy: "system",
      createdAt: new Date(),
      updatedBy: "system",
      updatedAt: new Date(),
    });

    // 创建CASL权限能力实体
    return new CaslAbility(
      abilityId,
      userId,
      subject,
      action,
      context,
      roleId,
      conditions,
      auditInfo,
    );
  }

  /**
   * 创建管理权限能力
   *
   * @param userId - 用户ID
   * @param subject - 权限主体
   * @param context - 隔离上下文
   * @param roleId - 角色ID（可选）
   * @returns CASL权限能力实体
   */
  static createManageAbility(
    userId: UserId,
    subject: string,
    context: IsolationContext,
    roleId?: RoleId,
  ): CaslAbility {
    return this.createAbility(userId, subject, "manage", context, roleId);
  }

  /**
   * 创建读取权限能力
   *
   * @param userId - 用户ID
   * @param subject - 权限主体
   * @param context - 隔离上下文
   * @param roleId - 角色ID（可选）
   * @param conditions - 权限条件（可选）
   * @returns CASL权限能力实体
   */
  static createReadAbility(
    userId: UserId,
    subject: string,
    context: IsolationContext,
    roleId?: RoleId,
    conditions: CaslCondition[] = [],
  ): CaslAbility {
    return this.createAbility(
      userId,
      subject,
      "read",
      context,
      roleId,
      conditions,
    );
  }

  /**
   * 创建创建权限能力
   *
   * @param userId - 用户ID
   * @param subject - 权限主体
   * @param context - 隔离上下文
   * @param roleId - 角色ID（可选）
   * @returns CASL权限能力实体
   */
  static createCreateAbility(
    userId: UserId,
    subject: string,
    context: IsolationContext,
    roleId?: RoleId,
  ): CaslAbility {
    return this.createAbility(userId, subject, "create", context, roleId);
  }

  /**
   * 创建更新权限能力
   *
   * @param userId - 用户ID
   * @param subject - 权限主体
   * @param context - 隔离上下文
   * @param roleId - 角色ID（可选）
   * @param conditions - 权限条件（可选）
   * @returns CASL权限能力实体
   */
  static createUpdateAbility(
    userId: UserId,
    subject: string,
    context: IsolationContext,
    roleId?: RoleId,
    conditions: CaslCondition[] = [],
  ): CaslAbility {
    return this.createAbility(
      userId,
      subject,
      "update",
      context,
      roleId,
      conditions,
    );
  }

  /**
   * 创建删除权限能力
   *
   * @param userId - 用户ID
   * @param subject - 权限主体
   * @param context - 隔离上下文
   * @param roleId - 角色ID（可选）
   * @param conditions - 权限条件（可选）
   * @returns CASL权限能力实体
   */
  static createDeleteAbility(
    userId: UserId,
    subject: string,
    context: IsolationContext,
    roleId?: RoleId,
    conditions: CaslCondition[] = [],
  ): CaslAbility {
    return this.createAbility(
      userId,
      subject,
      "delete",
      context,
      roleId,
      conditions,
    );
  }
}
