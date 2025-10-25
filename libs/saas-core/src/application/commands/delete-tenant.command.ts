import { BaseCommand } from "@hl8/application-kernel";
import { IsolationContext, TenantId } from "@hl8/domain-kernel";

/**
 * 删除租户命令
 *
 * @description 用于删除现有租户的命令对象
 * @since 1.0.0
 */
export class DeleteTenantCommand extends BaseCommand {
  /**
   * 创建删除租户命令
   *
   * @param tenantId - 租户ID
   * @param reason - 删除原因（可选）
   * @param deletedBy - 删除者ID（可选）
   * @param isolationContext - 隔离上下文（可选）
   */
  constructor(
    public readonly tenantId: TenantId,
    public readonly reason?: string,
    public readonly deletedBy?: string,
    isolationContext?: IsolationContext,
  ) {
    super("DeleteTenantCommand", "删除租户命令", isolationContext);
  }
}
