/**
 * 组织数据库实体
 *
 * @description 组织的数据库实体定义，使用MikroORM装饰器
 * @since 1.0.0
 */

import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  ManyToOne,
  Index,
} from "@mikro-orm/core";

/**
 * 组织类型枚举
 */
export enum OrganizationType {
  COMPANY = "COMPANY",
  DEPARTMENT = "DEPARTMENT",
  TEAM = "TEAM",
  PROJECT = "PROJECT",
}

/**
 * 组织状态枚举
 */
export enum OrganizationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

/**
 * 组织实体
 *
 * @description MikroORM实体定义，映射到organizations表
 */
@Entity({ tableName: "organizations" })
export class OrganizationEntity {
  /** 组织ID */
  @PrimaryKey({ type: "uuid" })
  id!: string;

  /** 租户ID */
  @Property({ type: "uuid" })
  @Index()
  tenantId!: string;

  /** 组织名称 */
  @Property({ type: "varchar", length: 255 })
  name!: string;

  /** 组织类型 */
  @Enum(() => String)
  type!: OrganizationType;

  /** 组织状态 */
  @Enum(() => String)
  status!: OrganizationStatus;

  /** 描述 */
  @Property({ type: "text", nullable: true })
  description?: string;

  /** 父组织ID */
  @Property({ type: "uuid", nullable: true })
  @Index()
  parentId?: string;

  /** 层级 */
  @Property({ type: "int", default: 1 })
  level!: number;

  /** 路径 */
  @Property({ type: "varchar", length: 500, nullable: true })
  path?: string;

  /** 设置（JSON格式） */
  @Property({ type: "json", nullable: true })
  settings?: Record<string, any>;

  /** 元数据（JSON格式） */
  @Property({ type: "json", nullable: true })
  metadata?: Record<string, any>;

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
  constructor(data?: Partial<OrganizationEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * 更新组织状态
   * @param status - 新状态
   */
  updateStatus(status: OrganizationStatus): void {
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
