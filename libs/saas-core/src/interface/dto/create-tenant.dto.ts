import { IsString, IsOptional, IsEnum, IsNotEmpty } from "class-validator";
import { TenantTypeEnum } from "../../domain/value-objects/tenant-type.vo.js";

/**
 * 创建租户DTO
 *
 * @description 用于创建租户的传输对象
 * @since 1.0.0
 */
export class CreateTenantDto {
  /**
   * 租户代码
   *
   * @description 租户的唯一标识代码
   * @example "tenant_001"
   */
  @IsString()
  @IsNotEmpty()
  code!: string;

  /**
   * 租户名称
   *
   * @description 租户的显示名称
   * @example "示例租户"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /**
   * 租户类型
   *
   * @description 租户的类型枚举
   * @example "ENTERPRISE"
   */
  @IsEnum(TenantTypeEnum)
  type!: TenantTypeEnum;

  /**
   * 租户描述
   *
   * @description 租户的详细描述信息
   * @example "这是一个示例租户"
   */
  @IsString()
  @IsOptional()
  description?: string;
}
