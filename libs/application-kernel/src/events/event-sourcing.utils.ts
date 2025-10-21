/**
 * 事件溯源工具
 *
 * 提供事件溯源的实用工具函数
 * 支持事件存储、快照和重放
 *
 * @since 1.0.0
 */
import { DomainEvent } from "./domain-event.interface.js";
import { EntityId } from "@hl8/domain-kernel";

/**
 * 事件存储接口
 */
export interface IEventStore {
  /**
   * 保存事件
   *
   * @param event - 事件
   * @returns Promise<void>
   */
  saveEvent(event: DomainEvent): Promise<void>;

  /**
   * 保存多个事件
   *
   * @param events - 事件数组
   * @returns Promise<void>
   */
  saveEvents(events: DomainEvent[]): Promise<void>;

  /**
   * 获取聚合根的所有事件
   *
   * @param aggregateId - 聚合根ID
   * @returns Promise<DomainEvent[]>
   */
  getEvents(aggregateId: EntityId): Promise<DomainEvent[]>;

  /**
   * 获取聚合根的事件（从指定版本开始）
   *
   * @param aggregateId - 聚合根ID
   * @param fromVersion - 起始版本
   * @returns Promise<DomainEvent[]>
   */
  getEventsFromVersion(
    aggregateId: EntityId,
    fromVersion: number,
  ): Promise<DomainEvent[]>;

  /**
   * 获取聚合根的事件（指定版本范围）
   *
   * @param aggregateId - 聚合根ID
   * @param fromVersion - 起始版本
   * @param toVersion - 结束版本
   * @returns Promise<DomainEvent[]>
   */
  getEventsInRange(
    aggregateId: EntityId,
    fromVersion: number,
    toVersion: number,
  ): Promise<DomainEvent[]>;
}

/**
 * 快照接口
 */
export interface ISnapshot {
  /**
   * 聚合根ID
   */
  aggregateId: EntityId;

  /**
   * 快照版本
   */
  version: number;

  /**
   * 快照数据
   */
  data: Record<string, any>;

  /**
   * 创建时间
   */
  createdAt: Date;
}

/**
 * 快照存储接口
 */
export interface ISnapshotStore {
  /**
   * 保存快照
   *
   * @param snapshot - 快照
   * @returns Promise<void>
   */
  saveSnapshot(snapshot: ISnapshot): Promise<void>;

  /**
   * 获取快照
   *
   * @param aggregateId - 聚合根ID
   * @returns Promise<ISnapshot | null>
   */
  getSnapshot(aggregateId: EntityId): Promise<ISnapshot | null>;

  /**
   * 获取最新快照
   *
   * @param aggregateId - 聚合根ID
   * @returns Promise<ISnapshot | null>
   */
  getLatestSnapshot(aggregateId: EntityId): Promise<ISnapshot | null>;
}

/**
 * 事件溯源工具类
 *
 * 提供事件溯源的实用工具函数
 */
export class EventSourcingUtils {
  /**
   * 重放事件
   *
   * @param events - 事件数组
   * @param initialState - 初始状态
   * @param eventHandler - 事件处理器
   * @returns 最终状态
   */
  static async replayEvents<T>(
    events: DomainEvent[],
    initialState: T,
    eventHandler: (state: T, event: DomainEvent) => T,
  ): Promise<T> {
    let currentState = initialState;

    // 按版本排序事件
    const sortedEvents = events.sort((a, b) => a.version - b.version);

    for (const event of sortedEvents) {
      currentState = eventHandler(currentState, event);
    }

    return currentState;
  }

  /**
   * 重放事件到指定版本
   *
   * @param events - 事件数组
   * @param initialState - 初始状态
   * @param eventHandler - 事件处理器
   * @param targetVersion - 目标版本
   * @returns 指定版本的状态
   */
  static async replayEventsToVersion<T>(
    events: DomainEvent[],
    initialState: T,
    eventHandler: (state: T, event: DomainEvent) => T,
    targetVersion: number,
  ): Promise<T> {
    let currentState = initialState;

    // 按版本排序事件
    const sortedEvents = events
      .filter((event) => event.version <= targetVersion)
      .sort((a, b) => a.version - b.version);

    for (const event of sortedEvents) {
      currentState = eventHandler(currentState, event);
    }

    return currentState;
  }

  /**
   * 创建快照
   *
   * @param aggregateId - 聚合根ID
   * @param version - 版本
   * @param data - 数据
   * @returns 快照
   */
  static createSnapshot(
    aggregateId: EntityId,
    version: number,
    data: Record<string, any>,
  ): ISnapshot {
    return {
      aggregateId,
      version,
      data,
      createdAt: new Date(),
    };
  }

  /**
   * 从快照恢复状态
   *
   * @param snapshot - 快照
   * @param eventStore - 事件存储
   * @param eventHandler - 事件处理器
   * @returns 恢复的状态
   */
  static async restoreFromSnapshot<T>(
    snapshot: ISnapshot,
    eventStore: IEventStore,
    eventHandler: (state: T, event: DomainEvent) => T,
  ): Promise<T> {
    // 从快照版本开始获取事件
    const events = await eventStore.getEventsFromVersion(
      snapshot.aggregateId,
      snapshot.version + 1,
    );

    // 从快照状态开始重放事件
    return this.replayEvents(events, snapshot.data as T, eventHandler);
  }

