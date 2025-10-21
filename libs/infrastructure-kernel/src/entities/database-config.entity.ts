/**
 * 数据库配置实体
 *
 * @description 数据库配置实体，管理不同数据库的配置参数
 * @since 1.0.0
 */

import { Entity, PrimaryKey, Property, Collection, OneToMany } from '@mikro-orm/core';
import { DatabaseConnectionEntity } from './database-connection.entity.js';

/**
 * 数据库配置实体
 */
@Entity({ tableName: 'database_configs' })
export class DatabaseConfigEntity {
  /** 配置ID */
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  /** 配置名称 */
  @Property({ type: 'varchar', length: 255 })
  name!: string;

  /** 主连接ID */
  @Property({ type: 'uuid' })
  primaryConnection!: string;

  /** 备用连接ID列表 */
  @Property({ type: 'json', default: '[]' })
  secondaryConnections!: string[];

  /** 默认连接ID */
  @Property({ type: 'uuid' })
  defaultConnection!: string;

  /** 是否自动切换 */
  @Property({ type: 'boolean', default: false })
  autoSwitch!: boolean;

  /** 健康检查间隔(秒) */
  @Property({ type: 'int', default: 30 })
  healthCheckInterval!: number;

  /** 重试次数 */
  @Property({ type: 'int', default: 3 })
  retryAttempts!: number;

  /** 重试延迟(毫秒) */
  @Property({ type: 'int', default: 1000 })
  retryDelay!: number;

  /** 创建时间 */
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  /** 更新时间 */
  @Property({ 
    type: 'datetime', 
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date()
  })
  updatedAt!: Date;

  /**
   * 构造函数
   * @param data 配置数据
   */
  constructor(data?: Partial<DatabaseConfigEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * 验证配置
   * @returns 验证结果
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('配置名称不能为空');
    }

    if (!this.primaryConnection) {
      errors.push('主连接ID不能为空');
    }

    if (!this.defaultConnection) {
      errors.push('默认连接ID不能为空');
    }

    if (this.healthCheckInterval <= 0) {
      errors.push('健康检查间隔必须大于0');
    }

    if (this.retryAttempts < 0) {
      errors.push('重试次数不能为负数');
    }

    if (this.retryDelay < 0) {
      errors.push('重试延迟不能为负数');
    }

    // 检查备用连接是否包含主连接
    if (this.secondaryConnections.includes(this.primaryConnection)) {
      errors.push('备用连接不能包含主连接');
    }

    // 检查默认连接是否在主连接或备用连接中
    if (this.defaultConnection !== this.primaryConnection && 
        !this.secondaryConnections.includes(this.defaultConnection)) {
      errors.push('默认连接必须是主连接或备用连接之一');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 添加备用连接
   * @param connectionId 连接ID
   */
  addSecondaryConnection(connectionId: string): void {
    if (!this.secondaryConnections.includes(connectionId)) {
      this.secondaryConnections.push(connectionId);
      this.updatedAt = new Date();
    }
  }

  /**
   * 移除备用连接
   * @param connectionId 连接ID
   */
  removeSecondaryConnection(connectionId: string): void {
    const index = this.secondaryConnections.indexOf(connectionId);
    if (index > -1) {
      this.secondaryConnections.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  /**
   * 获取所有连接ID
   * @returns 所有连接ID列表
   */
  getAllConnectionIds(): string[] {
    return [this.primaryConnection, ...this.secondaryConnections];
  }

  /**
   * 检查连接是否在配置中
   * @param connectionId 连接ID
   * @returns 是否在配置中
   */
  hasConnection(connectionId: string): boolean {
    return this.primaryConnection === connectionId || 
           this.secondaryConnections.includes(connectionId);
  }

  /**
   * 设置默认连接
   * @param connectionId 连接ID
   */
  setDefaultConnection(connectionId: string): void {
    if (this.hasConnection(connectionId)) {
      this.defaultConnection = connectionId;
      this.updatedAt = new Date();
    } else {
      throw new Error('连接ID不在配置中');
    }
  }

  /**
   * 获取配置摘要
   * @returns 配置摘要
   */
  getConfigSummary(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      primaryConnection: this.primaryConnection,
      secondaryConnections: this.secondaryConnections,
      defaultConnection: this.defaultConnection,
      autoSwitch: this.autoSwitch,
      healthCheckInterval: this.healthCheckInterval,
      retryAttempts: this.retryAttempts,
      retryDelay: this.retryDelay,
      totalConnections: this.getAllConnectionIds().length
    };
  }

  /**
   * 更新配置
   * @param updates 更新数据
   */
  updateConfig(updates: Partial<DatabaseConfigEntity>): void {
    Object.assign(this, updates);
    this.updatedAt = new Date();
  }
}
