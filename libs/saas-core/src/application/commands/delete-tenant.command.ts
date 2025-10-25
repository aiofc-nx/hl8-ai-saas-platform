import { BaseCommand } from "@hl8/application-kernel";
import { TenantId } from "../../domain/value-objects/tenant-id.vo.js";

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
   * @param deletedBy - 删除者ID
   */
  constructor(
    public readonly tenantId: TenantId,
    public readonly reason?: string,
    public readonly deletedBy?: string,
  ) {
    super();
  }

  /**
   * 获取命令类型
   *
   * @returns 命令类型
   */
  getCommandType(): string {
    return "DeleteTenant";
  }

  /**
   * 获取命令数据
   *
   * @returns 命令数据
   */
  getCommandData(): Record<string, unknown> {
    return {
      tenantId: this.tenantId.getValue(),
      reason: this.reason,
      deletedBy: this.deletedBy,
    };
  }

  /**
   * 验证命令
   *
   * @throws {Error} 当命令无效时抛出错误
   */
  validate(): void {
    if (!this.tenantId) {
      throw new Error("租户ID不能为空");
    }

    if (!this.deletedBy) {
      throw new Error("删除者ID不能为空");
    }
  }
}
