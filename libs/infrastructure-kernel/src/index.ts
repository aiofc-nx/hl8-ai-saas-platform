// 基础设施层内核导出入口
// 包含仓储接口、隔离实现、访问控制

// 仓储接口
export type { EventRepository } from "./repositories/event-repository.js";
export type { SnapshotRepository } from "./repositories/snapshot-repository.js";
export type { ReadModelRepository } from "./repositories/read-model-repository.js";

// 隔离实现
export { IsolationContext } from "./isolation/isolation-context.js";

// 访问控制
export { AccessControlService } from "./access-control/access-control.service.js";
