/**
 * 领域事件相关类型定义
 *
 * @description 定义领域事件相关的类型和接口
 * @since 1.0.0
 */

import { EntityId } from "@hl8/isolation-model";

/**
 * 领域事件接口
 */
export interface IDomainEvent {
  /** 事件ID */
  eventId: string;
  /** 事件类型 */
  eventType: string;
  /** 聚合根ID */
  aggregateId: EntityId;
  /** 聚合根类型 */
  aggregateType: string;
  /** 事件版本 */
  version: number;
  /** 事件数据 */
  data: Record<string, unknown>;
  /** 事件元数据 */
  metadata: Record<string, unknown>;
  /** 事件时间戳 */
  timestamp: Date;
  /** 事件来源 */
  source: string;
}

/**
 * 命令接口
 */
export interface ICommand {
  /** 命令ID */
  commandId: string;
  /** 命令类型 */
  commandType: string;
  /** 命令数据 */
  data: Record<string, unknown>;
  /** 命令元数据 */
  metadata: Record<string, unknown>;
  /** 命令时间戳 */
  timestamp: Date;
  /** 命令来源 */
  source: string;
}

/**
 * 查询接口
 */
export interface IQuery {
  /** 查询ID */
  queryId: string;
  /** 查询类型 */
  queryType: string;
  /** 查询参数 */
  parameters: Record<string, unknown>;
  /** 查询元数据 */
  metadata: Record<string, unknown>;
  /** 查询时间戳 */
  timestamp: Date;
  /** 查询来源 */
  source: string;
}

/**
 * 命令处理器接口
 */
export interface ICommandHandler<TCommand extends ICommand, TResult = unknown> {
  /**
   * 处理命令
   */
  handle(command: TCommand): Promise<TResult>;
}

/**
 * 查询处理器接口
 */
export interface IQueryHandler<TQuery extends IQuery, TResult = unknown> {
  /**
   * 处理查询
   */
  handle(query: TQuery): Promise<TResult>;
}

/**
 * 事件处理器接口
 */
export interface IEventHandler<TEvent extends IDomainEvent> {
  /**
   * 处理事件
   */
  handle(event: TEvent): Promise<void>;
}

/**
 * 用例接口
 */
export interface IUseCase<TRequest, TResponse> {
  /**
   * 执行用例
   */
  execute(request: TRequest): Promise<TResponse>;
}
