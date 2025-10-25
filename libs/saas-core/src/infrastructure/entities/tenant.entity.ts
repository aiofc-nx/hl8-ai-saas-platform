/**
 * 租户数据库实体
 *
 * @description 租户的数据库实体定义，使用MikroORM装饰器
 * @since 1.0.0
 */

import { Entity, PrimaryKey, Property, Enum } from "@mikro-orm/core";

/**
 * 租户类型枚举
 */
export enum TenantType {
  FREE = "FREE",
  BASIC = "BASIC",
  PROFESSIONAL = "PROFESSIONAL",
  ENTERPRISE = "ENTERPRISE",
  CUSTOM = "CUSTOM",
}

/**
 * 租户状态枚举
 */
export enum TenantStatus {
  TRIAL = "TRIAL",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  EXPIRED = "EXPIRED",
  DELETED = "DELETED",
}

/**
 * 租户实体
 *
 * @description MikroORM实体定义，映射到tenants表
 */
@Entity({ tableName: "tenants" })
export class TenantEntity {
  /** 租户ID */
  @PrimaryKey({ type: "uuid" })
  id!: string;

  /** 租户代码 */
  @Property({ type: "varchar", length: 100, unique: true })
  code!: string;

  /** 租户名称 */
  @Property({ type: "varchar", length: 255 })
  name!: string;

  /** 租户类型 */
  @Enum(() => String)
  type!: TenantType;

  /** 租户状态 */
  @Enum(() => String)
  status!: TenantStatus;

  /** 描述 */
  @Property({ type: "text", nullable: true })
  description?: string;

  /** 联系邮箱 */
  @Property({ type: "varchar", length: 255, nullable: true })
  contactEmail?: string;

  /** 联系电话 */
  @Property({ type: "varchar", length: 50, nullable: true })
  contactPhone?: string;

  /** 地址 */
  @Property({ type: "text", nullable: true })
  address?: string;

  /** 订阅开始日期 */
  @Property({ type: "datetime", nullable: true })
  subscriptionStartDate?: Date;

  /** 订阅结束日期 */
  @Property({ type: "datetime", nullable: true })
  subscriptionEndDate?: Date;

  /** 设置（JSON格式） */
  @Property({ type: "json", nullable: true })
  settings?: Record<string, any>;

  /** 创建时间 */
  @Property({ type: "datetime", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  /** 更新时间 */
  @Property({
    type: "datetime",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  /** 版本号（用于乐观锁） */
  @Property({ type: "int", default: 0 })
  version!: number;

  /**
   * 构造函数
   * @param data - 实体数据
   */
  constructor(data?: Partial<TenantEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * 更新租户状态
   * @param status - 新状态
   */
  updateStatus(status: TenantStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  /**
   * 更新版本号
   */
  incrementVersion(): void {
    this.version += 1;
    this.updatedAt = new Date();
  }
}
