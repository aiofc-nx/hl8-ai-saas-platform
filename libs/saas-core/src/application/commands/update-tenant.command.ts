import { BaseCommand } from "@hl8/application-kernel";
import { IsolationContext } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel"";
import { TenantName } from "../../domain/value-objects/tenant-name.vo.js";
import { TenantType } from "../../domain/value-objects/tenant-type.vo.js";

/**
 * 更新租户命令
 *
 * @description 用于更新现有租户信息的命令对象
 * @since 1.0.0
 */
export class UpdateTenantCommand extends BaseCommand {
  /**
   * 创建更新租户命令
   *
   * @param tenantId - 租户ID
   * @param name - 新的租户名称（可选）
   * @param type - 新的租户类型（可选）
   * @param tenantDescription - 新的租户描述（可选）
   * @param updatedBy - 更新者ID（可选）
   * @param isolationContext - 隔离上下文（可选）
   */
  constructor(
    public readonly tenantId: TenantId,
    public readonly name?: TenantName,
    public readonly type?: TenantType,
    public readonly tenantDescription?: string,
    public readonly updatedBy?: string,
    isolationContext?: IsolationContext,
  ) {
    super("UpdateTenantCommand", "更新租户命令", isolationContext);
  }
}
