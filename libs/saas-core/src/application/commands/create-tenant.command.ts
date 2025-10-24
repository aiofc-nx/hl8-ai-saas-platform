import { BaseCommand } from "@hl8/application-kernel";
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
   * @param createdBy - 创建者ID
   */
  constructor(
    public readonly code: TenantCode,
    public readonly name: TenantName,
    public readonly type: TenantType,
    public readonly description?: string,
    public readonly createdBy?: string,
  ) {
    super();
  }

  /**
   * 获取命令类型
   *
   * @returns 命令类型
   */
  getCommandType(): string {
    return "CreateTenant";
  }

  /**
   * 获取命令数据
   *
   * @returns 命令数据
   */
  getCommandData(): Record<string, unknown> {
    return {
      code: this.code.getValue(),
      name: this.name.getValue(),
      type: this.type.getValue(),
      description: this.description,
      createdBy: this.createdBy,
    };
  }

  /**
   * 验证命令
   *
   * @throws {Error} 当命令无效时抛出错误
   */
  validate(): void {
    if (!this.code) {
      throw new Error("租户代码不能为空");
    }

    if (!this.name) {
      throw new Error("租户名称不能为空");
    }

    if (!this.type) {
      throw new Error("租户类型不能为空");
    }
  }
}
