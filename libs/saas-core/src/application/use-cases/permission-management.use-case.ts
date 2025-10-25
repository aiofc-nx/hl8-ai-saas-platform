import { BaseUseCase } from "@hl8/application-kernel";
import { UserId } from "../../domain/value-objects/user-id.vo.js";
import { RoleId } from "../../domain/value-objects/role-id.vo.js";
import { IsolationContext } from "../../domain/value-objects/isolation-context.vo.js";
import { CaslAbility } from "../../domain/entities/casl-ability.entity.js";
import { CaslAbilityFactory } from "../../infrastructure/casl/casl-ability.factory.js";

/**
 * 权限分配命令
 *
 * @description 权限分配的命令对象
 * @since 1.0.0
 */
export interface AssignPermissionCommand {
  userId: UserId;
  roleId?: RoleId;
  subject: string;
  action: string;
  context: IsolationContext;
  conditions?: unknown[];
}

/**
 * 权限管理用例
 *
 * @description 处理权限管理的业务用例
 * @since 1.0.0
 */
export class PermissionManagementUseCase extends BaseUseCase<
  AssignPermissionCommand,
  CaslAbility
> {
  constructor(private readonly caslAbilityFactory: CaslAbilityFactory) {
    super("PermissionManagementUseCase", "处理权限管理的业务用例", "1.0.0", [
      "permission:assign",
    ]);
  }

  /**
   * 执行用例逻辑
   *
   * @param command - 权限分配命令
   * @param _context - 用例执行上下文
   * @returns CASL权限能力实体
   * @throws {Error} 当用例执行失败时抛出错误
   */
  protected async executeUseCase(
    command: AssignPermissionCommand,
    _context: unknown,
  ): Promise<CaslAbility> {
    try {
      // 验证命令
      this.validateCommand(command);

      // 创建CASL权限能力
      const ability = CaslAbilityFactory.createAbility(
        command.userId,
        command.subject,
        command.action,
        command.context,
        command.roleId,
        command.conditions || [],
      );

      // TODO: 保存权限能力到仓储
      // await this.caslAbilityRepository.save(ability, command.context);

      return ability;
    } catch (error) {
      throw new Error(
        `权限分配失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 验证命令
   *
   * @param command - 权限分配命令
   * @throws {Error} 当命令无效时抛出错误
   */
  private validateCommand(command: AssignPermissionCommand): void {
    if (!command.userId) {
      throw new Error("用户ID不能为空");
    }

    if (!command.subject) {
      throw new Error("权限主体不能为空");
    }

    if (!command.action) {
      throw new Error("操作类型不能为空");
    }

    if (!command.context) {
      throw new Error("隔离上下文不能为空");
    }
  }
}
