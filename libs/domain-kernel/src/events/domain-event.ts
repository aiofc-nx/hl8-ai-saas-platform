/**
 * 领域事件基类
 * @description 定义领域事件的标准结构
 */
import { EntityId } from "../value-objects/entity-id.vo.js";
import { IsolationContext } from "../isolation/isolation-context.js";

/**
 * 领域事件基类
 */
export abstract class DomainEvent {
  constructor(
    public readonly eventId: EntityId,
    public readonly occurredAt: Date,
    public readonly aggregateId: EntityId,
    public readonly version: number,
    public readonly isolationContext: IsolationContext,
  ) {}
}
