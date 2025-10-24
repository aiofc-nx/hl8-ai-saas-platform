import { BaseCommand } from "@hl8/application-kernel";
import { TenantId } from "../../domain/value-objects/tenant-id.vo.js";
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
   * @param description - 新的租户描述（可选）
   * @param updatedBy - 更新者ID
   */
  constructor(
    public readonly tenantId: TenantId,
    public readonly name?: TenantName,
    public readonly type?: TenantType,
    public readonly description?: string,
    public readonly updatedBy?: string,
  ) {
    super();
  }

  /**
   * 获取命令类型
   *
   * @returns 命令类型
   */
  getCommandType(): string {
    return "UpdateTenant";
  }

  /**
   * 获取命令数据
   *
   * @returns 命令数据
   */
  getCommandData(): Record<string, unknown> {
    return {
      tenantId: this.tenantId.getValue(),
      name: this.name?.getValue(),
      type: this.type?.getValue(),
      description: this.description,
      updatedBy: this.updatedBy,
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

    // 至少需要更新一个字段
    if (!this.name && !this.type && !this.description) {
      throw new Error("至少需要提供一个要更新的字段");
    }
  }
}