  /**
   * 获取聚合根状态
   *
   * @param aggregateId - 聚合根ID
   * @param eventStore - 事件存储
   * @param snapshotStore - 快照存储
   * @param eventHandler - 事件处理器
   * @param initialState - 初始状态
   * @returns 聚合根状态
   */
  static async getAggregateState<T>(
    aggregateId: EntityId,
    eventStore: IEventStore,
    snapshotStore: ISnapshotStore,
    eventHandler: (state: T, event: DomainEvent) => T,
    initialState: T,
  ): Promise<T> {
    // 尝试获取最新快照
    const snapshot = await snapshotStore.getLatestSnapshot(aggregateId);

    if (snapshot) {
      // 从快照恢复
      return this.restoreFromSnapshot(snapshot, eventStore, eventHandler);
    } else {
      // 从所有事件重放
      const events = await eventStore.getEvents(aggregateId);
      return this.replayEvents(events, initialState, eventHandler);
    }
  }

  /**
   * 保存事件并创建快照
   *
   * @param events - 事件数组
   * @param eventStore - 事件存储
   * @param snapshotStore - 快照存储
   * @param snapshotInterval - 快照间隔
   * @returns 保存结果
   */
  static async saveEventsWithSnapshot(
    events: DomainEvent[],
    eventStore: IEventStore,
    snapshotStore: ISnapshotStore,
    snapshotInterval: number = 100,
  ): Promise<{
    eventsSaved: number;
    snapshotsCreated: number;
  }> {
    let eventsSaved = 0;
    let snapshotsCreated = 0;

    // 保存事件
    await eventStore.saveEvents(events);
    eventsSaved = events.length;

    // 按聚合根分组事件
    const eventsByAggregate = new Map<string, DomainEvent[]>();
    for (const event of events) {
      const aggregateId = event.aggregateId.getValue();
      if (!eventsByAggregate.has(aggregateId)) {
        eventsByAggregate.set(aggregateId, []);
      }
      eventsByAggregate.get(aggregateId)!.push(event);
    }

    // 为每个聚合根检查是否需要创建快照
    for (const [_aggregateId, aggregateEvents] of eventsByAggregate) {
      const latestEvent = aggregateEvents.reduce((latest, current) =>
        current.version > latest.version ? current : latest,
      );

      if (latestEvent.version % snapshotInterval === 0) {
        const snapshot = this.createSnapshot(
          latestEvent.aggregateId,
          latestEvent.version,
          latestEvent.eventData,
        );

        await snapshotStore.saveSnapshot(snapshot);
        snapshotsCreated++;
      }
    }

    return {
      eventsSaved,
      snapshotsCreated,
    };
  }

  /**
   * 验证事件序列
   *
   * @param events - 事件数组
   * @returns 验证结果
   */
  static validateEventSequence(events: DomainEvent[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (events.length === 0) {
      return { isValid: true, errors: [] };
    }

    // 按聚合根分组
    const eventsByAggregate = new Map<string, DomainEvent[]>();
    for (const event of events) {
      const aggregateId = event.aggregateId.getValue();
      if (!eventsByAggregate.has(aggregateId)) {
        eventsByAggregate.set(aggregateId, []);
      }
      eventsByAggregate.get(aggregateId)!.push(event);
    }

    // 验证每个聚合根的事件序列
    for (const [aggregateId, aggregateEvents] of eventsByAggregate) {
      const sortedEvents = aggregateEvents.sort(
        (a, b) => a.version - b.version,
      );

      for (let i = 0; i < sortedEvents.length; i++) {
        const currentEvent = sortedEvents[i];
        const expectedVersion = i + 1;

        if (currentEvent.version !== expectedVersion) {
          errors.push(
            `聚合根 ${aggregateId} 的事件版本不连续: 期望 ${expectedVersion}, 实际 ${currentEvent.version}`,
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 获取事件统计信息
   *
   * @param events - 事件数组
   * @returns 统计信息
   */
  static getEventStatistics(events: DomainEvent[]): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByAggregate: Record<string, number>;
    versionRange: { min: number; max: number };
    timeRange: { start: Date; end: Date };
  } {
    if (events.length === 0) {
      return {
        totalEvents: 0,
        eventsByType: {},
        eventsByAggregate: {},
        versionRange: { min: 0, max: 0 },
        timeRange: { start: new Date(), end: new Date() },
      };
    }

    const eventsByType: Record<string, number> = {};
    const eventsByAggregate: Record<string, number> = {};
    let minVersion = Number.MAX_SAFE_INTEGER;
    let maxVersion = 0;
    let startTime = new Date();
    let endTime = new Date(0);

    for (const event of events) {
      // 按类型统计
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;

      // 按聚合根统计
      const aggregateId = event.aggregateId.getValue();
      eventsByAggregate[aggregateId] =
        (eventsByAggregate[aggregateId] || 0) + 1;

      // 版本范围
      minVersion = Math.min(minVersion, event.version);
      maxVersion = Math.max(maxVersion, event.version);

      // 时间范围
      if (event.occurredAt < startTime) {
        startTime = event.occurredAt;
      }
      if (event.occurredAt > endTime) {
        endTime = event.occurredAt;
      }
    }

    return {
      totalEvents: events.length,
      eventsByType,
      eventsByAggregate,
      versionRange: { min: minVersion, max: maxVersion },
      timeRange: { start: startTime, end: endTime },
    };
  }
}
