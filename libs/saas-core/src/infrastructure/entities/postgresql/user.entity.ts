/**
 * 用户数据库实体
 *
 * @description 用户的数据库实体定义，使用MikroORM装饰器
 * @since 1.0.0
 */

import { Entity, PrimaryKey, Property, Enum, Index } from "@mikro-orm/core";

/**
 * 用户类型枚举
 */
export enum UserType {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  USER = "USER",
  GUEST = "GUEST",
  SYSTEM = "SYSTEM",
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
  LOCKED = "LOCKED",
}

/**
 * 用户实体
 *
 * @description MikroORM实体定义，映射到users表
 */
@Entity({ tableName: "users" })
export class UserEntity {
  /** 用户ID */
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

  /** 邮箱 */
  @Property({ type: "varchar", length: 255 })
  @Index()
  email!: string;

  /** 用户名 */
  @Property({ type: "varchar", length: 100, unique: true })
  username!: string;

  /** 显示名称 */
  @Property({ type: "varchar", length: 255 })
  displayName!: string;

  /** 用户类型 */
  @Enum(() => String)
  type!: UserType;

  /** 用户状态 */
  @Enum(() => String)
  status!: UserStatus;

  /** 名 */
  @Property({ type: "varchar", length: 100, nullable: true })
  firstName?: string;

  /** 姓 */
  @Property({ type: "varchar", length: 100, nullable: true })
  lastName?: string;

  /** 电话 */
  @Property({ type: "varchar", length: 50, nullable: true })
  phone?: string;

  /** 头像URL */
  @Property({ type: "varchar", length: 500, nullable: true })
  avatar?: string;

  /** 时区 */
  @Property({ type: "varchar", length: 50, nullable: true })
  timezone?: string;

  /** 语言 */
  @Property({ type: "varchar", length: 10, nullable: true })
  language?: string;

  /** 密码哈希 */
  @Property({ type: "varchar", length: 255, nullable: true })
  passwordHash?: string;

  /** 邮箱是否已验证 */
  @Property({ type: "boolean", default: false })
  emailVerified!: boolean;

  /** 电话是否已验证 */
  @Property({ type: "boolean", default: false })
  phoneVerified!: boolean;

  /** 是否启用双因素认证 */
  @Property({ type: "boolean", default: false })
  twoFactorEnabled!: boolean;

  /** 最后登录时间 */
  @Property({ type: "datetime", nullable: true })
  lastLoginAt?: Date;

  /** 角色（JSON数组格式） */
  @Property({ type: "json", nullable: true })
  roles?: string[];

  /** 权限（JSON数组格式） */
  @Property({ type: "json", nullable: true })
  permissions?: string[];

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
  constructor(data?: Partial<UserEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * 更新用户状态
   * @param status - 新状态
   */
  updateStatus(status: UserStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  /**
   * 更新最后登录时间
   */
  updateLastLogin(): void {
    this.lastLoginAt = new Date();
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
