/**
 * 实体相关类型定义
 *
 * @description 定义实体相关的类型和接口
 * @since 1.0.0
 */

import { EntityId } from "@hl8/isolation-model";
import { IAuditInfo, IPartialAuditInfo } from "./common.types.js";

/**
 * 实体基础接口
 */
export interface IEntity {
  /** 实体ID */
  id: EntityId;
  /** 审计信息 */
  auditInfo: IAuditInfo;
  /** 是否已删除 */
  isDeleted: boolean;
  /** 删除时间 */
  deletedAt?: Date;
  /** 删除者 */
  deletedBy?: string;
}

/**
 * 实体工厂接口
 */
export interface IEntityFactory<T> {
  /**
   * 创建实体
   */
  create(props: unknown, auditInfo: IPartialAuditInfo): T;
}

/**
 * 实体验证器接口
 */
export interface IEntityValidator<T> {
  /**
   * 验证实体
   */
  validate(entity: T): boolean;
  /**
   * 获取验证错误
   */
  getValidationErrors(entity: T): string[];
}
