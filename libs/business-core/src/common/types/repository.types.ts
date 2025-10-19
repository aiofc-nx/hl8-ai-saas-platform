/**
 * 仓储相关类型定义
 *
 * @description 定义仓储相关的类型和接口
 * @since 1.0.0
 */

import { EntityId } from "@hl8/isolation-model";
import { IPaginatedResult, IQueryOptions } from "./common.types.js";

/**
 * 基础仓储接口
 */
export interface IRepository<T, ID = EntityId> {
  /**
   * 根据ID查找实体
   */
  findById(id: ID): Promise<T | null>;
  /**
   * 查找所有实体
   */
  findAll(): Promise<T[]>;
  /**
   * 分页查询实体
   */
  findPaginated(options: IQueryOptions): Promise<IPaginatedResult<T>>;
  /**
   * 保存实体
   */
  save(entity: T): Promise<T>;
  /**
   * 批量保存实体
   */
  saveMany(entities: T[]): Promise<T[]>;
  /**
   * 更新实体
   */
  update(entity: T): Promise<T>;
  /**
   * 批量更新实体
   */
  updateMany(entities: T[]): Promise<T[]>;
  /**
   * 删除实体
   */
  delete(id: ID): Promise<void>;
  /**
   * 批量删除实体
   */
  deleteMany(ids: ID[]): Promise<void>;
  /**
   * 软删除实体
   */
  softDelete(id: ID): Promise<void>;
  /**
   * 批量软删除实体
   */
  softDeleteMany(ids: ID[]): Promise<void>;
  /**
   * 检查实体是否存在
   */
  exists(id: ID): Promise<boolean>;
  /**
   * 统计实体数量
   */
  count(): Promise<number>;
  /**
   * 根据条件统计实体数量
   */
  countByCondition(condition: Record<string, unknown>): Promise<number>;
}

/**
 * 聚合根仓储接口
 */
export interface IAggregateRepository<T, ID = EntityId>
  extends IRepository<T, ID> {
  /**
   * 根据ID查找聚合根
   */
  findAggregateById(id: ID): Promise<T | null>;
  /**
   * 保存聚合根
   */
  saveAggregate(aggregate: T): Promise<T>;
  /**
   * 更新聚合根
   */
  updateAggregate(aggregate: T): Promise<T>;
  /**
   * 删除聚合根
   */
  deleteAggregate(id: ID): Promise<void>;
}

/**
 * 事件存储仓储接口
 */
export interface IEventStoreRepository {
  /**
   * 保存事件
   */
  saveEvent(streamId: string, event: unknown, version: number): Promise<void>;
  /**
   * 获取事件流
   */
  getEvents(streamId: string, fromVersion?: number): Promise<unknown[]>;
  /**
   * 获取事件流版本
   */
  getStreamVersion(streamId: string): Promise<number>;
  /**
   * 检查事件流是否存在
   */
  streamExists(streamId: string): Promise<boolean>;
  /**
   * 删除事件流
   */
  deleteStream(streamId: string): Promise<void>;
}

/**
 * 读模型仓储接口
 */
export interface IReadModelRepository<T, ID = EntityId> {
  /**
   * 根据ID查找读模型
   */
  findById(id: ID): Promise<T | null>;
  /**
   * 查找所有读模型
   */
  findAll(): Promise<T[]>;
  /**
   * 分页查询读模型
   */
  findPaginated(options: IQueryOptions): Promise<IPaginatedResult<T>>;
  /**
   * 保存读模型
   */
  save(model: T): Promise<T>;
  /**
   * 批量保存读模型
   */
  saveMany(models: T[]): Promise<T[]>;
  /**
   * 更新读模型
   */
  update(model: T): Promise<T>;
  /**
   * 删除读模型
   */
  delete(id: ID): Promise<void>;
  /**
   * 批量删除读模型
   */
  deleteMany(ids: ID[]): Promise<void>;
  /**
   * 重建读模型
   */
  rebuild(): Promise<void>;
}
