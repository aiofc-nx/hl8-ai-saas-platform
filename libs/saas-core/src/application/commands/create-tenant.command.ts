import { BaseCommand } from "@hl8/application-kernel";
import { IsolationContext } from "@hl8/domain-kernel";
import { TenantCode } from "../../domain/value-objects/tenant-code.vo.js";
import { TenantName } from "../../domain/value-objects/tenant-name.vo.js";
import { TenantType } from "../../domain/value-objects/tenant-type.vo.js";

/**
 * 创建租户命令
 *
 * @description 用于创建新租户的命令对象
 * @since 1.0.0
 */
export class CreateTenantCommand extends BaseCommand {
  /**
   * 创建创建租户命令
   *
   * @param code - 租户代码
   * @param name - 租户名称
   * @param type - 租户类型
   * @param description - 租户描述（可选）
   * @param createdBy - 创建者ID（可选）
   * @param isolationContext - 隔离上下文（可选）
   */
  constructor(
    public readonly code: TenantCode,
    public readonly name: TenantName,
    public readonly type: TenantType,
    public readonly description?: string,
    public readonly createdBy?: string,
    isolationContext?: IsolationContext,
  ) {
    super("CreateTenantCommand", "创建租户命令", isolationContext);
  }

}
