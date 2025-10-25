/**
 * 部门数据库实体
 *
 * @description 部门的数据库实体定义，使用MikroORM装饰器
 * @since 1.0.0
 */

import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
} from "@mikro-orm/core";

/**
 * 部门实体
 *
 * @description MikroORM实体定义，映射到departments表
 */
@Entity({ tableName: "departments" })
export class DepartmentEntity {
  /** 部门ID */
  @PrimaryKey({ type: "uuid" })
  id!: string;

  /** 租户ID */
  @Property({ type: "uuid" })
  @Index()
  tenantId!: string;

  /** 组织ID */
  @Property({ type: "uuid" })
  @Index()
  organizationId!: string;

  /** 部门名称 */
  @Property({ type: "varchar", length: 255 })
  name!: string;

  /** 部门代码 */
  @Property({ type: "varchar", length: 100 })
  @Index()
  code!: string;

  /** 父部门ID */
  @Property({ type: "uuid", nullable: true })
  @Index()
  parentId?: string;

  /** 层级 */
  @Property({ type: "int", default: 1 })
  level!: number;

  /** 路径 */
  @Property({ type: "varchar", length: 500, nullable: true })
  path?: string;

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
  constructor(data?: Partial<DepartmentEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * 更新版本号
   */
  incrementVersion(): void {
    this.version += 1;
    this.updatedAt = new Date();
  }
}
