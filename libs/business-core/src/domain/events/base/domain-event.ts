/**
 * 领域事件导出模块
 *
 * @description 导出领域事件相关的所有公共API
 * @since 1.0.0
 */

// 导出基础事件类
export { BaseDomainEvent as DomainEvent } from "./base-domain-event.js";

// 导出事件接口
export type {
  IDomainEvent,
  EventMetadata,
  IDomainEventHandler,
  IDomainEventBus,
  IDomainEventStore,
} from "./domain-event.interface.js";

// 导出事件类型和枚举
export {
  DomainExceptionType,
  DomainExceptionSeverity,
} from "../../exceptions/base/base-domain-exception.js";
