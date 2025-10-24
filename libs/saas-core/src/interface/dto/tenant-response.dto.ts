/**
 * 租户响应DTO
 *
 * @description 用于返回租户信息的传输对象
 * @since 1.0.0
 */
export class TenantResponseDto {
  /**
   * 租户ID
   *
   * @description 租户的唯一标识
   * @example "tenant_001"
   */
  id!: string;

  /**
   * 租户代码
   *
   * @description 租户的唯一标识代码
   * @example "tenant_001"
   */
  code!: string;

  /**
   * 租户名称
   *
   * @description 租户的显示名称
   * @example "示例租户"
   */
  name!: string;

  /**
   * 租户类型
   *
   * @description 租户的类型
   * @example "ENTERPRISE"
   */
  type!: string;

  /**
   * 租户描述
   *
   * @description 租户的详细描述信息
   * @example "这是一个示例租户"
   */
  description?: string;

  /**
   * 租户状态
   *
   * @description 租户的当前状态
   * @example "ACTIVE"
   */
  status!: string;

  /**
   * 创建时间
   *
   * @description 租户创建的时间戳
   * @example "2024-01-01T00:00:00.000Z"
   */
  createdAt!: Date;

  /**
   * 更新时间
   *
   * @description 租户最后更新的时间戳
   * @example "2024-01-01T00:00:00.000Z"
   */
  updatedAt!: Date;

  /**
   * 创建者
   *
   * @description 租户的创建者ID
   * @example "user_001"
   */
  createdBy!: string;

  /**
   * 更新者
   *
   * @description 租户的最后更新者ID
   * @example "user_001"
   */
  updatedBy!: string;
}
