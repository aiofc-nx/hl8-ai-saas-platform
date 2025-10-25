/**
 * 角色数据库实体
 *
 * @description 角色的数据库实体定义，使用MikroORM装饰器
 * @since 1.0.0
 */

import { Entity, PrimaryKey, Property, Enum, Index } from "@mikro-orm/core";

/**
 * 角色类型枚举
 */
export enum RoleType {
  SYSTEM = "SYSTEM",
  CUSTOM = "CUSTOM",
  TEMPLATE = "TEMPLATE",
}

/**
 * 角色状态枚举
 */
export enum RoleStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DEPRECATED = "DEPRECATED",
}

/**
 * 角色级别枚举
 */
export enum RoleLevel {
  PLATFORM = "PLATFORM",
  TENANT = "TENANT",
  ORGANIZATION = "ORGANIZATION",
  DEPARTMENT = "DEPARTMENT",
  USER = "USER",
}

/**
 * 角色实体
 *
 * @description MikroORM实体定义，映射到roles表
 */
@Entity({ tableName: "roles" })
export class RoleEntity {
  /** 角色ID */
  @PrimaryKey({ type: "uuid" })
  id!: string;

  /** 租户ID */
  @Property({ type: "uuid" })
  @Index()
  tenantId!: string;

  /** 组织ID */
  @Property({ type: "uuid", nullable: true })
  @Index()
  organizationId?: string;

  /** 部门ID */
  @Property({ type: "uuid", nullable: true })
  @Index()
  departmentId?: string;

  /** 角色名称 */
  @Property({ type: "varchar", length: 255 })
  name!: string;

  /** 角色描述 */
  @Property({ type: "text", nullable: true })
  description?: string;

  /** 角色级别 */
  @Enum(() => String)
  level!: RoleLevel;

  /** 角色类型 */
  @Enum(() => String)
  type!: RoleType;

  /** 角色状态 */
  @Enum(() => String)
  status!: RoleStatus;

  /** 权限（JSON数组格式） */
  @Property({ type: "json", nullable: true })
  permissions?: string[];

  /** 继承的角色（JSON数组格式） */
  @Property({ type: "json", nullable: true })
  inheritedRoles?: string[];

  /** 是否为默认角色 */
  @Property({ type: "boolean", default: false })
  isDefault!: boolean;

  /** 是否为系统角色 */
  @Property({ type: "boolean", default: false })
  isSystem!: boolean;

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
  constructor(data?: Partial<RoleEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * 更新角色状态
   * @param status - 新状态
   */
  updateStatus(status: RoleStatus): void {
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
