import { IsString, IsOptional, IsEnum } from "class-validator";
import { TenantTypeEnum } from "../../domain/value-objects/tenant-type.vo.js";

/**
 * 更新租户DTO
 *
 * @description 用于更新租户的传输对象
 * @since 1.0.0
 */
export class UpdateTenantDto {
  /**
   * 租户名称
   *
   * @description 租户的显示名称
   * @example "更新后的租户名称"
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * 租户类型
   *
   * @description 租户的类型枚举
   * @example "ENTERPRISE"
   */
  @IsEnum(TenantTypeEnum)
  @IsOptional()
  type?: TenantTypeEnum;

  /**
   * 租户描述
   *
   * @description 租户的详细描述信息
   * @example "更新后的租户描述"
   */
  @IsString()
  @IsOptional()
  description?: string;
}
