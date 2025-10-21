/**
 * 事件总线接口
 *
 * 提供事件发布和订阅功能
 * 支持领域事件的发布和订阅模式
 *
 * @since 1.0.0
 */
import { DomainEvent } from "./domain-event.interface.js";

/**
 * 事件处理器类型
 */
export type EventHandler = (event: DomainEvent) => Promise<void> | void;

/**
 * 事件总线接口
 *
 * 提供统一的事件发布和订阅机制
 * 支持领域事件的异步处理
 */
export interface IEventBus {
  /**
   * 发布单个事件
   *
   * @param event - 要发布的事件
   * @returns Promise<void>
   */
  publish(event: DomainEvent): Promise<void>;

  /**
   * 发布多个事件
   *
   * @param events - 要发布的事件数组
   * @returns Promise<void>
   */
  publishAll(events: DomainEvent[]): Promise<void>;

  /**
   * 订阅事件类型
   *
   * @param eventType - 事件类型
   * @param handler - 事件处理器
   */
  subscribe(eventType: string, handler: EventHandler): void;

  /**
   * 取消订阅事件类型
   *
   * @param eventType - 事件类型
   * @param handler - 事件处理器
   */
  unsubscribe(eventType: string, handler: EventHandler): void;
}
